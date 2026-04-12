import { z } from 'zod';

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export const createComplaintSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  category: z.string().default('general'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  attachments: z
    .array(
      z.object({
        fileId: z.string(),
        url: z.string().url(),
        type: z.string(),
        name: z.string(),
      }),
    )
    .default([]),
});

export const addCommentSchema = z.object({
  message: z.string().min(1),
  attachments: z
    .array(
      z.object({
        fileId: z.string(),
        url: z.string().url(),
        type: z.string(),
        name: z.string(),
      }),
    )
    .default([]),
});

export const presignSchema = z.object({
  mimeType: z.string().min(3),
  size: z.coerce.number().int().min(1).max(10 * 1024 * 1024),
  fileName: z.string().min(1).max(200),
});

