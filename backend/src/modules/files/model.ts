import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export interface FileMetaDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  fileId: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileMetaSchema = new Schema<FileMetaDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, required: true, index: true },
    fileId: { type: String, required: true, index: true },
    key: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, required: true, index: true },
    ...baseSchemaFields,
  },
  { collection: 'files' },
);

fileMetaSchema.index({ societyId: 1, fileId: 1 }, { unique: true });
withTimestamps(fileMetaSchema);

export const FileMeta =
  mongoose.models.FileMeta || mongoose.model<FileMetaDoc>('FileMeta', fileMetaSchema);

