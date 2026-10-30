/**
 * Express app factory (see PRODUCTION_READINESS.md, A0.1). Pure wiring: no
 * listen(), no store construction — both are injected so tests can run the
 * full HTTP pipeline against a fake or temporary store without a network
 * port or a real database.
 */
import crypto from 'node:crypto';
import cors from 'cors';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { submitScore, toPublicEntries } from './leaderboardService.js';
import type { Config, Store } from './types.js';

export interface CreateAppDeps {
  store: Store;
  config: Config;
}

export function createApp({ store, config }: CreateAppDeps): Application {
  const app = express();

  app.set('trust proxy', config.trustProxy);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, methods: ['GET', 'POST'], maxAge: 600 }));
  app.use(express.json({ limit: '8kb', type: 'application/json' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too many requests, slow down' }
  });
  const submitLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too many submissions, try again shortly' }
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, store: store.kind, entries: store.count() });
  });

  app.get('/api/leaderboard/global', (req: Request, res: Response) => {
    const limit = clampLimit(req.query.limit, config.maxLimit);
    res.json({ mode: 'global', entries: toPublicEntries(store.board({ daily: false, limit })) });
  });

  app.get('/api/leaderboard/daily', (req: Request, res: Response) => {
    const limit = clampLimit(req.query.limit, config.maxLimit);
    const seed = Number.parseInt(String(req.query.seed ?? ''), 10);
    if (!Number.isInteger(seed)) {
      return res.status(400).json({ error: 'seed (YYYYMMDD integer) is required' });
    }
    res.json({
      mode: 'daily',
      seed,
      entries: toPublicEntries(store.board({ daily: true, seed, limit }))
    });
  });

  app.post('/api/scores', submitLimiter, requireSubmitAuth, (req: Request, res: Response) => {
    const ipHash = hashIp(req.ip, config.ipHashSalt);
    const result = submitScore({ store, body: req.body, ipHash, blocklist: config.extraBlocklist });
    if (!result.ok) {
      if (result.status === 500) {
        const message = result.cause instanceof Error ? result.cause.message : String(result.cause);
        console.error('[deploy-rush] failed to save score:', message);
      }
      return res.status(result.status).json({ error: result.error });
    }
    res.status(201).json({ rank: result.rank, id: result.id, entries: toPublicEntries(result.board) });
  });

  // Unknown API routes.
  app.use('/api', (_req: Request, res: Response) => res.status(404).json({ error: 'not found' }));

  // Central error handler (malformed JSON, oversized payloads, etc.).
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const asRecord = err as { type?: string; message?: string } | undefined;
    if (asRecord?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'payload too large' });
    }
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: 'invalid JSON body' });
    }
    if (asRecord?.message === 'origin not allowed') {
      return res.status(403).json({ error: 'origin not allowed' });
    }
    console.error('[deploy-rush] unhandled error:', asRecord?.message);
    res.status(500).json({ error: 'internal error' });
  });

  return app;

  // ---- helpers (closed over config) ----------------------------------

  function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
    // Allow non-browser clients (no Origin header) and, when no allowlist is
    // configured, any origin (development default).
    if (!origin || config.allowedOrigins.length === 0) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('origin not allowed'));
  }

  function requireSubmitAuth(req: Request, res: Response, next: NextFunction): void {
    if (!config.submitToken) return next();
    const key = req.get('x-api-key') || '';
    const a = Buffer.from(key);
    const b = Buffer.from(config.submitToken);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return next();
    }
    res.status(401).json({ error: 'unauthorized' });
  }
}

function hashIp(ip: string | undefined, salt: string): string | null {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16);
}

function clampLimit(raw: unknown, maxLimit: number): number {
  const n = Number.parseInt(String(raw ?? '10'), 10);
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(maxLimit, n));
}
