/**
 * EffectsSystem — visual (and optional synthetic sound) feedback:
 * screen flashes, camera shake, particle bursts and combo pops.
 * All effects are cheap and asset-free.
 */
import Phaser from 'phaser';
import { Colors } from '../constants';
import { SoundManager } from './SoundManager';

export class EffectsSystem {
  private readonly sound: SoundManager;
  private readonly reducedMotion: boolean;

  constructor(
    private readonly scene: Phaser.Scene,
    sound: SoundManager,
    reducedMotion = false
  ) {
    this.sound = sound;
    this.reducedMotion = reducedMotion;
  }

  /** Green-ish pulse for a good action. */
  positiveFlash(x: number, y: number, color: number = Colors.green): void {
    this.burst(x, y, color, 10);
    this.sound.success();
  }

  /** Red flash + shake for a mistake. */
  errorFeedback(): void {
    if (!this.reducedMotion) {
      this.scene.cameras.main.shake(160, 0.008);
      this.flashOverlay(Colors.red, 0.22);
    }
    this.sound.error();
  }

  /** Bright celebratory burst when a feature ships. */
  shipFeature(x: number, y: number): void {
    this.burst(x, y, Colors.green, 22);
    this.ring(x, y, Colors.green, 84);
    if (!this.reducedMotion) this.flashOverlay(Colors.green, 0.12);
    this.sound.ship();
  }

  /** Heavy red incident feedback for production hits. */
  incident(): void {
    if (!this.reducedMotion) {
      this.scene.cameras.main.shake(260, 0.012);
      this.flashOverlay(Colors.red, 0.32);
    }
    this.sound.incident();
  }

  comboPop(x: number, y: number): void {
    this.burst(x, y, Colors.purple, 12);
    this.sound.combo();
  }

  private flashOverlay(color: number, alpha: number): void {
    const cam = this.scene.cameras.main;
    const r = ((color >> 16) & 0xff);
    const g = ((color >> 8) & 0xff);
    const b = color & 0xff;
    cam.flash(180, r, g, b, false, undefined, undefined);
    void alpha; // camera.flash controls its own alpha ramp
  }

  private burst(x: number, y: number, color: number, count: number): void {
    // Juicy particle burst: rectangles fired outward with gravity, spin and fade.
    for (let i = 0; i < count; i++) {
      const size = Phaser.Math.Between(3, 8);
      const p = this.scene.add.rectangle(x, y, size, size, color).setDepth(90);
      p.setBlendMode(Phaser.BlendModes.ADD); // additive glow (bloom-like)
      p.setAngle(Phaser.Math.Between(0, 360));
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(28, 88);
      const gravity = Phaser.Math.Between(18, 46);
      const dur = Phaser.Math.Between(360, 640);
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist + gravity,
        angle: p.angle + Phaser.Math.Between(-180, 180),
        alpha: 0,
        scale: 0,
        duration: dur,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  /** Expanding ring shockwave (used for big moments). */
  private ring(x: number, y: number, color: number, maxRadius = 90): void {
    const ring = this.scene.add
      .circle(x, y, 6)
      .setStrokeStyle(3, color, 0.9)
      .setFillStyle(0, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(89);
    this.scene.tweens.add({
      targets: ring,
      radius: maxRadius,
      alpha: 0,
      duration: 480,
      ease: 'Cubic.easeOut',
      onUpdate: () => ring.setStrokeStyle(3, color, ring.alpha),
      onComplete: () => ring.destroy()
    });
  }

  /** Big celebration for mega releases / milestones. */
  megaCelebrate(x: number, y: number): void {
    this.burst(x, y, Colors.purple, 26);
    this.burst(x, y, Colors.cyan, 16);
    this.ring(x, y, Colors.purple, 120);
    if (!this.reducedMotion) this.flashOverlay(Colors.purple, 0.14);
    this.sound.ship();
    this.scene.time.delayedCall(90, () => this.sound.combo());
  }
}
