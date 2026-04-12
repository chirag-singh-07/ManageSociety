import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export interface CommentDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  complaintId: mongoose.Types.ObjectId;
  by: mongoose.Types.ObjectId;
  message: string;
  attachments: Array<{ fileId: string; url: string; type: string; name: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, required: true, index: true },
    complaintId: { type: Schema.Types.ObjectId, required: true, index: true },
    by: { type: Schema.Types.ObjectId, required: true, index: true },
    message: { type: String, required: true },
    attachments: { type: [Schema.Types.Mixed], default: [] },
    ...baseSchemaFields,
  },
  { collection: 'comments' },
);

commentSchema.index({ societyId: 1, complaintId: 1, createdAt: 1 });
withTimestamps(commentSchema);

export const Comment =
  mongoose.models.Comment || mongoose.model<CommentDoc>('Comment', commentSchema);

