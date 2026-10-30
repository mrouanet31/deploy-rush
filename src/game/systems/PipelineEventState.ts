/**
 * PipelineEventState — pure sequence-progress model for a pipeline event.
 * No Phaser dependency: PipelineEvent owns rendering/movement and delegates
 * action resolution here so the sequence rules are unit-testable in
 * isolation (see PRODUCTION_READINESS.md, A1.1).
 */
import type { PlayerAction } from '../types';

export type SequenceOutcome = 'complete' | 'progress' | 'wrong';

export class PipelineEventState {
  progress = 0;

  constructor(
    readonly requiredSequence: PlayerAction[],
    private readonly altFirstActions?: PlayerAction[]
  ) {}

  /** The action expected next in the sequence. */
  get nextAction(): PlayerAction {
    return this.requiredSequence[this.progress];
  }

  get complete(): boolean {
    return this.progress >= this.requiredSequence.length;
  }

  /** Try to satisfy the sequence with the given action. */
  applyAction(action: PlayerAction): SequenceOutcome {
    const expected = this.nextAction;
    const firstStep = this.progress === 0;
    const altOk = firstStep && this.altFirstActions ? this.altFirstActions.includes(action) : false;

    if (action === expected || altOk) {
      this.progress += 1;
      return this.complete ? 'complete' : 'progress';
    }
    return 'wrong';
  }
}
