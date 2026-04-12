import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { requestIdMiddleware } from './middlewares/requestId';
import { mongoSanitize } from './middlewares/mongoSanitize';
import { errorHandler } from './middlewares/error';
import { notFoundHandler } from './middlewares/notFound';
import { ApiError } from './shared/apiError';
import { checkSubscription } from './middlewares/subscription';
import { healthRouter } from './modules/health/routes';
import { authRouter } from './modules/auth/routes';
import { superadminRouter } from './modules/superadmin/routes';
import { adminRouter } from './modules/admin/routes';
import { tenantRouter } from './modules/tenant/routes';

export function createApp() {
  const app = express();

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
    }),
  );

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.ALLOWED_ORIGINS.length === 0) return cb(null, true);
        if (env.ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new ApiError(403, 'CORS_NOT_ALLOWED', 'Origin not allowed'));
      },
      credentials: true,
    }),
  );

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/superadmin', superadminRouter);
  
  // Apply subscription check to all tenant-level routes
  app.use('/api/admin', checkSubscription(), adminRouter);
  app.use('/api', checkSubscription(), tenantRouter);

  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
