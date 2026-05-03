import type { RequestHandler } from 'express';

export function apiResponseMiddleware(): RequestHandler {
  return (_req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = ((body: any) => {
      if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'ok')) {
        const { ok, ...rest } = body;
        return originalJson({ success: Boolean(ok), ...rest });
      }
      return originalJson(body);
    }) as typeof res.json;

    next();
  };
}
