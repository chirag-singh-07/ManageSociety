import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';
import { applySafeJsonTransform } from '../_db/transforms';

export type SuperadminStatus = 'active' | 'blocked';

export interface SuperadminDoc extends mongoose.Document {
  email: string;
  passwordHash: string;
  status: SuperadminStatus;
  createdAt: Date;
  updatedAt: Date;
}

const superadminSchema = new Schema<SuperadminDoc>(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    status: { type: String, enum: ['active', 'blocked'], default: 'active', index: true },
    ...baseSchemaFields,
  },
  { collection: 'superadmins' },
);

withTimestamps(superadminSchema);
applySafeJsonTransform(superadminSchema, ['passwordHash']);
export const Superadmin =
  mongoose.models.Superadmin || mongoose.model<SuperadminDoc>('Superadmin', superadminSchema);
