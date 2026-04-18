import { Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { requireSocietyTenant } from '../../middlewares/tenant';
import { ApiError } from '../../shared/apiError';
import { randomCode } from '../../shared/id';
import { InviteCode } from '../inviteCode/model';
import { User } from '../user/model';
import { Notice } from '../notice/model';
import { Complaint } from '../complaint/model';
import { Society } from '../society/model';
import {
  adminNoticeCreateSchema,
  adminNoticeUpdateSchema,
  approveUserSchema,
  assignComplaintSchema,
  complaintStatusSchema,
  createInviteCodeSchema,
  createMemberSchema,
} from './validators';
import { writeAuditLog } from '../audit/service';
import { maintenanceRouter } from '../maintenance/routes';
import { notificationRouter } from '../notification/routes';

export const adminRouter = Router();

adminRouter.use(requireAuth(), requireRole('admin'), requireSocietyTenant());

// Use sub-routers
adminRouter.use('/maintenance', maintenanceRouter);
adminRouter.use('/notifications', notificationRouter);

adminRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const societyId = new mongoose.Types.ObjectId(req.tenant!.societyId!);
    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      blockedMembers,
      openComplaints,
      resolvedComplaints,
      pendingComplaints,
      noticesCount,
      invCodesActive,
    ] = await Promise.all([
      User.countDocuments({ societyId, role: { $ne: 'admin' } }),
      User.countDocuments({ societyId, status: 'active', role: { $ne: 'admin' } }),
      User.countDocuments({ societyId, status: 'pending', role: { $ne: 'admin' } }),
      User.countDocuments({ societyId, status: 'blocked', role: { $ne: 'admin' } }),
      Complaint.countDocuments({ societyId, status: { $in: ['open', 'in_progress'] } }),
      Complaint.countDocuments({ societyId, status: 'resolved' }),
      Complaint.countDocuments({ societyId, status: 'pending' }),
      Notice.countDocuments({ societyId }),
      InviteCode.countDocuments({ societyId, expiresAt: { $gt: new Date() } }),
    ]);
    res.json({
      ok: true,
      totalMembers,
      activeMembers,
      pendingMembers,
      blockedMembers,
      openComplaints,
      resolvedComplaints,
      pendingComplaints,
      noticesCount,
      invCodesActive,
    });
  }),
);

adminRouter.get(
  '/society',
  asyncHandler(async (req, res) => {
    const society = await Society.findById(req.tenant!.societyId);
    if (!society) throw new ApiError(404, 'NOT_FOUND', 'Society not found');
    res.json({ ok: true, society });
  }),
);

adminRouter.patch(
  '/society',
  asyncHandler(async (req, res) => {
    const settings = req.body?.settings;
    if (settings && typeof settings !== 'object') {
      throw new ApiError(400, 'BAD_REQUEST', 'settings must be an object');
    }
    const society = await Society.findOneAndUpdate(
      { _id: req.tenant!.societyId },
      { $set: { settings: settings ?? {} } },
      { new: true },
    );
    if (!society) throw new ApiError(404, 'NOT_FOUND', 'Society not found');
    res.json({ ok: true, society });
  }),
);

// Invite Codes
adminRouter.post(
  '/invite-codes',
  asyncHandler(async (req, res) => {
    const input = createInviteCodeSchema.parse(req.body);
    const expiresAt =
      input.expiresInDays > 0 ? new Date(Date.now() + input.expiresInDays * 86400 * 1000) : null;
    const code = randomCode(8);
    const invite = await InviteCode.create({
      societyId: req.tenant!.societyId,
      code,
      type: input.type,
      expiresAt,
      maxUses: input.maxUses ?? null,
      createdBy: req.tenant!.userId,
    });

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'invite.create',
      targetType: 'invite',
      targetId: String(invite._id),
      metadata: { type: input.type },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, invite });
  }),
);

adminRouter.get(
  '/invite-codes',
  asyncHandler(async (req, res) => {
    const invites = await InviteCode.find({ societyId: req.tenant!.societyId })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, invites });
  }),
);

adminRouter.post(
  '/invite-codes/:id/disable',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const invite = await InviteCode.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      { disabledAt: new Date() },
      { new: true },
    );
    if (!invite) throw new ApiError(404, 'NOT_FOUND', 'Invite not found');
    res.json({ ok: true, invite });
  }),
);

// Members
adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.tenant!.societyId)) {
      throw new ApiError(400, 'TENANT_INVALID', 'Invalid societyId in auth token');
    }
    const societyObjectId = new mongoose.Types.ObjectId(req.tenant!.societyId);
    const status = req.query.status as string | undefined;
    const filter: any = { 
      societyId: societyObjectId,
      role: { $ne: 'admin' }  // Exclude admins
    };
    if (status) filter.status = status;

    // Use raw collection query to avoid model-casting edge cases on legacy/dirty records.
    const users = await User.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .project({
        passwordHash: 0,
        __v: 0,
      })
      .toArray();

    res.json({ ok: true, users: users ?? [] });
  }),
);

