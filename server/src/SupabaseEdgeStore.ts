import type { BoardOptions, Entry, Store, SubmitData } from './types.js';

export class SupabaseEdgeStore implements Store {
  readonly kind = 'supabase';
  private readonly edgeBase: string;

  constructor(url = process.env.SUPABASE_URL ?? '') {
    if (!url) throw new Error('SUPABASE_URL is required for the Supabase store');
    this.edgeBase = `${new URL(url).href.replace(/\/$/, '')}/functions/v1/deploy-rush-api`;
  }

  async count(): Promise<number> {
    const data = await this.request<{ entries: number }>('/health');
    return data.entries;
  }

  async board({ daily, seed = 0, limit = 10 }: BoardOptions): Promise<Entry[]> {
    const query = new URLSearchParams({ limit: String(limit) });
    if (daily) query.set('seed', String(seed));
    const data = await this.request<{ entries: Entry[] }>(
      `/leaderboard/${daily ? 'daily' : 'global'}?${query}`
    );
    return data.entries;
  }

  async add(data: SubmitData): Promise<{ entry: Entry; rank: number }> {
    const { ipHash: _ipHash, ...submission } = data;
    const result = await this.request<{ id: string; rank: number; entries: Entry[] }>('/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    const entry = result.entries.find((item) => item.id === result.id) ?? {
      ...submission,
      id: result.id,
      date: new Date().toISOString()
    };
    return { entry, rank: result.rank };
  }

  close(): void {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.edgeBase}${path}`, {
      ...init,
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) throw new Error(`Supabase Edge API failed (${response.status})`);
    return await response.json() as T;
  }
}