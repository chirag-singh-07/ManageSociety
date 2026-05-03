import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { requestIdMiddleware } from './middlewares/requestId';
import { mongoSanitize } from './middlewares/mongoSanitize';
import { sanitizeInput } from './middlewares/sanitizeInput';
import { apiResponseMiddleware } from './middlewares/apiResponse';
import { errorHandler } from './middlewares/error';
import { notFoundHandler } from './middlewares/notFound';
import { ApiError } from './shared/apiError';
import { checkSubscription } from './middlewares/subscription';
import { ipWhitelist } from './middlewares/ipWhitelist';
import { healthRouter } from './modules/health/routes';
import { authRouter } from './modules/auth/routes';
import { superadminRouter } from './modules/superadmin/routes';
import { adminRouter } from './modules/admin/routes';
import { tenantRouter } from './modules/tenant/routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);
  app.set('query parser', 'simple');

  app.use(apiResponseMiddleware());
  app.use(requestIdMiddleware());
  app.use(
    pinoHttp({
      // pino-http / pino type versions can drift; runtime is compatible.
      logger: logger as any,
      genReqId: (req) => (req as any).id,
      customProps: (req) => ({
        requestId: (req as any).id,
        societyId: req.tenant?.societyId,
        userId: req.tenant?.userId,
        role: req.tenant?.role,
      }),
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.use(express.json({ limit: env.REQUEST_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: env.REQUEST_SIZE_LIMIT, parameterLimit: 25 }));
  app.use(mongoSanitize());
  app.use(sanitizeInput());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.ALLOWED_ORIGINS.length === 0) {
          if (env.NODE_ENV !== 'production') return cb(null, true);
          return cb(new ApiError(500, 'CORS_NOT_CONFIGURED', 'Allowed origins are not configured'));
        }
        if (env.ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new ApiError(403, 'CORS_NOT_ALLOWED', 'Origin not allowed'));
      },
      credentials: true,
    }),
  );

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: env.GLOBAL_RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use('/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/v1/superadmin', ipWhitelist(env.ADMIN_IP_WHITELIST), superadminRouter);
  app.use('/api/superadmin', ipWhitelist(env.ADMIN_IP_WHITELIST), superadminRouter);
  
  // Apply subscription check to all tenant-level routes
  app.use('/api/v1/admin', ipWhitelist(env.ADMIN_IP_WHITELIST), checkSubscription(), adminRouter);
  app.use('/api/admin', ipWhitelist(env.ADMIN_IP_WHITELIST), checkSubscription(), adminRouter);
  app.use('/api/v1', checkSubscription(), tenantRouter);
  app.use('/api', checkSubscription(), tenantRouter);

  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
