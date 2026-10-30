/**
 * Verifies SqliteStore.add() is transactional (see PRODUCTION_READINESS.md,
 * A4.2): if any step after the insert fails, the insert itself must be
 * rolled back rather than leaving an orphaned row with no rank/prune applied.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SqliteStore } from './store-sqlite.js';

describe('SqliteStore add() transaction', () => {
  let dir: string;
  let store: SqliteStore;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'deploy-rush-sqlite-tx-'));
    store = new SqliteStore(join(dir, 'leaderboard.db'));
  });

  afterEach(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('rolls back the insert if pruning fails partway through', () => {
    const pruneSpy = vi.spyOn(store as unknown as { _prune: () => void }, '_prune').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(() =>
      store.add({
        name: 'Player',
        score: 10,
        duration: 60,
        title: 'Chaos Engineer',
        badges: [],
        difficulty: 'conference',
        daily: false,
        seed: 0,
        ipHash: null
      })
    ).toThrow('boom');

    expect(store.count()).toBe(0);
    pruneSpy.mockRestore();
  });
});
