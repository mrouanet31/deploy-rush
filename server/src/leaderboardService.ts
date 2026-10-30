/**
 * LeaderboardService — application use case for submitting a score
 * (see PRODUCTION_READINESS.md, A4.1). Keeps Express handlers thin: they
 * only translate HTTP <-> this service's plain request/result objects.
 */
import { validateSubmission } from './validation.js';
import type { Entry, Store } from './types.js';

export interface SubmitScoreParams {
  store: Store;
  body: unknown;
  ipHash: string | null;
  blocklist?: string[];
}

export type SubmitScoreResult =
  | { ok: true; rank: number; id: string; board: Entry[] }
  | { ok: false; status: number; error: string; cause?: unknown };

export async function submitScore({ store, body, ipHash, blocklist = [] }: SubmitScoreParams): Promise<SubmitScoreResult> {
  const parsed = validateSubmission(body, { blocklist });
  if (!parsed.ok) {
    return { ok: false, status: parsed.status, error: parsed.error };
  }

  let entry: Entry;
  let rank: number;
  try {
    ({ entry, rank } = await store.add({ ...parsed.value, ipHash }));
  } catch (err) {
    return { ok: false, status: 500, error: 'failed to save score', cause: err };
  }

  const board = await store.board({ daily: entry.daily, seed: entry.seed, limit: 10 });
  return { ok: true, rank, id: entry.id, board };
}

/** Strip internal fields (e.g. ip_hash) before returning entries to clients. */
export function toPublicEntries(entries: Entry[]): Entry[] {
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
