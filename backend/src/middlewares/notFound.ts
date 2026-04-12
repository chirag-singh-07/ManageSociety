import type { RequestHandler } from 'express';
import { ApiError } from '../shared/apiError';

export function notFoundHandler(): RequestHandler {
  return (req, _res, next) => {
    next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
  };
}
