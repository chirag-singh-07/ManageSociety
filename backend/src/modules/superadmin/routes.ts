import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { Society } from '../society/model';
import { createSocietySchema, updateSocietySchema } from './validators';
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
  '/audit-logs',
  asyncHandler(async (_req, res) => {
    const logs = await (await import('../audit/model')).AuditLog.find({ scope: 'global' })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, logs });
  }),
);

