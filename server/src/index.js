/**
 * Deploy Rush leaderboard API (hardened).
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/leaderboard/global?limit=10
 *   GET  /api/leaderboard/daily?seed=YYYYMMDD&limit=10
 *   POST /api/scores            { name, score, duration, title, badges, difficulty, daily, seed }
 *
 * Hardening: helmet security headers, CORS allowlist, per-IP rate limiting,
 * optional write auth (SUBMIT_TOKEN), anti-cheat score validation and handle
 * moderation. Storage is SQLite (better-sqlite3) with a JSON fallback.
 *
 * Configuration (env):
 *   PORT              default 8787
 *   ALLOWED_ORIGINS   comma list; empty = allow all (dev)
 *   SUBMIT_TOKEN      if set, POST /api/scores requires header x-api-key
 *   EXTRA_BLOCKLIST   comma list of extra banned handle substrings
 *   IP_HASH_SALT      salt for hashing IPs at rest (default: random per boot)
 *   TRUST_PROXY       express 'trust proxy' value (default 'loopback')
 *   STORE             'sqlite' (default) or 'json'
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

// Behind the Vite dev proxy / a reverse proxy, trust the first hop so rate
// limiting sees the real client IP.
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, store: store.kind, entries: store.count() });
});

app.get('/api/leaderboard/global', (req, res) => {
  const limit = clampLimit(req.query.limit);
  res.json({ mode: 'global', entries: publicBoard(store.board({ daily: false, limit })) });
});

app.get('/api/leaderboard/daily', (req, res) => {
  const limit = clampLimit(req.query.limit);
  const seed = Number.parseInt(String(req.query.seed ?? ''), 10);
  if (!Number.isInteger(seed)) {
    return res.status(400).json({ error: 'seed (YYYYMMDD integer) is required' });
  }
  res.json({ mode: 'daily', seed, entries: publicBoard(store.board({ daily: true, seed, limit })) });
});

app.post('/api/scores', submitLimiter, requireSubmitAuth, (req, res) => {
  const parsed = validateSubmission(req.body, { blocklist: EXTRA_BLOCKLIST });
  if (!parsed.ok) {
    return res.status(parsed.status).json({ error: parsed.error });
  }
  const ipHash = hashIp(req.ip);
  const { entry, rank } = store.add({ ...parsed.value, ipHash });
  const board = store.board({ daily: entry.daily, seed: entry.seed, limit: 10 });
  res.status(201).json({ rank, id: entry.id, entries: publicBoard(board) });
});

// Unknown API routes.
app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));

// Central error handler (malformed JSON, oversized payloads, etc.).
// eslint-disable-next-line no-unused-vars
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
  res.status(500).json({ error: 'internal error' });
});

app.listen(PORT, () => {
  console.log(`[deploy-rush] leaderboard API on http://localhost:${PORT}`);
  console.log(`[deploy-rush] auth: ${SUBMIT_TOKEN ? 'required (x-api-key)' : 'open'}`);
  console.log(`[deploy-rush] CORS: ${ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(', ') : 'all origins'}`);
});

// ---- helpers --------------------------------------------------------------

function corsOrigin(origin, callback) {
  // Allow non-browser clients (no Origin header) and, when no allowlist is
  // configured, any origin (development default).
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

/** Strip internal fields (e.g. ip_hash) before returning to clients. */
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
