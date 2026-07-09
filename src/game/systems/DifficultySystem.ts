/**
 * DifficultySystem — turns elapsed time (and tech debt) into live pacing
 * values: spawn interval, event speed, sequence probability.
 */
import type { DifficultyProfile } from '../types';
import { Gauges } from '../constants';

export class DifficultySystem {
  private elapsed = 0;

  constructor(private readonly profile: DifficultyProfile) {}

  update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
  }

  /** 0..1 ramp progress. */
  get progress(): number {
    return Math.min(1, this.elapsed / this.profile.rampSeconds);
  }

  /** Seconds between spawns, factoring tech-debt acceleration. */
  spawnInterval(techDebt: number): number {
    const p = this.progress;
    let interval =
      this.profile.baseSpawnInterval +
      (this.profile.minSpawnInterval - this.profile.baseSpawnInterval) * p;
    if (techDebt > Gauges.techDebtDanger) {
      const over = (techDebt - Gauges.techDebtDanger) / (Gauges.techDebtMax - Gauges.techDebtDanger);
      interval *= 1 - 0.25 * over; // up to 25% faster spawns
    }
    return Math.max(this.profile.minSpawnInterval * 0.75, interval);
  }

  /** Current horizontal event speed in px/s. */
  eventSpeed(): number {
    const p = this.progress;
    return this.profile.baseSpeed + (this.profile.maxSpeed - this.profile.baseSpeed) * p;
  }

  /** Probability the next multi-capable event uses its full sequence. */
  sequenceChance(): number {
    return this.profile.sequenceChanceAtMax * this.progress;
  }

  /** Chance an event drifts to a neighbouring lane (rises with difficulty). */
  laneDriftChance(): number {
    return 0.35 * this.progress;
  }

  get difficultyLabel(): string {
    return this.profile.label;
  }
}
