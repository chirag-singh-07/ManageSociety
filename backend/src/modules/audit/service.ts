import mongoose from 'mongoose';
import { AuditLog } from './model';

export async function writeAuditLog(params: {
  scope: 'global' | 'society';
  societyId?: string | null;
  actorId: string;
  actorRole: 'user' | 'admin' | 'superadmin';
  action: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  await AuditLog.create({
    scope: params.scope,
    societyId: params.societyId ? new mongoose.Types.ObjectId(params.societyId) : null,
    actorId: new mongoose.Types.ObjectId(params.actorId),
    actorRole: params.actorRole,
    action: params.action,
    targetType: params.targetType ?? '',
    targetId: params.targetId ?? '',
    ip: params.ip ?? '',
    userAgent: params.userAgent ?? '',
    metadata: params.metadata ?? {},
  });
}

