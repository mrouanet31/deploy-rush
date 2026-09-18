/**
 * Deploy Rush leaderboard API (Express development/server runtime).
 *
 * Production on Vercel uses the lightweight handlers in server/src/vercelApi.js
 * through /api/*.js. This Express server remains useful for Docker and local
 * development and can use the same Supabase store.
 */
import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createStore } from './createStore.js';
import { validateSubmission } from './validation.js';

const PORT = Number(process.env.PORT) || 8787;
const MAX_LIMIT = 50;
const SUBMIT_TOKEN = process.env.SUBMIT_TOKEN || '';
const IP_HASH_SALT = process.env.IP_HASH_SALT || crypto.randomBytes(16).toString('hex');
const EXTRA_BLOCKLIST = splitEnv(process.env.EXTRA_BLOCKLIST);
const ALLOWED_ORIGINS = splitEnv(process.env.ALLOWED_ORIGINS);

const store = await createStore();
const app = express();

app.set('trust proxy', process.env.TRUST_PROXY ?? 'loopback');
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

app.get('/api/health', asyncRoute(async (_req, res) => {
  res.json({ ok: true, store: store.kind, entries: await store.count() });
}));

app.get('/api/leaderboard/global', asyncRoute(async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const entries = await store.board({ daily: false, limit });
  res.json({ mode: 'global', entries: publicBoard(entries) });
}));

app.get('/api/leaderboard/daily', asyncRoute(async (req, res) => {
  const limit = clampLimit(req.query.limit);
  const seed = Number.parseInt(String(req.query.seed ?? ''), 10);
  if (!Number.isInteger(seed)) {
    return res.status(400).json({ error: 'seed (YYYYMMDD integer) is required' });
  }
  const entries = await store.board({ daily: true, seed, limit });
  res.json({ mode: 'daily', seed, entries: publicBoard(entries) });
}));

app.post('/api/scores', submitLimiter, requireSubmitAuth, asyncRoute(async (req, res) => {
  const parsed = validateSubmission(req.body, { blocklist: EXTRA_BLOCKLIST });
  if (!parsed.ok) {
    return res.status(parsed.status).json({ error: parsed.error });
  }

  const ipHash = hashIp(req.ip);
  const { entry, rank } = await store.add({ ...parsed.value, ipHash });
  const board = await store.board({ daily: entry.daily, seed: entry.seed, limit: 10 });
  res.status(201).json({ rank, id: entry.id, entries: publicBoard(board) });
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload too large' });
  }
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'invalid JSON body' });
  }
  if (err?.message === 'origin not allowed') {
    return res.status(403).json({ error: 'origin not allowed' });
  }
  console.error('[deploy-rush] unhandled error:', err?.message);
  return res.status(500).json({ error: 'internal error' });
});

app.listen(PORT, () => {
  console.log(`[deploy-rush] leaderboard API on http://localhost:${PORT}`);
  console.log(`[deploy-rush] store: ${store.kind}`);
  console.log(`[deploy-rush] auth: ${SUBMIT_TOKEN ? 'required (x-api-key)' : 'open'}`);
  console.log(`[deploy-rush] CORS: ${ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(', ') : 'all origins'}`);
});

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function corsOrigin(origin, callback) {
  if (!origin || ALLOWED_ORIGINS.length === 0) return callback(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error('origin not allowed'));
}

function requireSubmitAuth(req, res, next) {
  if (!SUBMIT_TOKEN) return next();
  const key = req.get('x-api-key') || '';
  const a = Buffer.from(key);
  const b = Buffer.from(SUBMIT_TOKEN);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    return next();
  }
  return res.status(401).json({ error: 'unauthorized' });
}

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`${ip}:${IP_HASH_SALT}`).digest('hex').slice(0, 16);
}

function publicBoard(entries) {
  return entries.map(({ id, name, score, duration, title, badges, difficulty, daily, seed, date }) => ({
    id,
    name,
    score,
    duration,
    title,
    badges: Array.isArray(badges) ? badges : [],
    difficulty,
    daily,
    seed,
    date
  }));
}

function clampLimit(raw) {
  const n = Number.parseInt(String(raw ?? '10'), 10);
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(MAX_LIMIT, n));
}

function splitEnv(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
