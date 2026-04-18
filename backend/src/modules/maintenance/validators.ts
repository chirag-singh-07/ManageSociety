import { z } from 'zod';

export const createMaintenanceChargeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  frequency: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
  order: z.number().int().default(0),
});

export const updateMaintenanceChargeSchema = createMaintenanceChargeSchema.partial();

export const generateBillsSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
  dueDate: z.coerce.date(),
});

export const updateBillStatusSchema = z.object({
  status: z.enum(['unpaid', 'partial', 'paid', 'overdue']),
  remarks: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.string().default('online'),
  remarks: z.string().optional(),
});

export const sendReminderSchema = z.object({
  billIds: z.array(z.string()).min(1, 'At least one bill must be selected'),
  message: z.string().optional(),
});
