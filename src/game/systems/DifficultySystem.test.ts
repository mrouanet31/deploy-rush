import { describe, expect, it } from 'vitest';
import { DIFFICULTY_PROFILES } from '../data/difficultyProfiles';
import { DifficultySystem } from './DifficultySystem';

describe('DifficultySystem', () => {
  it('ramps event speed and spawn interval over time', () => {
    const difficulty = new DifficultySystem(DIFFICULTY_PROFILES.normal);

    expect(difficulty.progress).toBe(0);
    expect(difficulty.eventSpeed()).toBe(130);
    expect(difficulty.spawnInterval(0)).toBe(1.7);

    difficulty.update(75);
    expect(difficulty.progress).toBe(0.5);
    expect(difficulty.eventSpeed()).toBe(185);
    expect(difficulty.spawnInterval(0)).toBeCloseTo(1.3);

    difficulty.update(999);
    expect(difficulty.progress).toBe(1);
    expect(difficulty.eventSpeed()).toBe(240);
    expect(difficulty.spawnInterval(0)).toBe(0.9);
  });

  it('accelerates spawns when tech debt is dangerous', () => {
    const difficulty = new DifficultySystem(DIFFICULTY_PROFILES.hard);
    difficulty.update(999);

    expect(difficulty.spawnInterval(100)).toBeCloseTo(0.525);
  });

  it('exposes sequence and lane-drift chances from ramp progress', () => {
    const difficulty = new DifficultySystem(DIFFICULTY_PROFILES.conference);

    expect(difficulty.sequenceChance()).toBe(0);
    expect(difficulty.laneDriftChance()).toBe(0);

    difficulty.update(100);
    expect(difficulty.sequenceChance()).toBe(0.5);
    expect(difficulty.laneDriftChance()).toBe(0.35);
  });
});
