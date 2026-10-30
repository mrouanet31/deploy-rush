import { describe, expect, it } from 'vitest';
import { PipelineEventState } from './PipelineEventState';

describe('PipelineEventState', () => {
  it('completes a single-action sequence on the expected action', () => {
    const state = new PipelineEventState(['FIX']);
    expect(state.nextAction).toBe('FIX');
    expect(state.applyAction('FIX')).toBe('complete');
    expect(state.complete).toBe(true);
  });

  it('progresses through a multi-step sequence in order', () => {
    const state = new PipelineEventState(['TEST', 'DEPLOY']);
    expect(state.applyAction('TEST')).toBe('progress');
    expect(state.nextAction).toBe('DEPLOY');
    expect(state.applyAction('DEPLOY')).toBe('complete');
  });

  it('reports wrong for an action outside the sequence and does not advance', () => {
    const state = new PipelineEventState(['FIX']);
    expect(state.applyAction('BLOCK')).toBe('wrong');
    expect(state.progress).toBe(0);
  });

  it('accepts an alternative first action', () => {
    const state = new PipelineEventState(['BLOCK'], ['ANALYZE']);
    expect(state.applyAction('ANALYZE')).toBe('complete');
  });

  it('only honors the alternative first action on the first step', () => {
    const state = new PipelineEventState(['ANALYZE', 'FIX'], ['BLOCK']);
    expect(state.applyAction('ANALYZE')).toBe('progress');
    expect(state.applyAction('BLOCK')).toBe('wrong');
    expect(state.progress).toBe(1);
  });
});
