import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  societyId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  plan: string;
  months: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  plan: { type: String, required: true },
  months: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
