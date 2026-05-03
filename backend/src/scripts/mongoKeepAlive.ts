import mongoose from 'mongoose';
import { logger } from '../config/logger';

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function startMongoKeepAlive(): void {
  const run = async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        logger.warn({ readyState: mongoose.connection.readyState }, 'mongo keep-alive skipped — not connected');
        return;
      }
      // admin().ping() is a near-zero-cost command — no reads/writes
      await mongoose.connection.db.admin().ping();
      logger.info('mongo keep-alive ping ok');
    } catch (err) {
      logger.error({ err }, 'mongo keep-alive ping failed');
    }
  };

  // connectDb() is already awaited before this is called, so no delay needed
  void run();
  setInterval(() => void run(), INTERVAL_MS);

  logger.info({ intervalMs: INTERVAL_MS }, 'mongo keep-alive job started');
}