import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../shared/apiError';
import { z } from 'zod';

const tokenPayloadSchema = z.object({
  userId: z.string(),
  role: z.enum(['user', 'admin', 'superadmin']),
  societyId: z.string().optional(),
});

export function requireAuth(): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Missing bearer token'));
    }

    const token = header.slice('Bearer '.length).trim();
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const parsed = tokenPayloadSchema.safeParse(decoded);
      if (!parsed.success) {
        return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid token payload'));
      }

      req.tenant = {
        userId: parsed.data.userId,
        role: parsed.data.role,
        societyId: parsed.data.societyId ?? null,
      };

      return next();
    } catch {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
    }
  };
}
