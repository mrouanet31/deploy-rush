import { describe, expect, it } from 'vitest';
import { seedForDate, validateSubmission } from './validation.js';

const NOW = new Date('2026-07-09T12:00:00.000Z');

describe('validateSubmission', () => {
  it('accepts and normalizes a plausible daily submission', () => {
    const result = validateSubmission(
      {
        name: 'Alice_1',
        score: 12000,
        duration: 60,
        title: 'Build Guardian',
        difficulty: 'hard',
        daily: true,
        seed: seedForDate(NOW)
      },
      { now: NOW }
    );

    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Alice_1',
        score: 12000,
        duration: 60,
        title: 'Build Guardian',
        badges: [],
        difficulty: 'hard',
        daily: true,
        seed: 20260709
      }
    });
  });

  it('rejects implausible scores for the reported duration', () => {
    const result = validateSubmission(
      {
        name: 'Speedy',
        score: 100000,
        duration: 1,
        title: 'Chaos Engineer',
        difficulty: 'conference',
        daily: false,
        seed: 0
      },
      { now: NOW }
    );

    expect(result).toMatchObject({
      ok: false,
      status: 422,
      error: 'score is implausible for the reported duration'
    });
  });

  it('rejects daily submissions outside the current challenge window', () => {
    const result = validateSubmission(
      {
        name: 'DailyFan',
        score: 5000,
        duration: 60,
        title: 'Prod Savior',
        difficulty: 'conference',
        daily: true,
        seed: 20260701
      },
      { now: NOW }
    );

    expect(result).toMatchObject({
      ok: false,
      status: 422,
      error: 'daily seed is not for the current challenge'
    });
  });

  it('moderates reserved names and extra blocklist words', () => {
    expect(validateSubmission(basePayload({ name: 'Admin' }), { now: NOW })).toMatchObject({
      ok: false,
      status: 400,
      error: 'name is reserved'
    });
    expect(validateSubmission(basePayload({ name: 'releaseboss' }), { now: NOW, blocklist: ['boss'] })).toMatchObject({
      ok: false,
      status: 400,
      error: 'name is not allowed'
    });
  });

  it('coerces unknown difficulty and title to safe defaults', () => {
    const result = validateSubmission(
      basePayload({ difficulty: 'training', title: 'Impossible Title' }),
      { now: NOW }
    );

    expect(result).toMatchObject({
      ok: true,
      value: {
        difficulty: 'conference',
        title: 'Chaos Engineer'
      }
    });
  });

  it('canonicalizes known run badges and drops unknown badges', () => {
    const result = validateSubmission(
      basePayload({
        badges: [
          { id: 'clean-deploy', label: 'forged', description: 'forged' },
          { id: 'unknown-badge', label: '???', description: '???' },
          'combo-engine',
          'clean-deploy'
        ]
      }),
      { now: NOW }
    );

    expect(result).toMatchObject({
      ok: true,
      value: {
        badges: [
          {
            id: 'clean-deploy',
            label: 'Clean Deploy'
          },
          {
            id: 'combo-engine',
            label: 'Combo Engine'
          }
        ]
      }
    });
  });
});

function basePayload(overrides = {}) {
  return {
    name: 'Runner',
    score: 5000,
    duration: 60,
    title: 'Chaos Engineer',
    difficulty: 'conference',
    daily: false,
    seed: 0,
    ...overrides
  };
}
