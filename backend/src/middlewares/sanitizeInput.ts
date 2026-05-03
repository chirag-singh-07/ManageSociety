import type { RequestHandler } from 'express';

function sanitizeString(value: string) {
  return value
    .replace(/\u0000/g, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = sanitizeValue(nestedValue);
    }
    return output;
  }

  return value;
}

export function sanitizeInput(): RequestHandler {
  return (req, _res, next) => {
    req.body = sanitizeValue(req.body);
    req.query = sanitizeValue(req.query) as any;
    req.params = sanitizeValue(req.params) as any;
    next();
  };
}
