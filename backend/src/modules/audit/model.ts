import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export interface AuditLogDoc extends mongoose.Document {
  scope: 'global' | 'society';
  societyId?: mongoose.Types.ObjectId | null;
  actorId: mongoose.Types.ObjectId;
  actorRole: 'user' | 'admin' | 'superadmin';
  action: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    scope: { type: String, enum: ['global', 'society'], required: true, index: true },
    societyId: { type: Schema.Types.ObjectId, default: null, index: true },
    actorId: { type: Schema.Types.ObjectId, required: true, index: true },
    actorRole: { type: String, enum: ['user', 'admin', 'superadmin'], required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ...baseSchemaFields,
  },
  { collection: 'auditLogs' },
);

auditLogSchema.index({ societyId: 1, createdAt: -1 });
withTimestamps(auditLogSchema);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<AuditLogDoc>('AuditLog', auditLogSchema);

