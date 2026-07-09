/**
 * HudSystem — draws and updates the top status bar: score, combo, timer,
 * and the three gauges (build stability, production health, tech debt).
 */
import Phaser from 'phaser';
import {
  Colors,
  CssColors,
  GAME_WIDTH,
  Gauges,
  Layout
} from '../constants';
import type { GameState } from '../types';

interface GaugeBar {
  label: Phaser.GameObjects.Text;
  bg: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
  value: Phaser.GameObjects.Text;
  width: number;
  x: number;
}

export class HudSystem {
  private readonly scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  private build!: GaugeBar;
  private prod!: GaugeBar;
  private debt!: GaugeBar;

  private lastScore = 0;

  constructor(scene: Phaser.Scene, difficultyLabel: string) {
    this.scene = scene;
    this.build = this.createLayout(difficultyLabel);
  }

  private createLayout(difficultyLabel: string): GaugeBar {
    const s = this.scene;

    // HUD background panel.
    s.add
      .rectangle(0, 0, GAME_WIDTH, Layout.hudHeight, Colors.panel)
      .setOrigin(0, 0)
      .setDepth(50);
    s.add
      .rectangle(0, Layout.hudHeight - 2, GAME_WIDTH, 2, Colors.cyan)
      .setOrigin(0, 0)
      .setDepth(50)
      .setAlpha(0.6);

    // Score (far left).
    s.add
      .text(24, 12, 'SCORE', labelStyle())
      .setDepth(51);
    this.scoreText = s.add
      .text(24, 32, '0', {
        fontFamily: 'Consolas, monospace',
        fontSize: '36px',
        color: CssColors.white,
        fontStyle: 'bold'
      })
      .setDepth(51);

    // Combo (below the score).
    this.comboText = s.add
      .text(24, 76, '', {
        fontFamily: 'Consolas, monospace',
        fontSize: '16px',
        color: CssColors.purple,
        fontStyle: 'bold'
      })
      .setDepth(51);

    // Timer (left-center, clear of the gauge cluster).
    const timerX = 360;
    s.add
      .text(timerX, 12, 'TIME', labelStyle())
      .setOrigin(0.5, 0)
      .setDepth(51);
    this.timerText = s.add
      .text(timerX, 30, '3:00', {
        fontFamily: 'Consolas, monospace',
        fontSize: '36px',
        color: CssColors.cyan,
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0)
      .setDepth(51);

    // Difficulty tag (top-right corner, above the gauges).
    s.add
      .text(GAME_WIDTH - 24, 10, difficultyLabel.toUpperCase(), {
        fontFamily: 'Consolas, monospace',
        fontSize: '15px',
        color: CssColors.textDim,
        fontStyle: 'bold'
      })
      .setOrigin(1, 0)
      .setDepth(51);

    // Gauges (right cluster, three across).
    const gaugeW = 150;
    const gap = 14;
    const gaugeY = 60;
    const buildX = GAME_WIDTH - gaugeW - 24;
    const prodX = buildX - gap - gaugeW;
    const debtX = prodX - gap - gaugeW;
    this.build = this.createGauge('BUILD', buildX, gaugeY, gaugeW, Colors.green);
    this.prod = this.createGauge('PROD', prodX, gaugeY, gaugeW, Colors.cyan);
    this.debt = this.createGauge('DEBT', debtX, gaugeY, gaugeW, Colors.orange);

    return this.build;
  }

  private createGauge(
    label: string,
    x: number,
    y: number,
    width: number,
    color: number
  ): GaugeBar {
    const s = this.scene;
    const height = 16;
    const labelText = s.add.text(x, y - 18, label, labelStyle()).setDepth(51);
    const bg = s.add
      .rectangle(x, y, width, height, Colors.panelLight)
      .setOrigin(0, 0)
      .setDepth(51);
    const fill = s.add
      .rectangle(x, y, width, height, color)
      .setOrigin(0, 0)
      .setDepth(52);
    const value = s.add
      .text(x + width, y - 18, '100', {
        fontFamily: 'Consolas, monospace',
        fontSize: '13px',
        color: CssColors.textDim
      })
      .setOrigin(1, 0)
      .setDepth(51);
    return { label: labelText, bg, fill, value, width, x };
  }

  update(state: GameState): void {
    // Score with a quick pop when it changes.
    if (state.score !== this.lastScore) {
      this.scoreText.setText(String(state.score));
      this.scene.tweens.add({
        targets: this.scoreText,
        scale: { from: 1.18, to: 1 },
        duration: 160,
        ease: 'Quad.easeOut'
      });
      this.lastScore = state.score;
    }

    // Combo.
    if (state.combo >= 2) {
      this.comboText.setText(`COMBO x${state.comboMultiplier}  (${state.combo})`);
    } else {
      this.comboText.setText('');
    }

    // Timer mm:ss with color warning under 30s.
    const t = Math.ceil(state.timeLeft);
    const mm = Math.floor(t / 60);
    const ss = t % 60;
    this.timerText.setText(`${mm}:${ss.toString().padStart(2, '0')}`);
    this.timerText.setColor(t <= 30 ? CssColors.orange : CssColors.cyan);

    this.updateGauge(this.build, state.buildStability, Gauges.buildMax, false);
    this.updateGauge(this.prod, state.productionHealth, Gauges.productionMax, false);
    this.updateGauge(this.debt, state.techDebt, Gauges.techDebtMax, true);
  }

  private updateGauge(
    gauge: GaugeBar,
    value: number,
    max: number,
    inverted: boolean
  ): void {
    const ratio = Phaser.Math.Clamp(value / max, 0, 1);
    gauge.fill.width = Math.max(0, gauge.width * ratio);
    gauge.value.setText(String(Math.round(value)));

    // Color: for normal gauges, low = danger. For debt (inverted), high = danger.
    const danger = inverted ? ratio > 0.7 : ratio < 0.3;
    const warn = inverted ? ratio > 0.5 : ratio < 0.5;
    let color: number = inverted ? Colors.orange : Colors.green;
    if (danger) color = Colors.red;
    else if (warn) color = Colors.yellow;
    gauge.fill.fillColor = color;
  }
}

function labelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Consolas, monospace',
    fontSize: '13px',
    color: CssColors.textDim,
    fontStyle: 'bold'
  };
}
