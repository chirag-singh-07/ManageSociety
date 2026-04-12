import { z } from 'zod';

export const registerSchema = z.object({
  inviteCode: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const bootstrapSuperadminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
});

