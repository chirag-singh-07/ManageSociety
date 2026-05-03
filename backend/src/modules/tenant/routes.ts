import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireSocietyTenant } from '../../middlewares/tenant';
import { ApiError } from '../../shared/apiError';
import { User } from '../user/model';
import { Notice } from '../notice/model';
import { Complaint } from '../complaint/model';
import { Comment } from '../comment/model';
import { MaintenanceBill } from '../maintenance/model';
import { addCommentSchema, createComplaintSchema, presignSchema, updateMeSchema } from './validators';
import { createPresign } from '../files/presign';
import { FileMeta } from '../files/model';
import { parsePagination } from '../../shared/pagination';

export const tenantRouter = Router();

tenantRouter.use(requireAuth(), requireSocietyTenant());

tenantRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.tenant!.userId, societyId: req.tenant!.societyId }).lean();
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    res.json({ ok: true, user });
  }),
);

tenantRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const input = updateMeSchema.parse(req.body);
    const user = await User.findOneAndUpdate(
      { _id: req.tenant!.userId, societyId: req.tenant!.societyId },
      { $set: input },
      { new: true },
    );
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    res.json({ ok: true, user });
  }),
);

// Notices
tenantRouter.get(
  '/notices',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const notices = await Notice.find({ societyId: req.tenant!.societyId })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.json({ ok: true, notices, pagination: { page, limit } });
  }),
);

tenantRouter.get(
  '/notices/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const notice = await Notice.findOne({ _id: req.params.id, societyId: req.tenant!.societyId });
    if (!notice) throw new ApiError(404, 'NOT_FOUND', 'Notice not found');
    res.json({ ok: true, notice });
  }),
);

// Complaints
tenantRouter.post(
  '/complaints',
  asyncHandler(async (req, res) => {
    const input = createComplaintSchema.parse(req.body);
    const complaint = await Complaint.create({
      societyId: req.tenant!.societyId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      createdBy: req.tenant!.userId,
      attachments: input.attachments,
      timeline: [{ type: 'created', by: req.tenant!.userId, at: new Date() }],
    });
    res.status(201).json({ ok: true, complaint });
  }),
);

tenantRouter.get(
  '/complaints',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const filter: any = { societyId: req.tenant!.societyId };
    if (req.tenant!.role === 'user') {
      filter.createdBy = req.tenant!.userId;
    }
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    res.json({ ok: true, complaints, pagination: { page, limit } });
  }),
);

tenantRouter.get(
  '/complaints/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const complaint = await Complaint.findOne({ _id: req.params.id, societyId: req.tenant!.societyId });
    if (!complaint) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found');
    if (req.tenant!.role === 'user' && String(complaint.createdBy) !== req.tenant!.userId) {
      throw new ApiError(404, 'NOT_FOUND', 'Complaint not found');
    }
    const comments = await Comment.find({ societyId: req.tenant!.societyId, complaintId: complaint._id })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    res.json({ ok: true, complaint, comments });
  }),
);

tenantRouter.post(
  '/complaints/:id/comments',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = addCommentSchema.parse(req.body);
    const complaint = await Complaint.findOne({ _id: req.params.id, societyId: req.tenant!.societyId });
    if (!complaint) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found');
    if (req.tenant!.role === 'user' && String(complaint.createdBy) !== req.tenant!.userId) {
      throw new ApiError(404, 'NOT_FOUND', 'Complaint not found');
    }

    const comment = await Comment.create({
      societyId: req.tenant!.societyId,
      complaintId: complaint._id,
      by: req.tenant!.userId,
      message: input.message,
      attachments: input.attachments,
    });

    await Complaint.updateOne(
      { _id: complaint._id },
      { $push: { timeline: { type: 'comment', by: req.tenant!.userId, at: new Date() } } },
    );

    res.status(201).json({ ok: true, comment });
  }),
);

// Files presign
tenantRouter.post(
  '/files/presign',
  asyncHandler(async (req, res) => {
    const input = presignSchema.parse(req.body);
    const presign = await createPresign({
      societyId: req.tenant!.societyId!,
      userId: req.tenant!.userId,
      mimeType: input.mimeType,
      size: input.size,
      fileName: input.fileName,
    });

    await FileMeta.create({
      societyId: req.tenant!.societyId,
      fileId: presign.fileId,
      key: presign.key,
      url: presign.publicUrl,
      mimeType: input.mimeType,
      size: input.size,
      uploadedBy: req.tenant!.userId,
    });

    res.json({ ok: true, ...presign });
  }),
);

// Maintenance bills (resident/member view)
tenantRouter.get(
  '/maintenance/bills',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const status = req.query.status as string | undefined;
    const period = req.query.period as string | undefined;

    const filter: Record<string, unknown> = {
      societyId: req.tenant!.societyId,
    };

    // Tenant users should only see their own bills.
    if (req.tenant!.role === 'user') {
      filter.userId = req.tenant!.userId;
    }

    if (status) filter.status = status;
    if (period) filter.period = period;

    const bills = await MaintenanceBill.find(filter)
      .sort({ period: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.json({ ok: true, bills, pagination: { page, limit } });
  }),
);
