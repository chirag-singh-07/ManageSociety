import { Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { Society } from '../society/model';
import { User } from '../user/model';
import {
  createSocietySchema,
  updateSocietySchema,
  createUserSchema,
  updateSuperadminUserSchema,
  subscribeSocietySchema,
  updatePasswordSchema,
} from './validators';
import { Superadmin } from './model';
import { writeAuditLog } from '../audit/service';
import { ApiError } from '../../shared/apiError';

export const superadminRouter = Router();

superadminRouter.use(requireAuth(), requireRole('superadmin'));

superadminRouter.post(
  '/societies',
  asyncHandler(async (req, res) => {
    const input = createSocietySchema.parse(req.body);

    let trialEndsAt: Date | null = null;
    if (input.plan && input.months) {
      trialEndsAt = new Date();
      trialEndsAt.setMonth(trialEndsAt.getMonth() + input.months);
    } else {
      trialEndsAt =
        input.trialDays > 0 ? new Date(Date.now() + input.trialDays * 24 * 60 * 60 * 1000) : null;
    }

    const society = await Society.create({
      name: input.name,
      address: input.address ?? '',
      city: input.city ?? '',
      state: input.state ?? '',
      pincode: input.pincode ?? '',
      trialEndsAt,
      plan: input.plan || 'trial',
      status: 'active',
    });

    await writeAuditLog({
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'society.create',
      targetType: 'society',
      targetId: String(society._id),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, society });
  }),
);

superadminRouter.get(
  '/societies',
  asyncHandler(async (_req, res) => {
    const societies = await Society.find({}).sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, societies });
  }),
);

superadminRouter.patch(
  '/societies/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = updateSocietySchema.parse(req.body);
    const society = await Society.findByIdAndUpdate(req.params.id, { $set: input }, { new: true });
    if (!society) throw new ApiError(404, 'NOT_FOUND', 'Society not found');

    await writeAuditLog({
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'society.update',
      targetType: 'society',
      targetId: String(society._id),
      metadata: input,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, society });
  }),
);

superadminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('societyId', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      ok: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }),
);

superadminRouter.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    res.json({ ok: true });
  }),
);

superadminRouter.post(
  '/users',
  asyncHandler(async (req, res) => {
    const input = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      societyId: input.societyId,
      role: input.role,
      userType: input.userType || (input.role === 'admin' ? 'staff' : 'resident'),
      status: 'active',
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || '',
      passwordHash,
    });

    await writeAuditLog({
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'user.create',
      targetType: 'user',
      targetId: String(user._id),
      metadata: { societyId: input.societyId, role: input.role },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, user });
  }),
);

superadminRouter.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = updateSuperadminUserSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(req.params.id, { $set: input }, { new: true });
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

    await writeAuditLog({
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'user.update',
      targetType: 'user',
      targetId: String(user._id),
      metadata: input,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, user });
  }),
);

superadminRouter.post(
  '/societies/:id/subscribe',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = subscribeSocietySchema.parse(req.body);

    const society = await Society.findById(req.params.id);
    if (!society) throw new ApiError(404, 'NOT_FOUND', 'Society not found');

    // Calculate new expiry date
    const currentExpiry =
      society.trialEndsAt && society.trialEndsAt > new Date() ? society.trialEndsAt : new Date();

    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + input.months);

    const updated = await Society.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          plan: input.plan,
          trialEndsAt: newExpiry,
        },
      },
      { new: true },
    );

    // Record the transaction for the earnings page
    const monthPrice: Record<string, number> = { basic: 999, premium: 2499, enterprise: 4999 };
    const price = (monthPrice[input.plan] || 999) * input.months;

    await (
      await import('../billing/model')
    ).Transaction.create({
      societyId: society._id,
      amount: price,
      plan: input.plan,
      months: input.months,
      status: 'completed',
    });

    await writeAuditLog({
      // ... same audit log logic as before ...
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'society.subscribe',
      targetType: 'society',
      targetId: String(society._id),
      metadata: { plan: input.plan, months: input.months, newExpiry, revenue: price },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, society: updated });
  }),
);

superadminRouter.get(
  '/earnings',
  asyncHandler(async (_req, res) => {
    const transactions = await (await import('../billing/model')).Transaction.find({})
      .populate('societyId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    const stats = await (
      await import('../billing/model')
    ).Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const byPlan = await (
      await import('../billing/model')
    ).Transaction.aggregate([
      { $group: { _id: '$plan', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      ok: true,
      transactions,
      summary: {
        totalRevenue: stats[0]?.totalRevenue || 0,
        totalTransactions: stats[0]?.count || 0,
        byPlan,
      },
    });
  }),
);

superadminRouter.delete(
  '/societies/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');

    const society = await Society.findByIdAndDelete(req.params.id);
    if (!society) throw new ApiError(404, 'NOT_FOUND', 'Society not found');

    await writeAuditLog({
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'society.delete',
      targetType: 'society',
      targetId: req.params.id,
      metadata: { name: society.name },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true });
  }),
);

superadminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [totalSocieties, totalUsers, activeSocieties, expiringSocieties, planDistribution] =
      await Promise.all([
        Society.countDocuments({}),
        User.countDocuments({}),
        Society.countDocuments({ status: 'active' }),
        Society.countDocuments({
          trialEndsAt: { $gt: new Date(), $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        }),
        Society.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]),
      ]);

    // Simple growth trend (mocking for now or based on createdAt)
    const trends = await Society.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({
      ok: true,
      stats: {
        totalSocieties,
        totalUsers,
        activeSocieties,
        expiringSocieties,
        planDistribution,
        trends: trends.map((t) => ({ month: t._id, count: t.count })),
      },
    });
  }),
);

superadminRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const admin = await Superadmin.findById(req.tenant!.userId);
    if (!admin) throw new ApiError(404, 'NOT_FOUND', 'Admin not found');
    res.json({ ok: true, admin: { id: admin._id, email: admin.email, role: 'superadmin' } });
  }),
);

superadminRouter.patch(
  '/password',
  asyncHandler(async (req, res) => {
    const input = updatePasswordSchema.parse(req.body);
    const admin = await Superadmin.findById(req.tenant!.userId);
    if (!admin) throw new ApiError(404, 'NOT_FOUND', 'Admin not found');

    const isMatch = await bcrypt.compare(input.currentPassword, admin.passwordHash);
    if (!isMatch) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect current password');

    admin.passwordHash = await bcrypt.hash(input.newPassword, 12);
    await admin.save();

    await writeAuditLog({
      scope: 'global',
      actorId: String(admin._id),
      actorRole: 'superadmin',
      action: 'admin.password-reset',
      targetType: 'superadmin',
      targetId: String(admin._id),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, message: 'Password updated successfully' });
  }),
);
