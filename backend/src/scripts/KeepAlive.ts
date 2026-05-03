import https from 'https';
import http from 'http';
import { logger } from '../config/logger';

const INTERVAL_MS = 14 * 60 * 1000; // 14 min — Render free tier sleeps after 15

function ping(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https://') ? https : http;
    const req = lib.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

export function startKeepAlive(): void {
  const base = process.env.PING_URL;
  if (!base) {
    logger.warn('PING_URL not set — skipping keep-alive job');
    return;
  }

  const url = base.endsWith('/health')
    ? base
    : `${base.replace(/\/+$/g, '')}/health`;

  const run = async () => {
    try {
      const res = await ping(url);
      if (res.status >= 200 && res.status < 300) {
        logger.info({ status: res.status, url }, 'keep-alive ping ok');
      } else {
        logger.error({ status: res.status, body: res.body, url }, 'keep-alive unexpected status');
      }
    } catch (err) {
      logger.error({ err, url }, 'keep-alive request failed');
    }
  };

  void run();
  setInterval(() => void run(), INTERVAL_MS);

  logger.info({ url, intervalMs: INTERVAL_MS }, 'keep-alive job started');
}