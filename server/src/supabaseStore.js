/**
 * Supabase-backed leaderboard store for the local/Express server.
 *
 * Privileged database access lives in the Supabase Edge Function. This store
 * talks to that HTTP API so local/Docker and Vercel production share the same
 * validation and persistence behavior.
 */

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL);
}

export class SupabaseStore {
  constructor() {
    this.url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    if (!this.url) throw new Error('SUPABASE_URL is required');
    this.edgeBase = `${this.url}/functions/v1/deploy-rush-api`;
  }

  async count() {
    const data = await this._request('/health');
    return Number(data.entries ?? 0);
  }

  async board({ daily, seed = 0, limit = 10 }) {
    const query = new URLSearchParams({ limit: String(limit) });
    const path = daily
      ? `/leaderboard/daily?seed=${encodeURIComponent(seed)}&${query.toString()}`
      : `/leaderboard/global?${query.toString()}`;
    const data = await this._request(path);
    return Array.isArray(data.entries) ? data.entries : [];
  }

  async add(data) {
    const result = await this._request('/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        score: data.score,
        duration: data.duration,
        title: data.title,
        badges: data.badges,
        difficulty: data.difficulty,
        daily: data.daily,
        seed: data.seed
      })
    });

    const entry = Array.isArray(result.entries)
      ? result.entries.find((item) => item.id === result.id)
      : null;

    return {
      entry: entry ?? {
        id: result.id,
        name: data.name,
        score: data.score,
        duration: data.duration,
        title: data.title,
        badges: Array.isArray(data.badges) ? data.badges : [],
        difficulty: data.difficulty,
        daily: Boolean(data.daily),
        seed: data.seed ?? 0,
        date: new Date().toISOString()
      },
      rank: Number(result.rank ?? 0)
    };
  }

  get kind() {
    return 'supabase';
  }

  async _request(path, init = { method: 'GET' }) {
    const response = await fetch(`${this.edgeBase}${path}`, init);
    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `Supabase Edge API failed (${response.status}): ${text.slice(0, 500)}`
      );
    }

    return text ? JSON.parse(text) : {};
  }
}
