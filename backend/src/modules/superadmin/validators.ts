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
  trialEndsAt: z.coerce.date().optional(),
});

export const createUserSchema = z.object({
  societyId: z.string(),
  role: z.enum(['user', 'admin']),
  userType: z.enum(['resident', 'owner', 'tenant', 'staff', 'guard']).optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export const updateSuperadminUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  userType: z.enum(['resident', 'owner', 'tenant', 'staff', 'guard']).optional(),
  status: z.enum(['pending', 'active', 'blocked']).optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const subscribeSocietySchema = z.object({
  plan: z.string(),
  months: z.number().int().min(1).max(60),
});

