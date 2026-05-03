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
  changePasswordSchema,
} from './validators';
import { bootstrapSuperadmin, login, logout, refresh, registerWithInvite, changePassword } from './service';
import { requireAuth } from '../../middlewares/auth';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}:${String(req.body?.email ?? '').toLowerCase()}`,
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
  loginLimiter,
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

authRouter.post(
  '/change-password',
  requireAuth(),
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    await changePassword(req.tenant!.userId, req.tenant!.role, input.oldPassword, input.newPassword);
    res.json({ ok: true });
  }),
);
