/**
 * Vercel Function handlers for the production leaderboard API.
 *
 * The browser calls /api/* on the same Vercel domain. Persistence is provided
 * by Supabase via SupabaseStore.
 */
import { validateSubmission } from './validation.js';
import { SupabaseStore } from './supabaseStore.js';

const MAX_LIMIT = 50;
const store = new SupabaseStore();

export async function handleHealth(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return run(res, async () => {
    const entries = await store.count();
    res.status(200).json({ ok: true, store: store.kind, entries });
  });
}

export async function handleGlobal(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return run(res, async () => {
    const entries = await store.board({ daily: false, limit: clampLimit(req.query?.limit) });
    res.status(200).json({ mode: 'global', entries });
  });
}

export async function handleDaily(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const seed = Number.parseInt(String(req.query?.seed ?? ''), 10);
  if (!Number.isInteger(seed)) {
    return res.status(400).json({ error: 'seed (YYYYMMDD integer) is required' });
  }

  return run(res, async () => {
    const entries = await store.board({
      daily: true,
      seed,
      limit: clampLimit(req.query?.limit)
    });
    res.status(200).json({ mode: 'daily', seed, entries });
  });
}

export async function handleScores(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const submitToken = process.env.SUBMIT_TOKEN || '';
  if (submitToken && String(req.headers?.['x-api-key'] || '') !== submitToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  let body;
  try {
    body = parseBody(req.body);
  } catch {
    return res.status(400).json({ error: 'invalid JSON body' });
  }

  const parsed = validateSubmission(body, {
    blocklist: splitEnv(process.env.EXTRA_BLOCKLIST)
  });
  if (!parsed.ok) {
    return res.status(parsed.status).json({ error: parsed.error });
  }

  return run(res, async () => {
    const { entry, rank } = await store.add({
      ...parsed.value,
      ipHash: null
    });
    const entries = await store.board({
      daily: entry.daily,
      seed: entry.seed,
      limit: 10
    });
    res.status(201).json({ rank, id: entry.id, entries });
  });
}

function parseBody(value) {
  if (typeof value === 'string') return JSON.parse(value);
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  return value ?? {};
}

function clampLimit(raw) {
  const n = Number.parseInt(String(raw ?? '10'), 10);
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(MAX_LIMIT, n));
}

function splitEnv(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function methodNotAllowed(res, allow) {
  res.setHeader('Allow', allow.join(', '));
  return res.status(405).json({ error: 'method not allowed' });
}

async function run(res, action) {
  try {
    await action();
  } catch (error) {
    console.error('[deploy-rush] API error:', error instanceof Error ? error.message : error);
    if (!res.headersSent) res.status(500).json({ error: 'internal error' });
  }
}
