/**
 * Core type definitions for Deploy Rush.
 *
 * All gameplay data flows through these types so that adding new event
 * kinds, difficulty tiers or scoring rules stays type-safe.
 */

/** Pipeline lanes, top to bottom. Order matters (index === lane row). */
export type LaneId = 'PLAN' | 'CODE' | 'TEST' | 'SECURITY' | 'DEPLOY';

/** Keyboard actions the player can trigger against an event. */
export type PlayerAction =
  | 'ANALYZE'
  | 'FIX'
  | 'TEST'
  | 'ROLLBACK'
  | 'DEPLOY'
  | 'BLOCK'
  | 'CONTEXT';

/** Every kind of software event that can travel down the pipeline. */
export type PipelineEventType =
  | 'FEATURE'
  | 'BUG'
  | 'BROKEN_TEST'
  | 'SECURITY_FINDING'
  | 'MERGE_CONFLICT'
  | 'PROD_ALERT'
  | 'TECH_DEBT'
  | 'APPROVAL_REQUIRED'
  | 'FLAKY_TEST'
  | 'DEPENDENCY_BUMP'
  | 'DODGY_PR'
  | 'ONCALL_PAGE'
  | 'MEGA_RELEASE'
  | 'COFFEE_BREAK'
  | 'HOTFIX';

/** Power-up effects triggered when a special pickup is intercepted. */
export type PowerUpKind = 'SLOW' | 'CLEAR';

/** Difficulty tiers available in the code. */
export type DifficultyId = 'training' | 'normal' | 'hard' | 'conference';

/** Optional solo-run modifiers selected from the mode screen. */
export type RunModifierId =
  | 'classic'
  | 'fastPipeline'
  | 'fragileProd'
  | 'techDebtSurge'
  | 'precisionRun';

/** Keyboard layouts supported by the action-key mapping. */
export type KeyboardLayout = 'qwerty' | 'azerty';

/** Solo player input preference. Local Duel always uses two gamepads. */
export type PlayerInputDevice = 'keyboard' | 'gamepad';

/** Numeric effects applied to gauges / score when an outcome happens. */
export interface EventEffect {
  score?: number;
  buildStability?: number;
  productionHealth?: number;
  techDebt?: number;
  /** If true, resets the combo multiplier. */
  resetCombo?: boolean;
  /** If true, counts as a delivered feature (end-of-game bonus). */
  featureShipped?: boolean;
  /** If true, counts as a major incident (end-of-game malus). */
  majorIncident?: boolean;
}

/**
 * Static definition of an event type. Everything designers may want to
 * tune lives here (see src/game/data/eventDefinitions.ts).
 */
export interface PipelineEventDefinition {
  type: PipelineEventType;
  /** Human label shown on the card. */
  label: string;
  /** Short glyph / icon rendered on the card. */
  icon: string;
  /** Accent color for the card (hex number). */
  color: number;
  /** Lane the event naturally spawns in. */
  lane: LaneId;
  /**
   * Ordered list of required actions. A single-element array means a
   * one-shot action; multiple elements require a sequence.
   */
  sequence: PlayerAction[];
  /**
   * Alternative single actions accepted for the FIRST step only.
   * Used for events like "B or F". Ignored for multi-step sequences
   * beyond the first step.
   */
  altFirstActions?: PlayerAction[];
  /** Applied when the player completes the required sequence. */
  onSuccess: EventEffect;
  /** Applied when the event leaves the screen unhandled. */
  onIgnore: EventEffect;
  /** Applied when the player presses a clearly wrong / dangerous action. */
  onWrong: EventEffect;
  /**
   * Actions that are catastrophic for this event (e.g. pressing DEPLOY
   * on an Approval Required). Overrides onWrong when matched.
   */
  dangerousActions?: PlayerAction[];
  dangerousEffect?: EventEffect;
  /** Base points before combo multiplier (used for floating text). */
  basePoints: number;
  /** Relative spawn weight; higher = more frequent. */
  weight: number;
  /** If true, treated as a critical event (visual emphasis + reset combo on ignore). */
  critical?: boolean;
  /** If set, this is a power-up pickup that triggers a scene-level effect. */
  powerUp?: PowerUpKind;
  /** If true, the card is oversized (mega event). */
  mega?: boolean;
  /** If true, the event jumps to a new lane after each completed sequence step. */
  chain?: boolean;
}

/** A difficulty profile controls pacing and escalation. */
export interface DifficultyProfile {
  id: DifficultyId;
  label: string;
  /** Base seconds between spawns at t=0. */
  baseSpawnInterval: number;
  /** Minimum seconds between spawns at max difficulty. */
  minSpawnInterval: number;
  /** Base horizontal speed of events in px/s. */
  baseSpeed: number;
  /** Max horizontal speed at full difficulty. */
  maxSpeed: number;
  /** Seconds to ramp from base to max difficulty. */
  rampSeconds: number;
  /** Chance [0..1] an event requires a multi-step sequence at max difficulty. */
  sequenceChanceAtMax: number;
  /** Default match duration in seconds. */
  matchDuration: number;
}

/** Snapshot of the live game state (used by HUD + scoring). */
export interface GameState {
  score: number;
  combo: number;
  comboMultiplier: number;
  timeLeft: number;
  buildStability: number;
  productionHealth: number;
  techDebt: number;
  featuresShipped: number;
  majorIncidents: number;
  eventsHandled: number;
  eventsMissed: number;
  criticalMisses: number;
  wrongActions: number;
  dangerousActions: number;
  powerUpsUsed: number;
  wavesStarted: number;
  wavesCleared: number;
  bestCombo: number;
}

/** Small achievements awarded from the final run state. */
export interface RunBadge {
  id: string;
  label: string;
  description: string;
}

/** Detailed breakdown produced at the end of a match. */
export interface ScoreBreakdown {
  baseScore: number;
  buildBonus: number;
  productionBonus: number;
  techDebtBonus: number;
  featureBonus: number;
  cleanRunBonus: number;
  comboBonus: number;
  total: number;
  title: string;
  badges: RunBadge[];
}

/** One persisted leaderboard row. */
export interface LeaderboardEntry {
  name: string;
  score: number;
  /** ISO date string. */
  date: string;
  /** Match duration in seconds. */
  duration: number;
  title: string;
  /** Backwards-compatible optional metadata for scoped local boards. */
  difficulty?: DifficultyId;
  daily?: boolean;
  seed?: number;
  modifier?: RunModifierId;
  /** Optional because historical local/online entries predate run badges. */
  badges?: RunBadge[];
}

/** Board scope used by local leaderboard filtering/ranking. */
export interface LeaderboardScope {
  difficulty: DifficultyId;
  daily: boolean;
  seed: number;
  modifier?: RunModifierId;
}

/** Payload handed from GameScene to GameOverScene. */
export interface GameResult {
  state: GameState;
  breakdown: ScoreBreakdown;
  difficulty: DifficultyId;
  seed: number;
  modifier?: RunModifierId;
}
