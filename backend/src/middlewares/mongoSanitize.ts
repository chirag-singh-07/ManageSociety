import type { RequestHandler } from 'express';

const dangerousKeys = new Set(['__proto__', 'prototype', 'constructor']);

function sanitizeObject(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) value[i] = sanitizeObject(value[i]);
    return value;
  }

  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (dangerousKeys.has(key) || key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    obj[key] = sanitizeObject(obj[key]);
  }
  return obj;
}

export function mongoSanitize(): RequestHandler {
  return (req, _res, next) => {
    // Prevent NoSQL injection primitives like $where / $gt and path-traversal keys like "a.b".
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query) as any;
    req.params = sanitizeObject(req.params) as any;
    next();
  };
}

