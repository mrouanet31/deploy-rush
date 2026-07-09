/**
 * Player — the Release Engineer avatar. Moves between lanes vertically and
 * can dodge slightly horizontally. Rendered as a glowing rounded token.
 */
import Phaser from 'phaser';
import {
  Colors,
  LANES,
  Layout,
  laneCenterY
} from '../constants';

interface PlayerOptions {
  x?: number;
  color?: number;
  label?: string;
  startLane?: number;
  depth?: number;
}

export class Player {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly baseX: number;

  laneIndex = 2; // start on TEST lane
  private dodgeOffset = 0;

  constructor(scene: Phaser.Scene, options: PlayerOptions = {}) {
    this.scene = scene;
    this.baseX = options.x ?? Layout.playerX;
    this.laneIndex = Phaser.Math.Clamp(options.startLane ?? 2, 0, LANES.length - 1);
    const color = options.color ?? Colors.cyan;
    const label = options.label ?? 'YOU';

    this.glow = scene.add
      .circle(0, 0, 34, color, 0.18)
      .setStrokeStyle(2, color, 0.5)
      .setBlendMode(Phaser.BlendModes.ADD);

    const body = scene.add
      .rectangle(0, 0, 44, 44, Colors.panelLight)
      .setStrokeStyle(3, color);

    const face = scene.add
      .text(0, 0, '\u2B22', {
        fontFamily: 'Consolas, monospace',
        fontSize: '30px',
        color: colorToCss(color),
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const tag = scene.add
      .text(0, 34, 'YOU', {
        fontFamily: 'Consolas, monospace',
        fontSize: '12px',
        color: '#8a97c2',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    tag.setText(label);

    this.container = scene.add
      .container(this.baseX, laneCenterY(this.laneIndex), [this.glow, body, face, tag])
      .setDepth(options.depth ?? 60);

    // Gentle idle pulse on the glow.
    scene.tweens.add({
      targets: this.glow,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.18, to: 0.3 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }

  moveLane(delta: number): boolean {
    const next = Phaser.Math.Clamp(this.laneIndex + delta, 0, LANES.length - 1);
    if (next === this.laneIndex) return false;
    this.laneIndex = next;
    this.scene.tweens.add({
      targets: this.container,
      y: laneCenterY(this.laneIndex) + 0,
      duration: 120,
      ease: 'Quad.easeOut'
    });
    return true;
  }

  dodge(direction: -1 | 1): void {
    this.dodgeOffset = Phaser.Math.Clamp(this.dodgeOffset + direction * 26, -40, 60);
    this.scene.tweens.add({
      targets: this.container,
      x: this.baseX + this.dodgeOffset,
      duration: 110,
      ease: 'Quad.easeOut'
    });
    // Drift back to base X shortly after.
    this.scene.time.delayedCall(260, () => {
      this.dodgeOffset = 0;
      this.scene.tweens.add({
        targets: this.container,
        x: this.baseX,
        duration: 200,
        ease: 'Quad.easeOut'
      });
    });
  }

  /** Quick reaction squash when performing an action. */
  react(color: number): void {
    this.glow.fillColor = color;
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1.15, to: 1 },
      duration: 140,
      ease: 'Quad.easeOut'
    });
  }
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
