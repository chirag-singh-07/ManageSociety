import { Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { Society } from '../society/model';
import { User } from '../user/model';
import { createSocietySchema, updateSocietySchema, createUserSchema, updateSuperadminUserSchema, subscribeSocietySchema } from './validators';
import { writeAuditLog } from '../audit/service';
import { ApiError } from '../../shared/apiError';

export const superadminRouter = Router();

superadminRouter.use(requireAuth(), requireRole('superadmin'));

superadminRouter.post(
  '/societies',
  asyncHandler(async (req, res) => {
    const input = createSocietySchema.parse(req.body);
    const trialEndsAt =
      input.trialDays > 0 ? new Date(Date.now() + input.trialDays * 24 * 60 * 60 * 1000) : null;
    const society = await Society.create({
      name: input.name,
      address: input.address ?? '',
      city: input.city ?? '',
      state: input.state ?? '',
      pincode: input.pincode ?? '',
      trialEndsAt,
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
    const society = await Society.findByIdAndUpdate(
      req.params.id,
      { $set: input },
      { new: true },
    );
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
  asyncHandler(async (_req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 }).limit(500);
    res.json({ ok: true, users });
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
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: input },
      { new: true }
    );
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
    const currentExpiry = society.trialEndsAt && society.trialEndsAt > new Date() 
      ? society.trialEndsAt 
      : new Date();
    
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + input.months);

    const updated = await Society.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          plan: input.plan,
          trialEndsAt: newExpiry
        } 
      },
      { new: true }
    );

    await writeAuditLog({
      scope: 'global',
      actorId: req.tenant!.userId,
      actorRole: 'superadmin',
      action: 'society.subscribe',
      targetType: 'society',
      targetId: String(society._id),
      metadata: { plan: input.plan, months: input.months, newExpiry },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, society: updated });
  }),
);

superadminRouter.get(
  '/audit-logs',
  asyncHandler(async (_req, res) => {
    const logs = await (await import('../audit/model')).AuditLog.find({ scope: 'global' })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, logs });
  }),
);


