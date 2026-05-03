import type { RequestHandler } from 'express';
import { ApiError } from '../shared/apiError';

function normalizeIp(ip: string) {
  return ip.replace(/^::ffff:/, '');
}

export function ipWhitelist(allowedIps: string[]): RequestHandler {
  const normalized = allowedIps.map((ip) => normalizeIp(ip));

  return (req, _res, next) => {
    if (normalized.length === 0) return next();

    const requestIp = normalizeIp(req.ip || '');
    if (!normalized.includes(requestIp)) {
      return next(new ApiError(403, 'IP_NOT_ALLOWED', 'IP address is not allowed'));
    }

    return next();
  };
}
