import mongoose, { Schema } from 'mongoose';
import { baseSchemaFields, withTimestamps } from '../_db/base';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'active' | 'blocked';
export type UserType = 'resident' | 'owner' | 'tenant' | 'staff' | 'guard';

export interface UserDoc extends mongoose.Document {
  societyId: mongoose.Types.ObjectId;
  role: UserRole;
  userType?: UserType;
  status: UserStatus;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  flatId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    role: { type: String, enum: ['user', 'admin'], required: true, index: true },
    userType: { 
      type: String, 
      enum: ['resident', 'owner', 'tenant', 'staff', 'guard'], 
      default: 'resident', 
      index: true 
    },
    status: { type: String, enum: ['pending', 'active', 'blocked'], default: 'pending', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    flatId: { type: Schema.Types.ObjectId, default: null },
    ...baseSchemaFields,
  },
  { collection: 'users' },
);

userSchema.index({ societyId: 1, email: 1 }, { unique: true });
withTimestamps(userSchema);

export const User = mongoose.models.User || mongoose.model<UserDoc>('User', userSchema);

