import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

export interface ComplaintTimelineItem {
  type: string;
  message?: string;
  by: mongoose.Types.ObjectId;
  at: Date;
}

export interface ComplaintDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: ComplaintStatus;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  flatId?: mongoose.Types.ObjectId | null;
  attachments: Array<{ fileId: string; url: string; type: string; name: string }>;
  timeline: ComplaintTimelineItem[];
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<ComplaintDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'general', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'rejected'],
      default: 'open',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, default: null, index: true },
    flatId: { type: Schema.Types.ObjectId, default: null },
    attachments: { type: [Schema.Types.Mixed], default: [] },
    timeline: { type: [Schema.Types.Mixed], default: [] },
    ...baseSchemaFields,
  },
  { collection: 'complaints' },
);

complaintSchema.index({ societyId: 1, status: 1 });
complaintSchema.index({ societyId: 1, createdBy: 1, createdAt: -1 });
withTimestamps(complaintSchema);

export const Complaint =
  mongoose.models.Complaint || mongoose.model<ComplaintDoc>('Complaint', complaintSchema);

