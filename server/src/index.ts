/**
 * Deploy Rush leaderboard API — process entry point.
 *
 * Endpoints, hardening and configuration are documented in app.ts and
 * config.ts. This file only handles boot order, listen() and graceful
 * shutdown, so it can never be imported by a test without opening a real
 * port and (unless overridden) a real database (see PRODUCTION_READINESS.md,
 * A0.1).
 */
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createStore } from './createStore.js';
import type { Store } from './types.js';

const config = loadConfig();

let store: Store;
try {
  store = await createStore(config.store);
} catch (err) {
  console.error('[deploy-rush] failed to initialize store:', (err as Error).message);
  process.exit(1);
}

if (config.nodeEnv === 'production' && !config.ipHashSaltProvided) {
  console.warn(
    '[deploy-rush] IP_HASH_SALT not set — a random salt is generated per boot, so IP-based ' +
      'abuse detection resets on every restart. Set a persistent secret in production.'
  );
}

const app = createApp({ store, config });

const server = app.listen(config.port, () => {
  console.log(`[deploy-rush] leaderboard API on http://localhost:${config.port}`);
  console.log(`[deploy-rush] auth: ${config.submitToken ? 'required (x-api-key)' : 'open'}`);
  console.log(
    `[deploy-rush] CORS: ${config.allowedOrigins.length ? config.allowedOrigins.join(', ') : 'all origins'}`
  );
});

let shuttingDown = false;
function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[deploy-rush] ${signal} received, shutting down`);
  server.close(() => {
    store.close();
    process.exit(0);
  });
  // Force-exit if in-flight requests never drain (e.g. stuck connection).
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
