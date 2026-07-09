import { describe, expect, it } from 'vitest';
import { ScoreSystem } from './ScoreSystem';

describe('ScoreSystem', () => {
  it('scales success points as combo tiers rise', () => {
    const score = new ScoreSystem(120);

    expect(score.apply({ score: 10 }, 'success')).toBe(10);
    expect(score.apply({ score: 10 }, 'success')).toBe(10);
    expect(score.apply({ score: 10 }, 'success')).toBe(10);
    expect(score.apply({ score: 10 }, 'success')).toBe(20);

    expect(score.state.score).toBe(50);
    expect(score.state.combo).toBe(4);
    expect(score.state.comboMultiplier).toBe(2);
    expect(score.state.bestCombo).toBe(4);
    expect(score.state.eventsHandled).toBe(4);
  });

  it('resets combo on wrong actions and tracks fine-grained stats', () => {
    const score = new ScoreSystem(120);

    score.apply({ score: 100 }, 'success');
    score.apply({ score: -20 }, 'wrong');
    score.recordWrongAction(true);
    score.recordMissedEvent(true);
    score.recordPowerUpUsed();
    score.recordWaveStarted();
    score.recordWaveCleared();

    expect(score.state.score).toBe(80);
    expect(score.state.combo).toBe(0);
    expect(score.state.comboMultiplier).toBe(1);
    expect(score.state.wrongActions).toBe(1);
    expect(score.state.dangerousActions).toBe(1);
    expect(score.state.eventsMissed).toBe(1);
    expect(score.state.criticalMisses).toBe(1);
    expect(score.state.powerUpsUsed).toBe(1);
    expect(score.state.wavesStarted).toBe(1);
    expect(score.state.wavesCleared).toBe(1);
  });

  it('computes end-of-run bonuses and title from final state', () => {
    const score = new ScoreSystem(120);

    score.apply({ score: 100, featureShipped: true }, 'success');
    score.apply({ score: 100, featureShipped: true }, 'success');
    const breakdown = score.computeBreakdown();

    expect(breakdown.baseScore).toBe(200);
    expect(breakdown.buildBonus).toBe(400);
    expect(breakdown.productionBonus).toBe(400);
    expect(breakdown.techDebtBonus).toBe(200);
    expect(breakdown.featureBonus).toBe(80);
    expect(breakdown.comboBonus).toBe(20);
    expect(breakdown.cleanRunBonus).toBe(500);
    expect(breakdown.total).toBe(1800);
    expect(breakdown.title).toBe('Build Guardian');
  });

  it('awards compact run badges from the final state', () => {
    const score = new ScoreSystem(120);

    for (let i = 0; i < 12; i += 1) {
      score.apply({ score: 10 }, 'success');
    }
    score.recordWaveStarted();
    score.recordWaveCleared();

    const breakdown = score.computeBreakdown();
    const labels = breakdown.badges.map((badge) => badge.label);

    expect(breakdown.badges[0].id).toBe('clean-deploy');
    expect(labels).toEqual(expect.arrayContaining([
      'Clean Deploy',
      'Combo Engine',
      'Wave Rider',
      'Debt Slayer',
      'Steady Hands'
    ]));
    expect(breakdown.badges).toHaveLength(5);
  });
});
