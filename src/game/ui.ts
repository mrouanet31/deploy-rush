/**
 * Shared UI helpers used across menu-like scenes: animated backdrop,
 * panels and consistent text styles. Keeps scenes lean and consistent.
 */
import Phaser from 'phaser';
import { Colors, CssColors, GAME_HEIGHT, GAME_WIDTH } from './constants';

/** Draws a dark backdrop with a subtle animated pipeline grid. */
export function createBackdrop(scene: Phaser.Scene): void {
  scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Colors.bg).setOrigin(0, 0);

  const g = scene.add.graphics();
  g.lineStyle(1, Colors.grid, 0.6);
  const step = 48;
  for (let x = 0; x <= GAME_WIDTH; x += step) {
    g.lineBetween(x, 0, x, GAME_HEIGHT);
  }
  for (let y = 0; y <= GAME_HEIGHT; y += step) {
    g.lineBetween(0, y, GAME_WIDTH, y);
  }
  g.setAlpha(0.5);

  // Drifting accent line to feel alive.
  const beam = scene.add
    .rectangle(0, 0, 3, GAME_HEIGHT, Colors.cyan, 0.12)
    .setOrigin(0, 0);
  scene.tweens.add({
    targets: beam,
    x: GAME_WIDTH,
    duration: 4200,
    repeat: -1,
    ease: 'Sine.easeInOut',
    yoyo: true
  });
}

export function titleStyle(size = 72): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: `${size}px`,
    color: CssColors.white,
    fontStyle: 'bold'
  };
}

export function bodyStyle(size = 20, color: string = CssColors.text): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Consolas, monospace',
    fontSize: `${size}px`,
    color
  };
}

/** A pulsing "press key" call-to-action label. */
export function pulseHint(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: string = CssColors.cyan
): Phaser.GameObjects.Text {
  const label = scene.add
    .text(x, y, text, {
      fontFamily: 'Consolas, monospace',
      fontSize: '22px',
      color,
      fontStyle: 'bold'
    })
    .setOrigin(0.5);
  scene.tweens.add({
    targets: label,
    alpha: { from: 1, to: 0.35 },
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  return label;
}

/** A framed panel rectangle. */
export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  stroke: number = Colors.panelLight
): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(x, y, w, h, Colors.panel, 0.92)
    .setStrokeStyle(2, stroke, 0.8)
    .setOrigin(0.5);
}
