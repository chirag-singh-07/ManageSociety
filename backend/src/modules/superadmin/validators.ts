import { z } from 'zod';

export const createSocietySchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  trialDays: z.coerce.number().int().min(0).max(365).default(14),
});

export const updateSocietySchema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
  settings: z.record(z.any()).optional(),
  plan: z.string().optional(),
});

