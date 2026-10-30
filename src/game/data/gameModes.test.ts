import { describe, expect, it } from 'vitest';
import { availableModes, availableModifiers, GAME_MODES, runModifier } from './gameModes';

describe('game mode configuration', () => {
  it('only enables training, local duel and DevFest Challenge by default', () => {
    expect(availableModes().map((mode) => mode.key)).toEqual(['training', 'versus', 'devfest']);
    expect(availableModes()[2].label).toBe('DevFest Challenge');
  });

  it('respects enabled flags and configured order', () => {
    expect(availableModes(GAME_MODES.map((mode) => ({ ...mode, enabled: mode.key === 'hard' })))
      .map((mode) => mode.key)).toEqual(['hard']);
  });

  it('uses the modifier subset configured for a score mode', () => {
    expect(availableModifiers({ ...GAME_MODES[2], modifiers: ['classic', 'precisionRun'] }))
      .toEqual(['classic', 'precisionRun']);
  });

  it('falls back to classic for an empty modifier list', () => {
    expect(availableModifiers({ ...GAME_MODES[2], modifiers: [] })).toEqual(['classic']);
  });

  it.each(availableModes())('preserves fixed rules for $label', (mode) => {
    expect(availableModifiers({ ...mode, modifiers: ['precisionRun'] })).toEqual(['classic']);
  });

  it('validates modifiers at run initialization', () => {
    expect(runModifier('conference', true, 'precisionRun')).toBe('classic');
    expect(runModifier('training', false, 'fastPipeline')).toBe('classic');
    expect(runModifier('normal', false, 'fastPipeline')).toBe('fastPipeline');
  });
});