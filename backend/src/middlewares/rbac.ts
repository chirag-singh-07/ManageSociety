import type { RequestHandler } from 'express';
import { ApiError } from '../shared/apiError';

export function requireRole(role: 'user' | 'admin' | 'superadmin'): RequestHandler {
  return (req, _res, next) => {
    if (!req.tenant) return next(new ApiError(401, 'UNAUTHORIZED', 'Missing auth'));
    if (req.tenant.role !== role) return next(new ApiError(403, 'FORBIDDEN', 'Insufficient role'));
    return next();
  };
}

export function requireAnyRole(roles: Array<'user' | 'admin' | 'superadmin'>): RequestHandler {
  return (req, _res, next) => {
    if (!req.tenant) return next(new ApiError(401, 'UNAUTHORIZED', 'Missing auth'));
    if (!roles.includes(req.tenant.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Insufficient role'));
    }
    return next();
  };
}
