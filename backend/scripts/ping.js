/* eslint-disable no-console */


import https from "https";
import http from "http";

function request(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https://') ? https : http;
    const req = lib.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const base = process.env.PING_URL;
  if (!base) {
    console.error('PING_URL is required');
    process.exit(2);
  }
  const url = base.endsWith('/health') ? base : `${base.replace(/\/+$/g, '')}/health`;
  const res = await request(url);
  if (res.status < 200 || res.status >= 300) {
    console.error(`ping failed: ${res.status} ${res.body}`);
    process.exit(1);
  }
  console.log(`ping ok: ${res.status}`);
}

main().catch((err) => {
  console.error('ping error:', err?.message || err);
  process.exit(1);
});

