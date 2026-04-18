import bcrypt from 'bcryptjs';
import { ApiError } from '../../shared/apiError';
import { InviteCode } from '../inviteCode/model';
import { User } from '../user/model';
import { Superadmin } from '../superadmin/model';
import { RefreshToken } from './refreshTokenModel';
import { signAccessToken, signRefreshToken, sha256, verifyRefreshToken } from './tokens';
import mongoose from 'mongoose';

function calcExpiryFromJwtExp(expSeconds: number) {
  return new Date(expSeconds * 1000);
}

export async function bootstrapSuperadmin(params: { email: string; password: string }) {
  const existing = await Superadmin.countDocuments({});
  if (existing > 0) throw new ApiError(409, 'ALREADY_BOOTSTRAPPED', 'Superadmin already exists');

  const passwordHash = await bcrypt.hash(params.password, 12);
  const superadmin = await Superadmin.create({ email: params.email.toLowerCase(), passwordHash });
  return { id: String(superadmin._id), email: superadmin.email };
}

export async function registerWithInvite(params: {
  inviteCode: string;
  name: string;
  email: string;
  password: string;
}) {
  const code = await InviteCode.findOne({ code: params.inviteCode.trim() });
  if (!code) throw new ApiError(400, 'INVALID_INVITE', 'Invalid invite code');
  if (code.disabledAt) throw new ApiError(400, 'INVITE_DISABLED', 'Invite code disabled');
  if (code.expiresAt && code.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, 'INVITE_EXPIRED', 'Invite code expired');
  }
  if (code.maxUses != null && code.usedCount >= code.maxUses) {
    throw new ApiError(400, 'INVITE_MAXED', 'Invite code max uses reached');
  }

  const role = code.type === 'admin' ? 'admin' : 'user';
  const status = role === 'admin' ? 'active' : 'pending';
  const passwordHash = await bcrypt.hash(params.password, 12);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.create(
      [
        {
          societyId: code.societyId,
          role,
          status,
          name: params.name,
          email: params.email.toLowerCase(),
          passwordHash,
        },
      ],
      { session },
    );

    await InviteCode.updateOne({ _id: code._id }, { $inc: { usedCount: 1 } }, { session });
    await session.commitTransaction();

    return {
      id: String(user[0]._id),
      societyId: String(code.societyId),
      role,
      status,
    };
  } catch (err: any) {
    await session.abortTransaction();
    if (String(err?.code) === '11000') {
      throw new ApiError(409, 'EMAIL_EXISTS', 'Email already exists in this society');
    }
    throw err;
  } finally {
    session.endSession();
  }
}

export async function login(params: { email: string; password: string }) {
  const normalizedEmail = params.email.toLowerCase();

  // Try superadmin first (global)
  const superadmin = await Superadmin.findOne({ email: normalizedEmail });
  if (superadmin) {
    if (superadmin.status !== 'active') throw new ApiError(403, 'BLOCKED', 'Account blocked');
    const ok = await bcrypt.compare(params.password, superadmin.passwordHash);
    if (!ok) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    return issueTokens({
      userId: String(superadmin._id),
      role: 'superadmin',
      societyId: null,
    });
  }

  // Then tenant users
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  if (user.status !== 'active') throw new ApiError(403, 'USER_INACTIVE', 'User not active');
  const ok = await bcrypt.compare(params.password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  if (!user.societyId) throw new ApiError(400, 'TENANT_REQUIRED', 'societyId not set for this user');

  return issueTokens({
    userId: String(user._id),
    role: user.role,
    societyId: String(user.societyId),
  });
}

async function issueTokens(payload: {
  userId: string;
  role: 'user' | 'admin' | 'superadmin';
  societyId: string | null;
}) {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = sha256(refreshToken);
  const decoded = verifyRefreshToken(refreshToken);

  await RefreshToken.create({
    userId: payload.userId,
    role: payload.role,
    societyId: payload.societyId,
    tokenHash,
    expiresAt: calcExpiryFromJwtExp(decoded.exp),
  });

  return { accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  let decoded: ReturnType<typeof verifyRefreshToken>;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const tokenHash = sha256(refreshToken);
  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) throw new ApiError(401, 'UNAUTHORIZED', 'Refresh token revoked');
  if (record.revokedAt) throw new ApiError(401, 'UNAUTHORIZED', 'Refresh token revoked');
  if (record.expiresAt.getTime() < Date.now()) throw new ApiError(401, 'UNAUTHORIZED', 'Expired');

  // rotation: revoke old, issue new
  await RefreshToken.updateOne({ _id: record._id }, { revokedAt: new Date() });

  return issueTokens({
    userId: decoded.userId,
    role: decoded.role,
    societyId: decoded.societyId ?? null,
  });
}

export async function logout(refreshToken: string) {
  const tokenHash = sha256(refreshToken);
  await RefreshToken.updateOne({ tokenHash }, { revokedAt: new Date() });
}

export async function changePassword(
  userId: string,
  role: 'user' | 'admin' | 'superadmin',
  oldPassword: string,
  newPassword: string,
) {
  let user: any;

  if (role === 'superadmin') {
    user = await Superadmin.findById(userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'Superadmin not found');
  } else {
    user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) throw new ApiError(401, 'INVALID_PASSWORD', 'Current password is incorrect');

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  if (role === 'superadmin') {
    await Superadmin.updateOne({ _id: userId }, { passwordHash: newPasswordHash });
  } else {
    await User.updateOne({ _id: userId }, { passwordHash: newPasswordHash });
  }

  // Revoke all refresh tokens for security
  await RefreshToken.updateMany(
    { userId },
    { revokedAt: new Date() },
  );
}
