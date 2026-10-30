import { describe, expect, it } from 'vitest';

function addScore(current: number, delta: number) { return Math.max(0, current + delta); }

describe('score', () => {
  it('does not go below zero', () => { expect(addScore(2, -5)).toBe(0); });
});
