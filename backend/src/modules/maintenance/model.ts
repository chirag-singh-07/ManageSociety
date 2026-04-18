import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export interface MaintenanceChargeDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceBillDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  flatNumber: string;
  period: string; // e.g., "2024-04"
  dueDate: Date;
  totalAmount: number;
  charges: Array<{
    chargeId: mongoose.Types.ObjectId;
    name: string;
    amount: number;
  }>;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  paymentHistory?: Array<{
    amount: number;
    date: Date;
    method: string;
  }>;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceChargeSchema = new Schema<MaintenanceChargeDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    ...baseSchemaFields,
  },
  { collection: 'maintenance_charges' },
);

const maintenanceBillSchema = new Schema<MaintenanceBillDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    flatNumber: { type: String, required: true },
    period: { type: String, required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    totalAmount: { type: Number, required: true, min: 0 },
    charges: [
      {
        chargeId: { type: Schema.Types.ObjectId, ref: 'MaintenanceCharge' },
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { 
      type: String, 
      enum: ['unpaid', 'partial', 'paid', 'overdue'], 
      default: 'unpaid',
      index: true,
    },
    paymentHistory: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: () => new Date() },
        method: { type: String, default: 'online' },
      },
    ],
    remarks: { type: String, default: '' },
    ...baseSchemaFields,
  },
  { collection: 'maintenance_bills' },
);

maintenanceChargeSchema.index({ societyId: 1, active: 1 });
maintenanceBillSchema.index({ societyId: 1, period: 1 });
maintenanceBillSchema.index({ societyId: 1, userId: 1, period: 1 }, { unique: true });

withTimestamps(maintenanceChargeSchema);
withTimestamps(maintenanceBillSchema);

export const MaintenanceCharge = 
  mongoose.models.MaintenanceCharge || 
  mongoose.model<MaintenanceChargeDoc>('MaintenanceCharge', maintenanceChargeSchema);

export const MaintenanceBill = 
  mongoose.models.MaintenanceBill || 
  mongoose.model<MaintenanceBillDoc>('MaintenanceBill', maintenanceBillSchema);
