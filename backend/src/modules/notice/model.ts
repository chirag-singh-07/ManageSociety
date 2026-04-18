import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export interface NoticeAttachment {
  fileId: string;
  url: string;
  type: string;
  name: string;
}

export interface NoticeDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  attachments: NoticeAttachment[];
  publishedAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  audience: 'all' | 'owners' | 'tenants' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

const noticeAttachmentSchema = new Schema<NoticeAttachment>(
  {
    fileId: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const noticeSchema = new Schema<NoticeDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    attachments: { type: [noticeAttachmentSchema], default: [] },
    publishedAt: { type: Date, default: () => new Date(), index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    audience: { type: String, enum: ['all', 'owners', 'tenants', 'custom'], default: 'all' },
    ...baseSchemaFields,
  },
  { collection: 'notices' },
);

noticeSchema.index({ societyId: 1, publishedAt: -1 });
withTimestamps(noticeSchema);

export const Notice = mongoose.models.Notice || mongoose.model<NoticeDoc>('Notice', noticeSchema);
