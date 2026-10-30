import type { PipelineEventDefinition, PlayerAction } from '../types';

export function requiredSequenceFor(definition: PipelineEventDefinition): PlayerAction[] {
  return [...definition.sequence];
}