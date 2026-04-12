import type { RequestHandler } from 'express';
import { Society } from '../modules/society/model';
import { ApiError } from '../shared/apiError';

export function checkSubscription(): RequestHandler {
  return async (req, _res, next) => {
    // Skip check for Superadmins (they manage all)
    if (req.tenant?.role === 'superadmin') return next();

    const societyId = req.tenant?.societyId;
    if (!societyId) return next();

    try {
      const society = await Society.findById(societyId);
      if (!society) return next(new ApiError(404, 'NOT_FOUND', 'Society not found'));

      // Check for suspension
      if (society.status === 'suspended') {
        return next(new ApiError(402, 'ACCOUNT_SUSPENDED', 'This society account has been suspended by the developer.'));
      }

      // Check for expiry
      const now = new Date();
      if (society.trialEndsAt && society.trialEndsAt < now) {
        return next(new ApiError(402, 'SUBSCRIPTION_EXPIRED', 'Your trial or subscription has ended. Please renew to continue.'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
