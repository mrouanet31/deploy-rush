/**
 * EventSpawner — decides when to spawn, which event type (weighted), in
 * which lane, and instantiates PipelineEvent objects. Timing/speed come
 * from the DifficultySystem.
 */
import Phaser from 'phaser';
import { LANES, Layout } from '../constants';
import { ALL_EVENT_TYPES, EVENT_DEFINITIONS } from '../data/eventDefinitions';
import { PipelineEvent } from '../entities/PipelineEvent';
import type { DifficultySystem } from './DifficultySystem';
import type { LaneId, PipelineEventDefinition, PipelineEventType, PlayerAction } from '../types';

export class EventSpawner {
  private timeToNext = 0.8;
  private readonly totalWeight: number;
  private readonly rng: Phaser.Math.RandomDataGenerator;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly difficulty: DifficultySystem,
    rng?: Phaser.Math.RandomDataGenerator,
    private readonly actionKeys?: Record<PlayerAction, string>
  ) {
    this.rng = rng ?? new Phaser.Math.RandomDataGenerator();
    this.totalWeight = ALL_EVENT_TYPES.reduce(
      (sum, t) => sum + EVENT_DEFINITIONS[t].weight,
      0
    );
  }

  /**
   * Advances the spawn timer. Returns a new PipelineEvent when it's time
   * to spawn, otherwise null.
   */
  update(deltaSeconds: number, techDebt: number): PipelineEvent | null {
    this.timeToNext -= deltaSeconds;
    if (this.timeToNext > 0) return null;

    this.timeToNext = this.difficulty.spawnInterval(techDebt);
    return this.createEvent();
  }

  private createEvent(): PipelineEvent {
    const type = this.pickType();
    const def = EVENT_DEFINITIONS[type];

    let laneIndex = LANES.indexOf(def.lane);
    // As difficulty rises, some events spawn off their natural lane.
    if (this.rng.frac() < this.difficulty.laneDriftChance() * 0.5) {
      laneIndex = Phaser.Math.Clamp(
        laneIndex + this.rng.between(-1, 1),
        0,
        LANES.length - 1
      );
    }

    const event = new PipelineEvent(
      this.scene,
      def,
      laneIndex,
      Layout.spawnX,
      this.sequenceFor(def),
      this.actionKeys,
      this.createEventRng(type, laneIndex)
    );

    // Chance to drift mid-flight at higher difficulty.
    if (this.rng.frac() < this.difficulty.laneDriftChance()) {
      this.scene.time.delayedCall(this.rng.between(400, 900), () => {
        if (!event.handled) event.startDrift();
      });
    }

    return event;
  }

  /**
   * Spawn a specific event type in a given lane (used by boss incident
   * waves). Bypasses the spawn timer and weighting.
   */
  spawnOfType(type: PipelineEventType, laneIndex: number, offsetX = 0): PipelineEvent {
    const def = EVENT_DEFINITIONS[type];
    const lane = Phaser.Math.Clamp(laneIndex, 0, LANES.length - 1);
    return new PipelineEvent(
      this.scene,
      def,
      lane,
      Layout.spawnX + offsetX,
      def.sequence,
      this.actionKeys,
      this.createEventRng(type, lane)
    );
  }

  private createEventRng(type: PipelineEventType, laneIndex: number): Phaser.Math.RandomDataGenerator {
    const seed = `${type}:${laneIndex}:${this.rng.between(1, 2147483646)}`;
    return new Phaser.Math.RandomDataGenerator([seed]);
  }

  private sequenceFor(def: PipelineEventDefinition): PlayerAction[] {
    if (def.sequence.length <= 1 || def.powerUp || def.mega) return def.sequence;
    return this.rng.frac() < this.difficulty.sequenceChance()
      ? def.sequence
      : [def.sequence[0]];
  }

  private pickType(): PipelineEventType {
    let roll = this.rng.frac() * this.totalWeight;
    for (const t of ALL_EVENT_TYPES) {
      roll -= EVENT_DEFINITIONS[t].weight;
      if (roll <= 0) return t;
    }
    return ALL_EVENT_TYPES[0];
  }

  /** Natural lane for a type (used by tests / debug). */
  static laneFor(type: PipelineEventType): LaneId {
    return EVENT_DEFINITIONS[type].lane;
  }
}
