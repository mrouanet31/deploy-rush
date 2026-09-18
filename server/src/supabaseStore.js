/**
 * Supabase-backed leaderboard store.
 *
 * Uses the Supabase Data API / RPC endpoint with a publishable key. The
 * underlying table is not exposed directly: database functions defined by the
 * migration own all reads/writes and enforce database-level constraints.
 */

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

export class SupabaseStore {
  constructor() {
    this.url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    this.key = process.env.SUPABASE_PUBLISHABLE_KEY || '';
    if (!this.url || !this.key) {
      throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required');
    }
  }

  async count() {
    const data = await this._rpc('deploy_rush_count');
    const value = Array.isArray(data) ? data[0] : data;
    return Number(value ?? 0);
  }

  async board({ daily, seed = 0, limit = 10 }) {
    const data = daily
      ? await this._rpc('deploy_rush_leaderboard_daily', {
          p_seed: seed,
          p_limit: limit
        })
      : await this._rpc('deploy_rush_leaderboard_global', {
          p_limit: limit
        });

    return (Array.isArray(data) ? data : []).map(normalizeEntry);
  }

  async add(data) {
    const result = await this._rpc('deploy_rush_submit_score', {
      p_name: data.name,
      p_score: data.score,
      p_duration: data.duration,
      p_title: data.title,
      p_badges: Array.isArray(data.badges) ? data.badges : [],
      p_difficulty: data.difficulty,
      p_daily: Boolean(data.daily),
      p_seed: data.seed ?? 0,
      p_ip_hash: data.ipHash ?? null
    });

    const row = Array.isArray(result) ? result[0] : result;
    if (!row?.id) throw new Error('Supabase did not return the inserted score');

    return {
      entry: {
        id: row.id,
        name: data.name,
        score: data.score,
        duration: data.duration,
        title: data.title,
        badges: Array.isArray(data.badges) ? data.badges : [],
        difficulty: data.difficulty,
        daily: Boolean(data.daily),
        seed: data.seed ?? 0,
        date: row.date ?? new Date().toISOString()
      },
      rank: Number(row.rank ?? 0)
    };
  }

  get kind() {
    return 'supabase';
  }

  async _rpc(name, body = {}) {
    const response = await fetch(`${this.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Supabase RPC ${name} failed (${response.status}): ${detail.slice(0, 500)}`);
    }

    return response.json();
  }
}

function normalizeEntry(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    score: Number(row.score),
    duration: Number(row.duration),
    title: String(row.title),
    badges: Array.isArray(row.badges) ? row.badges : [],
    difficulty: String(row.difficulty),
    daily: Boolean(row.daily),
    seed: Number(row.seed ?? 0),
    date: String(row.date)
  };
}
