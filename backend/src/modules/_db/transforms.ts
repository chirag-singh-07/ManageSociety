import type { Schema } from 'mongoose';

export function applySafeJsonTransform(schema: Schema, hiddenFields: string[] = []) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      for (const field of hiddenFields) {
        delete ret[field];
      }
      return ret;
    },
  });
}
