import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../shared/apiError';
import { env } from '../config/env';
import { logger } from '../config/logger';

export function errorHandler(): ErrorRequestHandler {
  return (err, req, res, _next) => {
    const requestId = (req as any).id;

    const apiErr =
      err instanceof ApiError
        ? err
        : new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong', {
            cause: env.NODE_ENV === 'production' ? undefined : String(err?.message ?? err),
          });

    if (apiErr.status >= 500) {
      logger.error({ err, requestId }, 'request error');
    }

    res.status(apiErr.status).json({
      ok: false,
      code: apiErr.code,
      message: apiErr.message,
      details: apiErr.details,
      requestId,
    });
  };
}
