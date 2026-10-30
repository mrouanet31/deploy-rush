import { describe, expect, it } from 'vitest';
import { RUN_MODIFIERS } from '../data/runModifiers';
import { EVENT_DEFINITIONS } from '../data/eventDefinitions';
import type { PipelineEventDefinition } from '../types';
import { RunRules } from './RunRules';

function makeDef(overrides: Partial<PipelineEventDefinition> = {}): PipelineEventDefinition {
  return {
    type: 'BUG',
    label: 'Bug',
    icon: '!',
    color: 0xff0000,
    lane: 'CODE',
    sequence: ['FIX'],
    onSuccess: { score: 100 },
    onIgnore: { score: -10, buildStability: -5 },
    onWrong: { score: -20 },
    basePoints: 100,
    weight: 1,
    ...overrides
  };
}

describe('RunRules', () => {
  it.each(Object.values(EVENT_DEFINITIONS))('restricts contextual input for $type', (definition) => {
    for (const expected of definition.sequence) {
      expect(RunRules.resolveInput('CONTEXT', expected)).toBe(
        definition.powerUp ? 'CONTEXT' : null
      );
      expect(RunRules.resolveInput('CONTEXT', expected, true)).toBe(expected);
      expect(RunRules.resolveInput(expected, expected)).toBe(expected);
    }
  });

  it('preserves wrong manual actions for normal penalty handling', () => {
    expect(RunRules.resolveInput('DEPLOY', 'TEST')).toBe('DEPLOY');
  });

  it('passes success effects through unchanged under the classic modifier', () => {
    const outcome = RunRules.resolveSuccess(makeDef());
    expect(outcome).toEqual({ effect: { score: 100 }, scoreOutcome: 'success', dangerous: false });
  });

  it('scales success score with an active run modifier', () => {
    const outcome = RunRules.resolveSuccess(makeDef(), RUN_MODIFIERS.fastPipeline);
    expect(outcome.effect.score).toBe(112);
  });

  it('does not scale a non-positive success effect', () => {
    const outcome = RunRules.resolveSuccess(makeDef({ onSuccess: { score: 0 } }), RUN_MODIFIERS.fastPipeline);
    expect(outcome.effect.score).toBe(0);
  });

  it('uses the dangerous effect override when the action is flagged dangerous', () => {
    const def = makeDef({
      dangerousActions: ['DEPLOY'],
      dangerousEffect: { score: -50, majorIncident: true }
    });
    const outcome = RunRules.resolveWrong(def, 'DEPLOY');
    expect(outcome).toEqual({
      effect: { score: -50, majorIncident: true },
      scoreOutcome: 'wrong',
      dangerous: true
    });
  });

  it('falls back to onWrong when the action is not flagged dangerous', () => {
    const def = makeDef({ dangerousActions: ['DEPLOY'] });
    const outcome = RunRules.resolveWrong(def, 'BLOCK');
    expect(outcome).toEqual({ effect: { score: -20 }, scoreOutcome: 'wrong', dangerous: false });
  });

  it('amplifies wrong-action penalties under a penalty modifier', () => {
    const outcome = RunRules.resolveWrong(makeDef(), 'BLOCK', RUN_MODIFIERS.fragileProd);
    expect(outcome.effect.score).toBe(-24);
  });

  it('resolves the ignore outcome from onIgnore', () => {
    const outcome = RunRules.resolveIgnore(makeDef());
    expect(outcome).toEqual({
      effect: { score: -10, buildStability: -5 },
      scoreOutcome: 'ignore',
      dangerous: false
    });
  });
});
