import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';

export function signAccessToken(payload: { userId: string; role: string; societyId?: string | null }) {
  return (jwt as any).sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL });
}

export function signRefreshToken(payload: { userId: string; role: string; societyId?: string | null }) {
  return (jwt as any).sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    userId: string;
    role: 'user' | 'admin' | 'superadmin';
    societyId?: string;
    iat: number;
    exp: number;
  };
}

export function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