adminRouter.post(
  '/users',
  asyncHandler(async (req, res) => {
    const input = createMemberSchema.parse(req.body);

    // Check if email already exists in this society
    const existingUser = await User.findOne({
      societyId: req.tenant!.societyId,
      email: input.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ApiError(409, 'EMAIL_EXISTS', 'Email already exists in this society');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create the user
    const user = await User.create({
      societyId: req.tenant!.societyId,
      role: 'user',
      status: 'active',
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      flatNumber: input.flatNumber,
      passwordHash,
    });

    // Write audit log
    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'member.create',
      targetType: 'user',
      targetId: String(user._id),
      metadata: { email: user.email, flatNumber: input.flatNumber },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, user });
  }),
);

adminRouter.post(
  '/users/:id/status',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = approveUserSchema.parse(req.body);
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      { status: input.status },
      { new: true },
    );
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'user.status',
      targetType: 'user',
      targetId: String(user._id),
      metadata: { status: input.status },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, user });
  }),
);

adminRouter.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
      role: { $ne: 'admin' },  // Prevent deleting admin accounts
    });
    
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found or cannot be deleted');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'user.delete',
      targetType: 'user',
      targetId: String(user._id),
      metadata: { email: user.email, name: user.name },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, message: 'Member deleted successfully' });
  }),
);

// Notices
adminRouter.get(
  '/notices',
  asyncHandler(async (req, res) => {
    const notices = await Notice.find({ societyId: req.tenant!.societyId })
      .populate('createdBy', 'name')
      .sort({ publishedAt: -1 })
      .limit(500);
    res.json({ ok: true, notices });
  }),
);

adminRouter.get(
  '/notices/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const notice = await Notice.findOne({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
    }).populate('createdBy', 'name');
    if (!notice) throw new ApiError(404, 'NOT_FOUND', 'Notice not found');
    res.json({ ok: true, notice });
  }),
);

adminRouter.post(
  '/notices',
  asyncHandler(async (req, res) => {
    const input = adminNoticeCreateSchema.parse(req.body);
    const notice = await Notice.create({
      societyId: req.tenant!.societyId,
      title: input.title,
      body: input.body,
      attachments: input.attachments,
      audience: input.audience,
      createdBy: req.tenant!.userId,
      publishedAt: input.publishedAt ?? new Date(),
    });

    // Populate createdBy
    await notice.populate('createdBy', 'name');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'notice.create',
      targetType: 'notice',
      targetId: String(notice._id),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, notice });
  }),
);

adminRouter.patch(
  '/notices/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = adminNoticeUpdateSchema.parse(req.body);
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      { $set: input },
      { new: true },
    ).populate('createdBy', 'name');
    if (!notice) throw new ApiError(404, 'NOT_FOUND', 'Notice not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'notice.update',
      targetType: 'notice',
      targetId: String(notice._id),
      metadata: input,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, notice });
  }),
);

adminRouter.delete(
  '/notices/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const notice = await Notice.findOneAndDelete({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
    });
    if (!notice) throw new ApiError(404, 'NOT_FOUND', 'Notice not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'notice.delete',
      targetType: 'notice',
      targetId: String(notice._id),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true });
  }),
);

// Complaints (admin)
adminRouter.get(
  '/complaints',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const filter: any = { societyId: req.tenant!.societyId };
    if (status) filter.status = status;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, complaints });
  }),
);

adminRouter.post(
  '/complaints/:id/assign',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = assignComplaintSchema.parse(req.body);
    if (!mongoose.isValidObjectId(input.assignedTo)) {
      throw new ApiError(400, 'BAD_ID', 'Invalid assignedTo');
    }
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      {
        assignedTo: input.assignedTo,
        $push: {
          timeline: { type: 'assigned', by: req.tenant!.userId, at: new Date() },
        },
      },
      { new: true },
    );
    if (!complaint) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'complaint.assign',
      targetType: 'complaint',
      targetId: String(complaint._id),
      metadata: { assignedTo: input.assignedTo },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, complaint });
  }),
);

adminRouter.post(
  '/complaints/:id/status',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = complaintStatusSchema.parse(req.body);
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      {
        status: input.status,
        $push: {
          timeline: { type: 'status', message: input.message, by: req.tenant!.userId, at: new Date() },
        },
      },
      { new: true },
    );
    if (!complaint) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'complaint.status',
      targetType: 'complaint',
      targetId: String(complaint._id),
      metadata: { status: input.status, message: input.message },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, complaint });
  }),
);
