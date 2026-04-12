import { Router } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ ok: true, status: 'up' });
});

healthRouter.get('/ready', async (_req, res) => {
  const isUp = mongoose.connection.readyState === 1;
  res.status(isUp ? 200 : 503).json({ ok: isUp, db: isUp ? 'connected' : 'disconnected' });
});

