/**
 * Optional run modifiers. They apply only to solo score runs; training, daily
 * challenge and local duel keep fixed rules for fairness.
 */
import type { EventEffect, RunModifierId } from '../types';

export interface RunModifierProfile {
  id: RunModifierId;
  label: string;
  shortLabel: string;
  desc: string;
  scoreMultiplier: number;
  speedMultiplier?: number;
  spawnRateMultiplier?: number;
  penaltyMultiplier?: number;
  initialBuildStability?: number;
  initialProductionHealth?: number;
  initialTechDebt?: number;
}

export const RUN_MODIFIERS: Record<RunModifierId, RunModifierProfile> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    shortLabel: 'CLASSIC',
    desc: 'Default rules.',
    scoreMultiplier: 1
  },
  fastPipeline: {
    id: 'fastPipeline',
    label: 'Fast Pipeline',
    shortLabel: 'FAST',
    desc: '+12% score, faster conveyor and spawns.',
    scoreMultiplier: 1.12,
    speedMultiplier: 1.18,
    spawnRateMultiplier: 1.12
  },
  fragileProd: {
    id: 'fragileProd',
    label: 'Fragile Prod',
    shortLabel: 'FRAGILE',
    desc: '+20% score, prod starts lower and mistakes hurt more.',
    scoreMultiplier: 1.2,
    penaltyMultiplier: 1.2,
    initialProductionHealth: -25
  },
  techDebtSurge: {
    id: 'techDebtSurge',
    label: 'Tech Debt Surge',
    shortLabel: 'DEBT',
    desc: '+15% score, starts with debt and slightly faster spawns.',
    scoreMultiplier: 1.15,
    spawnRateMultiplier: 1.06,
    initialTechDebt: 35
  },
  precisionRun: {
    id: 'precisionRun',
    label: 'Precision Run',
    shortLabel: 'PRECISION',
    desc: '+30% score, no starting penalty, mistakes hit hard.',
    scoreMultiplier: 1.3,
    penaltyMultiplier: 1.35
  }
};

export const RUN_MODIFIER_IDS: RunModifierId[] = [
  'classic',
  'fastPipeline',
  'fragileProd',
  'techDebtSurge',
  'precisionRun'
];

export const DEFAULT_RUN_MODIFIER: RunModifierId = 'classic';

export function applyRunModifierToEffect(
  effect: EventEffect,
  outcome: 'success' | 'wrong' | 'ignore',
  modifier: RunModifierProfile
): EventEffect {
  if (modifier.id === 'classic') return effect;

  const next: EventEffect = { ...effect };
  if (outcome === 'success' && next.score !== undefined && next.score > 0) {
    next.score = Math.round(next.score * modifier.scoreMultiplier);
  }

  if ((outcome === 'wrong' || outcome === 'ignore') && modifier.penaltyMultiplier) {
    next.score = multiplyIf(next.score, (value) => value < 0, modifier.penaltyMultiplier);
    next.buildStability = multiplyIf(next.buildStability, (value) => value < 0, modifier.penaltyMultiplier);
    next.productionHealth = multiplyIf(next.productionHealth, (value) => value < 0, modifier.penaltyMultiplier);
    next.techDebt = multiplyIf(next.techDebt, (value) => value > 0, modifier.penaltyMultiplier);
  }

  return next;
}

function multiplyIf(
  value: number | undefined,
  predicate: (value: number) => boolean,
  multiplier: number
): number | undefined {
  if (value === undefined || !predicate(value)) return value;
  return Math.round(value * multiplier);
}
