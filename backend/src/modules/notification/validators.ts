import { z } from 'zod';

export const getNotificationsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  unreadOnly: z.boolean().default(false),
});

export const markAsReadSchema = z.object({
  notificationId: z.string().min(1),
});

export const markAllAsReadSchema = z.object({
  type: z.enum(['notice', 'maintenance', 'complaint', 'payment', 'system']).optional(),
});
