import { z } from 'zod';

export const createInviteCodeSchema = z.object({
  type: z.enum(['resident', 'admin']),
  expiresInDays: z.coerce.number().int().min(0).max(365).default(30),
  maxUses: z.coerce.number().int().min(1).max(10_000).optional(),
});

export const disableInviteCodeSchema = z.object({
  disabled: z.boolean().default(true),
});

export const approveUserSchema = z.object({
  status: z.enum(['active', 'blocked']).default('active'),
});

export const createMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  flatNumber: z.string().min(1, 'Flat number is required').max(50),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain lowercase letters')
    .regex(/(?=.*[A-Z])/, 'Password must contain uppercase letters')
    .regex(/(?=.*\d)/, 'Password must contain numbers'),
});

export const adminNoticeCreateSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(1),
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
  audience: z.enum(['all', 'owners', 'tenants', 'custom']).default('all'),
  publishedAt: z.coerce.date().optional(),
});

export const adminNoticeUpdateSchema = adminNoticeCreateSchema.partial();

export const assignComplaintSchema = z.object({
  assignedTo: z.string().min(1),
});

export const complaintStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'rejected']),
  message: z.string().optional(),
});

