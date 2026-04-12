import type { RequestHandler } from 'express';
import { ApiError } from '../shared/apiError';

export function requireSocietyTenant(): RequestHandler {
  return (req, _res, next) => {
    if (!req.tenant) return next(new ApiError(401, 'UNAUTHORIZED', 'Missing auth'));
    if (!req.tenant.societyId) {
      return next(new ApiError(400, 'TENANT_REQUIRED', 'societyId not set for this user'));
    }
    return next();
  };
}
