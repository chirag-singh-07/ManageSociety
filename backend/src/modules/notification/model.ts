import { Schema, model, Document } from 'mongoose';

export interface NotificationDoc extends Document {
  societyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'notice' | 'maintenance' | 'complaint' | 'payment' | 'system';
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    societyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['notice', 'maintenance', 'complaint', 'payment', 'system'],
      required: true,
    },
    actionUrl: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Composite index for efficient querying
notificationSchema.index({ societyId: 1, userId: 1, read: 1 });
notificationSchema.index({ societyId: 1, userId: 1, createdAt: -1 });

export const Notification = model<NotificationDoc>('Notification', notificationSchema);
