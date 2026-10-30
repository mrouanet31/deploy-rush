/**
 * RunRules — pure resolution of a player action against a pipeline event
 * definition: which EventEffect applies, under which ScoreSystem outcome,
 * and whether the action was "dangerous" for that event. No Phaser
 * dependency, no scene state — shared by GameScene (solo) and VersusScene
 * (duel) so the two modes can't silently diverge (see
 * PRODUCTION_READINESS.md, A1.2 / A1.4).
 */
import { DEFAULT_RUN_MODIFIER, RUN_MODIFIERS, applyRunModifierToEffect, type RunModifierProfile } from '../data/runModifiers';
import type { EventEffect, PipelineEventDefinition, PlayerAction } from '../types';

const CLASSIC_MODIFIER = RUN_MODIFIERS[DEFAULT_RUN_MODIFIER];

export interface ResolvedOutcome {
  /** The event effect to apply via ScoreSystem.apply(), already modifier-adjusted. */
  effect: EventEffect;
  /** Outcome category as understood by ScoreSystem.apply(). */
  scoreOutcome: 'success' | 'wrong' | 'ignore';
  /** Whether the triggering action was flagged dangerous for this event. */
  dangerous: boolean;
}

export class RunRules {
  /** A completed action sequence. */
  static resolveSuccess(
    def: PipelineEventDefinition,
    modifier: RunModifierProfile = CLASSIC_MODIFIER
  ): ResolvedOutcome {
    return {
      effect: applyRunModifierToEffect(def.onSuccess, 'success', modifier),
      scoreOutcome: 'success',
      dangerous: false
    };
  }

  /** A wrong action against an event, honoring the dangerous-action override. */
  static resolveWrong(
    def: PipelineEventDefinition,
    action: PlayerAction,
    modifier: RunModifierProfile = CLASSIC_MODIFIER
  ): ResolvedOutcome {
    const dangerous = def.dangerousActions?.includes(action) ?? false;
    const rawEffect = dangerous && def.dangerousEffect ? def.dangerousEffect : def.onWrong;
    return {
      effect: applyRunModifierToEffect(rawEffect, 'wrong', modifier),
      scoreOutcome: 'wrong',
      dangerous
    };
  }

  /** An event that left the screen unhandled. */
  static resolveIgnore(
    def: PipelineEventDefinition,
    modifier: RunModifierProfile = CLASSIC_MODIFIER
  ): ResolvedOutcome {
    return {
      effect: applyRunModifierToEffect(def.onIgnore, 'ignore', modifier),
      scoreOutcome: 'ignore',
      dangerous: false
    };
  }
}
