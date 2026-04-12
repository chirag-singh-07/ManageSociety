import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../shared/asyncHandler';
import { ApiError } from '../../shared/apiError';
import { env } from '../../config/env';
import {
  bootstrapSuperadminSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from './validators';
import { bootstrapSuperadmin, login, logout, refresh, registerWithInvite } from './service';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post(
  '/bootstrap/superadmin',
  authLimiter,
  asyncHandler(async (req, res) => {
    const key = req.headers['x-bootstrap-key'];
    const canBootstrap =
      env.NODE_ENV !== 'production' || (env.SUPERADMIN_BOOTSTRAP_KEY && key === env.SUPERADMIN_BOOTSTRAP_KEY);
    if (!canBootstrap) throw new ApiError(403, 'FORBIDDEN', 'Bootstrap disabled');

    const input = bootstrapSuperadminSchema.parse(req.body);
    const result = await bootstrapSuperadmin(input);
    res.json({ ok: true, superadmin: result });
  }),
);

authRouter.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const user = await registerWithInvite(input);
    res.status(201).json({
      ok: true,
      user,
      next: user.status === 'pending' ? 'WAIT_FOR_ADMIN_APPROVAL' : 'LOGIN',
    });
  }),
);

authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const tokens = await login(input);
    res.json({ ok: true, ...tokens });
  }),
);

authRouter.post(
  '/refresh',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = refreshSchema.parse(req.body);
    const tokens = await refresh(input.refreshToken);
    res.json({ ok: true, ...tokens });
  }),
);

authRouter.post(
  '/logout',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = refreshSchema.parse(req.body);
    await logout(input.refreshToken);
    res.json({ ok: true });
  }),
);
