import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DifficultyId, LeaderboardEntry, LeaderboardScope, RunModifierId } from '../types';
import { LeaderboardService } from './LeaderboardService';

const scopes: Record<string, LeaderboardScope> = {
  normal: { difficulty: 'normal', daily: false, seed: 0 },
  hard: { difficulty: 'hard', daily: false, seed: 0 },
  training: { difficulty: 'training', daily: false, seed: 0 },
  daily: { difficulty: 'conference', daily: true, seed: 20260709 }
};

describe('LeaderboardService', () => {
  beforeEach(() => {
    installLocalStorage();
    LeaderboardService.clear();
  });

  it('keeps local boards scoped by difficulty and daily seed', () => {
    LeaderboardService.submit(entry('NORMAL', 100, 'normal'), scopes.normal);
    LeaderboardService.submit(entry('HARD', 200, 'hard'), scopes.hard);
    LeaderboardService.submit(entry('DAILY', 300, 'conference', true, 20260709), scopes.daily);

    expect(LeaderboardService.load(scopes.normal).map((e) => e.name)).toEqual(['NORMAL']);
    expect(LeaderboardService.load(scopes.hard).map((e) => e.name)).toEqual(['HARD']);
    expect(LeaderboardService.load(scopes.daily).map((e) => e.name)).toEqual(['DAILY']);
    expect(LeaderboardService.load({ ...scopes.daily, seed: 20260708 })).toEqual([]);
  });

  it('previews rank inside the requested scope', () => {
    LeaderboardService.submit(entry('A', 300, 'normal'), scopes.normal);
    LeaderboardService.submit(entry('B', 100, 'normal'), scopes.normal);
    LeaderboardService.submit(entry('C', 999, 'hard'), scopes.hard);

    expect(LeaderboardService.previewRank(200, scopes.normal)).toBe(2);
    expect(LeaderboardService.previewRank(200, scopes.hard)).toBe(2);
  });

  it('keeps modified runs out of classic local boards', () => {
    const fastScope: LeaderboardScope = {
      difficulty: 'normal',
      daily: false,
      seed: 0,
      modifier: 'fastPipeline'
    };

    LeaderboardService.submit(entry('CLASSIC', 100, 'normal'), scopes.normal);
    LeaderboardService.submit(entry('FAST', 500, 'normal', false, 0, 'fastPipeline'), fastScope);

    expect(LeaderboardService.load(scopes.normal).map((e) => e.name)).toEqual(['CLASSIC']);
    expect(LeaderboardService.load(fastScope).map((e) => e.name)).toEqual(['FAST']);
    expect(LeaderboardService.previewRank(200, scopes.normal)).toBe(1);
    expect(LeaderboardService.previewRank(200, fastScope)).toBe(2);
  });

  it('prunes each scoped board independently', () => {
    for (let i = 0; i < 12; i++) {
      LeaderboardService.submit(entry(`N${i}`, i, 'normal'), scopes.normal);
    }
    LeaderboardService.submit(entry('TRAIN', 1, 'training'), scopes.training);

    const normal = LeaderboardService.load(scopes.normal);
    const training = LeaderboardService.load(scopes.training);

    expect(normal).toHaveLength(10);
    expect(normal[0].name).toBe('N11');
    expect(normal[9].name).toBe('N2');
    expect(training.map((e) => e.name)).toEqual(['TRAIN']);
  });

  it('normalizes legacy entries as conference global scores', () => {
    localStorage.setItem(
      'deploy-rush.leaderboard.v1',
      JSON.stringify([{ name: 'OLD', score: 42, date: '2026-07-09T00:00:00.000Z', duration: 60, title: 'Chaos Engineer' }])
    );

    expect(LeaderboardService.load({ difficulty: 'conference', daily: false, seed: 0 })[0]).toMatchObject({
      name: 'OLD',
      difficulty: 'conference',
      daily: false,
      seed: 0
    });
  });

  it('normalizes persisted badges and drops malformed badge rows', () => {
    localStorage.setItem(
      'deploy-rush.leaderboard.v1',
      JSON.stringify([
        {
          name: 'BADGED',
          score: 420,
          date: '2026-07-09T00:00:00.000Z',
          duration: 60,
          title: 'Build Guardian',
          difficulty: 'normal',
          daily: false,
          seed: 0,
          badges: [
            { id: 'clean-deploy', label: 'Clean Deploy', description: 'No incidents.' },
            { id: 'clean-deploy', label: 'Duplicate', description: 'Ignored.' },
            { id: 'broken', label: 123, description: 'Ignored.' }
          ]
        }
      ])
    );

    expect(LeaderboardService.load(scopes.normal)[0].badges).toEqual([
      { id: 'clean-deploy', label: 'Clean Deploy', description: 'No incidents.' }
    ]);
  });
});

function entry(
  name: string,
  score: number,
  difficulty: DifficultyId,
  daily = false,
  seed = 0,
  modifier?: RunModifierId
): LeaderboardEntry {
  return {
    name,
    score,
    difficulty,
    daily,
    seed,
    modifier,
    date: `2026-07-09T00:00:${score.toString().padStart(2, '0')}.000Z`,
    duration: 60,
    title: 'Chaos Engineer'
  };
}

function installLocalStorage(): void {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear()
  });
}
