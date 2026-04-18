import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../shared/apiError';
import { User } from '../modules/user/model';

export function requireSocietyTenant(): RequestHandler {
  return async (req, _res, next) => {
    if (!req.tenant) return next(new ApiError(401, 'UNAUTHORIZED', 'Missing auth'));
    const tokenSocietyId = req.tenant.societyId;

    if (!tokenSocietyId) {
      return next(new ApiError(400, 'TENANT_REQUIRED', 'societyId not set for this user'));
    }

    // Recovery path for legacy/bad tokens where societyId is malformed (e.g. "undefined")
    if (!mongoose.isValidObjectId(tokenSocietyId)) {
      try {
        const user = await User.findById(req.tenant.userId).select('societyId');
        const resolvedSocietyId = user?.societyId ? String(user.societyId) : null;

        if (resolvedSocietyId && mongoose.isValidObjectId(resolvedSocietyId)) {
          req.tenant.societyId = resolvedSocietyId;
          return next();
        }
      } catch {
        // Fall through to explicit API error below.
      }

      return next(new ApiError(400, 'TENANT_INVALID', 'Invalid societyId in auth token'));
    }

    return next();
  };
}
