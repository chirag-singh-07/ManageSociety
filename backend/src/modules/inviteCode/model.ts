import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export type InviteType = 'resident' | 'admin';

export interface InviteCodeDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  code: string;
  type: InviteType;
  expiresAt?: Date | null;
  maxUses?: number | null;
  usedCount: number;
  disabledAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inviteCodeSchema = new Schema<InviteCodeDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Society' },
    code: { type: String, required: true, trim: true },
    type: { type: String, enum: ['resident', 'admin'], required: true, index: true },
    expiresAt: { type: Date, default: null, index: true },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    disabledAt: { type: Date, default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, index: true },
    ...baseSchemaFields,
  },
  { collection: 'inviteCodes' },
);

inviteCodeSchema.index({ societyId: 1, code: 1 }, { unique: true });
inviteCodeSchema.index({ code: 1 }, { unique: true });
withTimestamps(inviteCodeSchema);

export const InviteCode =
  mongoose.models.InviteCode || mongoose.model<InviteCodeDoc>('InviteCode', inviteCodeSchema);
