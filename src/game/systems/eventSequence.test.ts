import { describe, expect, it } from 'vitest';
import { EVENT_DEFINITIONS } from '../data/eventDefinitions';
import { requiredSequenceFor } from './eventSequence';

describe('event required sequences', () => {
  it.each(Object.values(EVENT_DEFINITIONS))('preserves every defined step for $type', (definition) => {
    expect(requiredSequenceFor(definition)).toEqual(definition.sequence);
    expect(requiredSequenceFor(definition)).toHaveLength(definition.sequence.length);
  });
});