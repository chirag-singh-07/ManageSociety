import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export type SocietyStatus = 'active' | 'suspended';

export interface SocietyDoc extends mongoose.Document {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: SocietyStatus;
  settings: Record<string, unknown>;
  plan?: string;
  trialEndsAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const societySchema = new Schema<SocietyDoc>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
    settings: { type: Schema.Types.Mixed, default: {} },
    plan: { type: String, default: 'trial' },
    trialEndsAt: { type: Date, default: null },
    ...baseSchemaFields,
  },
  { collection: 'societies' },
);

withTimestamps(societySchema);

export const Society = mongoose.models.Society || mongoose.model<SocietyDoc>('Society', societySchema);

