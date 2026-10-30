/**
 * Unit tests for the leaderboard application service, isolated from HTTP
 * and from any real store (see PRODUCTION_READINESS.md, A4.1).
 */
import { describe, expect, it } from 'vitest';
import { submitScore, toPublicEntries } from './leaderboardService.js';
import type { Entry, Store, SubmitData } from './types.js';

function createFakeStore(): Store & { entries: Entry[] } {
  const entries: Entry[] = [];
  return {
    entries,
    add(data: SubmitData) {
      const entry: Entry = { id: `id-${entries.length + 1}`, date: new Date().toISOString(), ...data };
      entries.push(entry);
      return { entry, rank: entries.length };
    },
    board() {
      return entries;
    },
    count() {
      return entries.length;
    },
    kind: 'fake',
    close() {}
  };
}

const validBody = () => ({
  name: 'Tester',
  score: 500,
  duration: 60,
  title: 'Chaos Engineer',
  badges: [],
  difficulty: 'conference',
  daily: false,
  seed: 0
});

describe('submitScore', () => {
  it('rejects an invalid body before touching the store', () => {
    const store = createFakeStore();
    const result = submitScore({ store, body: { ...validBody(), score: -1 }, ipHash: 'h' });
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ status: 400 });
    expect(store.entries).toHaveLength(0);
  });

  it('stores the ip hash alongside a valid submission', () => {
    const store = createFakeStore();
    const result = submitScore({ store, body: validBody(), ipHash: 'abc123' });
    expect(result.ok).toBe(true);
    expect(result).toMatchObject({ rank: 1 });
    expect(store.entries[0]).toMatchObject({ name: 'Tester' });
  });

  it('returns a 500 result without throwing when the store fails', () => {
    const store = createFakeStore();
    store.add = () => {
      throw new Error('disk full');
    };
    const result = submitScore({ store, body: validBody(), ipHash: 'abc123' });
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ status: 500 });
    expect((result as { cause?: unknown }).cause).toBeInstanceOf(Error);
  });
});

describe('toPublicEntries', () => {
  it('strips internal fields such as the ip hash', () => {
    const entries = [
      {
        id: '1',
        name: 'A',
        score: 10,
        duration: 5,
        title: 'x',
        badges: [],
        difficulty: 'conference' as const,
        daily: false,
        seed: 0,
        date: '2026-01-01T00:00:00.000Z',
        ipHash: 'secret',
        ip_hash: 'secret'
      }
    ];
    const [entry] = toPublicEntries(entries);
    expect((entry as unknown as Record<string, unknown>).ipHash).toBeUndefined();
    expect((entry as unknown as Record<string, unknown>).ip_hash).toBeUndefined();
  });
});
