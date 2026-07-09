/**
 * FloatingText — a short-lived score/feedback label that rises and fades.
 */
import Phaser from 'phaser';
import { CssColors } from '../constants';

export class FloatingText {
  static spawn(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string = CssColors.white,
    fontSize = 24
  ): void {
    const label = scene.add
      .text(x, y, text, {
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: `${fontSize}px`,
        color,
        fontStyle: 'bold',
        stroke: '#05070f',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(100);

    scene.tweens.add({
      targets: label,
      y: y - 46,
      alpha: 0,
      scale: { from: 1.15, to: 0.85 },
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy()
    });
  }
}
