import { z } from 'zod';

const passwordSchema = z.string()
  .min(8)
  .max(128)
  .regex(/(?=.*[a-z])/, 'Password must contain a lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain an uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain a number')
  .regex(/(?=.*[^A-Za-z0-9])/, 'Password must contain a special character');

export const registerSchema = z.object({
  inviteCode: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
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
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema,
});
