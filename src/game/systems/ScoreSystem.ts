/**
 * ScoreSystem — owns the mutable GameState, applies event effects and
 * combo logic, and computes the end-of-game ScoreBreakdown + title.
 */
import {
  COMBO_MAX_MULTIPLIER,
  COMBO_STEP,
  Gauges
} from '../constants';
import type {
  EventEffect,
  GameState,
  RunBadge,
  ScoreBreakdown
} from '../types';

export class ScoreSystem {
  readonly state: GameState;

  constructor(matchDuration: number) {
    this.state = {
      score: 0,
      combo: 0,
      comboMultiplier: 1,
      timeLeft: matchDuration,
      buildStability: Gauges.buildMax,
      productionHealth: Gauges.productionMax,
      techDebt: 0,
      featuresShipped: 0,
      majorIncidents: 0,
      eventsHandled: 0,
      eventsMissed: 0,
      criticalMisses: 0,
      wrongActions: 0,
      dangerousActions: 0,
      powerUpsUsed: 0,
      wavesStarted: 0,
      wavesCleared: 0,
      bestCombo: 0
    };
  }

  /**
   * Applies an effect. `outcome` controls combo behaviour:
   *   - 'success' increments the combo and scales positive points.
   *   - 'wrong' always breaks the combo (player error).
   *   - 'ignore' breaks the combo only if the effect requests it.
   * Returns the delta points actually awarded (after multiplier).
   */
  apply(effect: EventEffect, outcome: 'success' | 'wrong' | 'ignore'): number {
    const s = this.state;
    let points = effect.score ?? 0;

    if (outcome === 'success' && points > 0) {
      // Combo raises the multiplier and scales positive points.
      s.combo += 1;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
      s.comboMultiplier = Math.min(
        COMBO_MAX_MULTIPLIER,
        1 + Math.floor(s.combo / COMBO_STEP)
      );
      points = Math.round(points * s.comboMultiplier);
      s.eventsHandled += 1;
    } else if (outcome === 'wrong') {
      // Player mistakes always break the combo.
      s.combo = 0;
      s.comboMultiplier = 1;
    }

    if (effect.resetCombo) {
      s.combo = 0;
      s.comboMultiplier = 1;
    }

    s.score = Math.max(0, s.score + points);
    s.buildStability = clamp(s.buildStability + (effect.buildStability ?? 0), 0, Gauges.buildMax);
    s.productionHealth = clamp(
      s.productionHealth + (effect.productionHealth ?? 0),
      0,
      Gauges.productionMax
    );
    s.techDebt = clamp(s.techDebt + (effect.techDebt ?? 0), 0, Gauges.techDebtMax);

    if (effect.featureShipped) s.featuresShipped += 1;
    if (effect.majorIncident) s.majorIncidents += 1;

    return points;
  }

  recordWrongAction(dangerous: boolean): void {
    this.state.wrongActions += 1;
    if (dangerous) this.state.dangerousActions += 1;
  }

  recordMissedEvent(critical: boolean): void {
    this.state.eventsMissed += 1;
    if (critical) this.state.criticalMisses += 1;
  }

  recordPowerUpUsed(): void {
    this.state.powerUpsUsed += 1;
  }

  recordWaveStarted(): void {
    this.state.wavesStarted += 1;
  }

  recordWaveCleared(): void {
    this.state.wavesCleared += 1;
  }

  tickTimer(deltaSeconds: number): void {
    this.state.timeLeft = Math.max(0, this.state.timeLeft - deltaSeconds);
  }

  isGameOver(): boolean {
    const s = this.state;
    return s.timeLeft <= 0 || s.buildStability <= 0 || s.productionHealth <= 0;
  }

  gameOverReason(): string {
    const s = this.state;
    if (s.buildStability <= 0) return 'Build collapsed — pipeline is red.';
    if (s.productionHealth <= 0) return 'Production went down — incident!';
    return "Time's up — shift over.";
  }

  /** Compute the final breakdown with end-of-game bonuses + title. */
  computeBreakdown(): ScoreBreakdown {
    const s = this.state;
    const baseScore = s.score;

    const buildBonus = Math.round(s.buildStability * 4);
    const productionBonus = Math.round(s.productionHealth * 4);
    const techDebtBonus = Math.round((Gauges.techDebtMax - s.techDebt) * 2);
    const featureBonus = s.featuresShipped * 40;
    const comboBonus = s.bestCombo * 10;
    const cleanRunBonus =
      s.majorIncidents === 0 && s.buildStability > 0 && s.productionHealth > 0 ? 500 : 0;

    const total =
      baseScore +
      buildBonus +
      productionBonus +
      techDebtBonus +
      featureBonus +
      comboBonus +
      cleanRunBonus;

    return {
      baseScore,
      buildBonus,
      productionBonus,
      techDebtBonus,
      featureBonus,
      cleanRunBonus,
      comboBonus,
      total,
      title: this.computeTitle(cleanRunBonus > 0),
      badges: this.computeBadges(cleanRunBonus > 0)
    };
  }

  private computeBadges(cleanRun: boolean): RunBadge[] {
    const s = this.state;
    const earned: RunBadge[] = [];

    if (cleanRun) {
      earned.push({
        id: 'clean-deploy',
        label: 'Clean Deploy',
        description: 'No major incidents and both gauges survived.'
      });
    }

    if (s.bestCombo >= 12) {
      earned.push({
        id: 'combo-engine',
        label: 'Combo Engine',
        description: 'Reached a best combo of 12 or more.'
      });
    }

    if (s.wavesStarted > 0 && s.wavesCleared === s.wavesStarted) {
      earned.push({
        id: 'wave-rider',
        label: 'Wave Rider',
        description: 'Cleared every incident wave.'
      });
    }

    if (s.techDebt <= 10) {
      earned.push({
        id: 'debt-slayer',
        label: 'Debt Slayer',
        description: 'Finished with tech debt at 10 or below.'
      });
    }

    if (s.wrongActions === 0) {
      earned.push({
        id: 'steady-hands',
        label: 'Steady Hands',
        description: 'Completed the run without wrong keys.'
      });
    }

    if (s.productionHealth >= 85) {
      earned.push({
        id: 'prod-saver',
        label: 'Prod Saver',
        description: 'Kept production health at 85 or above.'
      });
    }

    if (s.powerUpsUsed >= 2) {
      earned.push({
        id: 'hotfix-hunter',
        label: 'Hotfix Hunter',
        description: 'Used two or more power-ups.'
      });
    }

    if (earned.length === 0) {
      earned.push({
        id: 'ship-it',
        label: 'Ship It',
        description: 'Completed the shift and logged a score.'
      });
    }

    return earned.slice(0, 5);
  }

  private computeTitle(cleanRun: boolean): string {
    const s = this.state;
    if (cleanRun && s.featuresShipped >= 12) return 'Software Craftsman';
    if (s.buildStability >= 80 && s.majorIncidents === 0) return 'Build Guardian';
    if (s.featuresShipped >= 15) return 'Deploy Master';
    if (s.productionHealth >= 80) return 'Prod Savior';
    if (s.techDebt <= 15) return 'Refactor Hero';
    if (s.majorIncidents >= 1 && s.buildStability > 0 && s.productionHealth > 0) {
      return 'Incident Survivor';
    }
    return 'Chaos Engineer';
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
