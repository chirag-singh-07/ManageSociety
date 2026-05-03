import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.oldPassword',
      'req.body.newPassword',
      'req.body.refreshToken',
      'refreshToken',
      'accessToken',
      'token',
      '*.passwordHash',
    ],
    remove: true,
  },
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});
