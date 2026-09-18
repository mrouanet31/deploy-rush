/**
 * Vercel Function handlers for the production leaderboard API.
 *
 * The browser calls /api/* on the Vercel domain. These handlers proxy to the
 * Supabase Edge Function that owns privileged database access and validation.
 */

const EDGE_BASE = 'https://qtvcjdibtypqeepvmkkp.supabase.co/functions/v1/deploy-rush-api';

export async function handleHealth(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return proxy(req, res, '/health');
}

export async function handleGlobal(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const query = new URLSearchParams();
  if (req.query?.limit != null) query.set('limit', String(req.query.limit));
  return proxy(req, res, `/leaderboard/global?${query.toString()}`);
}

export async function handleDaily(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const query = new URLSearchParams();
  if (req.query?.seed != null) query.set('seed', String(req.query.seed));
  if (req.query?.limit != null) query.set('limit', String(req.query.limit));
  return proxy(req, res, `/leaderboard/daily?${query.toString()}`);
}

export async function handleScores(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  return proxy(req, res, '/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body ?? {})
  });
}

function methodNotAllowed(res, allow) {
  res.setHeader('Allow', allow.join(', '));
  return res.status(405).json({ error: 'method not allowed' });
}

async function proxy(req, res, path, init = { method: 'GET' }) {
  try {
    const response = await fetch(`${EDGE_BASE}${path}`, init);
    const text = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');

    if (!text) return res.end();

    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (error) {
    console.error('[deploy-rush] Supabase proxy error:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'backend unavailable' });
  }
}
