import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export interface RefreshTokenDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'admin' | 'superadmin';
  societyId?: mongoose.Types.ObjectId | null;
  tokenHash: string;
  revokedAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], required: true, index: true },
    societyId: { type: Schema.Types.ObjectId, default: null, index: true },
    tokenHash: { type: String, required: true, index: true },
    revokedAt: { type: Date, default: null, index: true },
    expiresAt: { type: Date, required: true, index: true },
    ...baseSchemaFields,
  },
  { collection: 'refreshTokens' },
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
withTimestamps(refreshTokenSchema);

export const RefreshToken =
  mongoose.models.RefreshToken || mongoose.model<RefreshTokenDoc>('RefreshToken', refreshTokenSchema);
