/**
 * Difficulty profiles. The menu launches `conference` by default
 * (fast, punchy, event-friendly); `training` uses scripted spawns.
 */
import type { DifficultyId, DifficultyProfile } from '../types';

export const DIFFICULTY_PROFILES: Record<DifficultyId, DifficultyProfile> = {
  training: {
    id: 'training',
    label: 'Training',
    baseSpawnInterval: 99,
    minSpawnInterval: 99,
    baseSpeed: 115,
    maxSpeed: 155,
    rampSeconds: 60,
    sequenceChanceAtMax: 0,
    matchDuration: 60
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    baseSpawnInterval: 1.7,
    minSpawnInterval: 0.9,
    baseSpeed: 130,
    maxSpeed: 240,
    rampSeconds: 150,
    sequenceChanceAtMax: 0.25,
    matchDuration: 150
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    baseSpawnInterval: 1.4,
    minSpawnInterval: 0.7,
    baseSpeed: 160,
    maxSpeed: 300,
    rampSeconds: 120,
    sequenceChanceAtMax: 0.4,
    matchDuration: 180
  },
  conference: {
    id: 'conference',
    label: 'Conference',
    baseSpawnInterval: 1.25,
    minSpawnInterval: 0.6,
    baseSpeed: 180,
    maxSpeed: 340,
    rampSeconds: 100,
    sequenceChanceAtMax: 0.5,
    matchDuration: 210
  }
};

export const DEFAULT_DIFFICULTY: DifficultyId = 'conference';
