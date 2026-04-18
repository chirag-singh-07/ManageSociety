import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireSocietyTenant } from '../../middlewares/tenant';
import { ApiError } from '../../shared/apiError';
import { Notification } from './model';
import {
  getNotificationsSchema,
  markAsReadSchema,
  markAllAsReadSchema,
} from './validators';

export const notificationRouter = Router();

notificationRouter.use(requireAuth(), requireSocietyTenant());

// Get all notifications for current user
notificationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const input = getNotificationsSchema.parse(req.query);
    const skip = (input.page - 1) * input.limit;

    const query: any = {
      societyId: req.tenant!.societyId,
      userId: req.tenant!.userId,
    };

    if (input.unreadOnly) {
      query.read = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(input.limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    res.json({
      ok: true,
      notifications,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        pages: Math.ceil(total / input.limit),
      },
    });
  }),
);

// Get unread count
notificationRouter.get(
  '/unread/count',
  asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
      societyId: req.tenant!.societyId,
      userId: req.tenant!.userId,
      read: false,
    });

    res.json({ ok: true, unreadCount: count });
  }),
);

// Mark single notification as read
notificationRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, 'BAD_ID', 'Invalid notification id');
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
      userId: req.tenant!.userId,
    });

    if (!notification) {
      throw new ApiError(404, 'NOT_FOUND', 'Notification not found');
    }

    notification.read = true;
    await notification.save();

    res.json({ ok: true, notification });
  }),
);

// Mark all notifications as read
notificationRouter.patch(
  '/read/all',
  asyncHandler(async (req, res) => {
    const input = markAllAsReadSchema.parse(req.body);

    const query: any = {
      societyId: req.tenant!.societyId,
      userId: req.tenant!.userId,
      read: false,
    };

    if (input.type) {
      query.type = input.type;
    }

    const result = await Notification.updateMany(query, { read: true });

    res.json({
      ok: true,
      message: `Marked ${result.modifiedCount} notification(s) as read`,
      modifiedCount: result.modifiedCount,
    });
  }),
);

// Delete notification
notificationRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, 'BAD_ID', 'Invalid notification id');
    }

    const result = await Notification.deleteOne({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
      userId: req.tenant!.userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Notification not found');
    }

    res.json({ ok: true, message: 'Notification deleted' });
  }),
);

// Clear all notifications
notificationRouter.delete(
  '/clear/all',
  asyncHandler(async (req, res) => {
    const result = await Notification.deleteMany({
      societyId: req.tenant!.societyId,
      userId: req.tenant!.userId,
    });

    res.json({
      ok: true,
      message: `Cleared ${result.deletedCount} notification(s)`,
      deletedCount: result.deletedCount,
    });
  }),
);
