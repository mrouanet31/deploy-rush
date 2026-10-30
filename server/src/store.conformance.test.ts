/**
 * Behavioural contract shared by every Store implementation (JSON and
 * SQLite). A new backend must pass this exact suite (see
 * PRODUCTION_READINESS.md, A0.2 / B2) so the HTTP layer can treat them
 * interchangeably.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Store as JsonStore } from './store.js';
import { SqliteStore } from './store-sqlite.js';
import type { Store, SubmitData } from './types.js';

function makeEntry(overrides: Partial<SubmitData> = {}): SubmitData {
  return {
    name: 'Player',
    score: 100,
    duration: 60,
    title: 'Chaos Engineer',
    badges: [],
    difficulty: 'conference',
    daily: false,
    seed: 0,
    ipHash: 'some-hash',
    ...overrides
  };
}

const backends: Array<{ name: string; create: (dir: string) => Store }> = [
  { name: 'json', create: (dir) => new JsonStore(join(dir, 'leaderboard.json')) },
  { name: 'sqlite', create: (dir) => new SqliteStore(join(dir, 'leaderboard.db')) }
];

describe.each(backends)('Store contract ($name)', ({ create }) => {
  let dir: string;
  let store: Store;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'deploy-rush-store-'));
    store = create(dir);
  });

  afterEach(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('starts empty', () => {
    expect(store.count()).toBe(0);
    expect(store.board({ daily: false })).toEqual([]);
  });

  it('assigns rank 1 to the first entry and adjusts ranks as better scores arrive', () => {
    const first = store.add(makeEntry({ score: 100 }));
    expect(first.rank).toBe(1);

    const second = store.add(makeEntry({ score: 50 }));
    expect(second.rank).toBe(2);

    const third = store.add(makeEntry({ score: 500 }));
    expect(third.rank).toBe(1);
  });

  it('orders the board by score descending, then by submission order', () => {
    store.add(makeEntry({ name: 'A', score: 10 }));
    store.add(makeEntry({ name: 'B', score: 30 }));
    store.add(makeEntry({ name: 'C', score: 20 }));
    const board = store.board({ daily: false });
    expect(board.map((e) => e.name)).toEqual(['B', 'C', 'A']);
  });

  it('scopes daily boards by seed', () => {
    store.add(makeEntry({ name: 'Today', daily: true, seed: 20260101, score: 10 }));
    store.add(makeEntry({ name: 'Yesterday', daily: true, seed: 20251231, score: 999 }));
    const board = store.board({ daily: true, seed: 20260101 });
    expect(board.map((e) => e.name)).toEqual(['Today']);
  });

  it('never mixes daily and global boards', () => {
    store.add(makeEntry({ daily: false, score: 10 }));
    store.add(makeEntry({ daily: true, seed: 1, score: 999 }));
    expect(store.board({ daily: false })).toHaveLength(1);
    expect(store.board({ daily: true, seed: 1 })).toHaveLength(1);
  });

  it('respects the limit option', () => {
    for (let i = 0; i < 5; i += 1) store.add(makeEntry({ score: i }));
    expect(store.board({ daily: false, limit: 2 })).toHaveLength(2);
  });

  it('round-trips badges', () => {
    const badges = [{ id: 'ship-it', label: 'Ship It', description: 'desc' }];
    store.add(makeEntry({ badges }));
    const [entry] = store.board({ daily: false });
    expect(entry.badges).toEqual(badges);
  });

  it('never exposes the ip hash on stored entries', () => {
    store.add(makeEntry());
    const [entry] = store.board({ daily: false });
    expect((entry as unknown as Record<string, unknown>).ip_hash).toBeUndefined();
    expect((entry as unknown as Record<string, unknown>).ipHash).toBeUndefined();
  });

  it('reports a string kind', () => {
    expect(typeof store.kind).toBe('string');
  });
});
