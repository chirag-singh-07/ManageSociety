import { Schema } from 'mongoose';

export const baseSchemaFields = {
  createdAt: { type: Date, default: () => new Date(), index: true },
  updatedAt: { type: Date, default: () => new Date(), index: true },
  deletedAt: { type: Date, default: null },
};

export function withTimestamps(schema: Schema) {
  schema.pre('save', function (next) {
    (this as any).updatedAt = new Date();
    next();
  });
}
