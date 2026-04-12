import type { RequestHandler } from 'express';
import { randomId } from '../shared/id';

export function requestIdMiddleware(): RequestHandler {
  return (req, _res, next) => {
    (req as any).id = randomId(12);
    next();
  };
}
