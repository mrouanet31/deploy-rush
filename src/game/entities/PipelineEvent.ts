/**
 * PipelineEvent — a moving card representing a software event travelling
 * down the pipeline. Handles its own visuals, sequence progress and
 * lane drifting. Movement is driven by GameScene.
 */
import Phaser from 'phaser';
import {
  ActionKeys,
  Colors,
  CssColors,
  LANES,
  laneCenterY,
  laneHeight
} from '../constants';
import type { PipelineEventDefinition, PlayerAction } from '../types';

const CARD_WIDTH = 128;
const CARD_HEIGHT = 84;
const MEGA_WIDTH = 172;
const MEGA_HEIGHT = 104;

export interface PipelineTargetMarker {
  id: string;
  color: number;
}

export class PipelineEvent {
  readonly def: PipelineEventDefinition;
  readonly container: Phaser.GameObjects.Container;

  laneIndex: number;
  /** Ordered required actions for this instance (may be a sub-set). */
  readonly requiredSequence: PlayerAction[];
  /** How many steps of the sequence have been satisfied. */
  progress = 0;
  handled = false;

  private readonly scene: Phaser.Scene;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly hintText: Phaser.GameObjects.Text;
  private readonly targetFrame: Phaser.GameObjects.Rectangle;
  private readonly progressPips: Phaser.GameObjects.Rectangle[] = [];
  private readonly duelTargetMarkers: Phaser.GameObjects.GameObject[] = [];
  private readonly cardW: number;
  private readonly cardH: number;
  private driftTarget: number | null = null;
  private targeted = false;
  private duelTargetSignature = '';

  constructor(
    scene: Phaser.Scene,
    def: PipelineEventDefinition,
    laneIndex: number,
    startX: number,
    requiredSequence: PlayerAction[],
    private readonly actionKeys: Record<PlayerAction, string> = ActionKeys,
    private readonly rng: Phaser.Math.RandomDataGenerator = new Phaser.Math.RandomDataGenerator()
  ) {
    this.scene = scene;
    this.def = def;
    this.laneIndex = laneIndex;
    this.requiredSequence = requiredSequence;
    this.cardW = def.mega ? MEGA_WIDTH : CARD_WIDTH;
    this.cardH = def.mega ? MEGA_HEIGHT : CARD_HEIGHT;

    const w = this.cardW;
    const h = this.cardH;
    const y = laneCenterY(laneIndex);

    this.bg = scene.add
      .rectangle(0, 0, w, h, Colors.panel)
      .setStrokeStyle(def.mega ? 4 : 3, def.color);

    this.targetFrame = scene.add
      .rectangle(0, 0, w + 12, h + 12)
      .setStrokeStyle(3, Colors.white, 0.95)
      .setFillStyle(0, 0)
      .setVisible(false);

    const accent = scene.add
      .rectangle(-w / 2 + 3, 0, def.mega ? 8 : 6, h, def.color)
      .setOrigin(0, 0.5);

    const icon = scene.add
      .text(-w / 2 + 22, -h / 2 + 12, def.icon, {
        fontFamily: 'Consolas, monospace',
        fontSize: def.mega ? '30px' : '22px',
        color: colorToCss(def.color)
      })
      .setOrigin(0, 0);

    const title = scene.add
      .text(-w / 2 + 20, -8, def.label, {
        fontFamily: 'Consolas, monospace',
        fontSize: def.mega ? '15px' : '13px',
        color: CssColors.text,
        fontStyle: 'bold',
        wordWrap: { width: w - 26 }
      })
      .setOrigin(0, 0);

    this.hintText = scene.add
      .text(0, h / 2 - 18, this.buildHint(), {
        fontFamily: 'Consolas, monospace',
        fontSize: '14px',
        color: colorToCss(def.color),
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0);

    const children: Phaser.GameObjects.GameObject[] = [
      this.targetFrame,
      this.bg,
      accent,
      icon,
      title,
      this.hintText
    ];

    // Sequence progress pips (only when more than one step).
    if (requiredSequence.length > 1) {
      const totalW = requiredSequence.length * 12 - 4;
      for (let i = 0; i < requiredSequence.length; i++) {
        const pip = scene.add
          .rectangle(-totalW / 2 + i * 12, h / 2 - 30, 8, 4, Colors.panelLight)
          .setOrigin(0, 0.5);
        this.progressPips.push(pip);
        children.push(pip);
      }
    }

    this.container = scene.add.container(startX, y, children).setDepth(def.mega ? 45 : 40);

    if (def.critical) {
      // Pulsing border for critical events.
      scene.tweens.add({
        targets: this.bg,
        scaleX: { from: 1, to: 1.04 },
        scaleY: { from: 1, to: 1.06 },
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  get x(): number {
    return this.container.x;
  }

  get width(): number {
    return this.cardW;
  }

  /** The action expected next in the sequence. */
  get nextAction(): PlayerAction {
    return this.requiredSequence[this.progress];
  }

  private buildHint(): string {
    const remaining = this.requiredSequence.slice(this.progress);
    const keys = remaining.map((a) => `[${this.actionKeys[a]}]`);
    const alt =
      this.progress === 0 && this.def.altFirstActions
        ? '/' + this.def.altFirstActions.map((a) => this.actionKeys[a]).join('/')
        : '';
    return keys.join(' ') + (alt ? ` ${alt}` : '');
  }

  /**
   * Try to satisfy the sequence with the given action.
   * Returns 'complete' | 'progress' | 'wrong'.
   */
  applyAction(action: PlayerAction): 'complete' | 'progress' | 'wrong' {
    const expected = this.nextAction;
    const firstStep = this.progress === 0;
    const altOk =
      firstStep && this.def.altFirstActions ? this.def.altFirstActions.includes(action) : false;

    if (action === expected || altOk) {
      this.progress += 1;
      this.refreshHint();
      if (this.progress >= this.requiredSequence.length) {
        return 'complete';
      }
      // pip feedback
      const pip = this.progressPips[this.progress - 1];
      if (pip) pip.fillColor = this.def.color;
      return 'progress';
    }
    return 'wrong';
  }

  private refreshHint(): void {
    this.hintText.setText(this.buildHint());
  }

  setTargeted(value: boolean): void {
    if (this.targeted === value) return;
    this.targeted = value;
    this.targetFrame.setVisible(value);
    this.hintText.setColor(value ? CssColors.white : colorToCss(this.def.color));
    if (value) {
      this.scene.tweens.add({
        targets: this.targetFrame,
        alpha: { from: 0.35, to: 1 },
        duration: 140,
        ease: 'Quad.easeOut'
      });
    }
  }

  setDuelTargeters(markers: PipelineTargetMarker[]): void {
    const targeters = markers.slice(0, 2);
    const signature = targeters.map((marker) => `${marker.id}:${marker.color}`).join('|');
    if (signature === this.duelTargetSignature) return;
    this.duelTargetSignature = signature;
    this.clearDuelTargetMarkers();
    this.setTargeted(targeters.length > 0);

    if (targeters.length === 0) {
      this.targetFrame.setStrokeStyle(3, Colors.white, 0.95);
      return;
    }

    const contested = targeters.length > 1;
    this.targetFrame.setStrokeStyle(contested ? 4 : 3, contested ? Colors.white : targeters[0].color, 0.95);

    targeters.forEach((marker, i) => {
      const frame = this.scene.add
        .rectangle(0, 0, this.cardW + 18 + i * 10, this.cardH + 18 + i * 10)
        .setStrokeStyle(2, marker.color, contested ? 0.95 : 0.85)
        .setFillStyle(0, 0);
      const badgeX = targeters.length === 1 ? 0 : (i === 0 ? -28 : 28);
      const badgeY = -this.cardH / 2 - 20 - i * 2;
      const badgeBg = this.scene.add
        .rectangle(badgeX, badgeY, 42, 18, marker.color, 0.95)
        .setStrokeStyle(1, Colors.bg, 0.75);
      const badgeText = this.scene.add
        .text(badgeX, badgeY, marker.id, {
          fontFamily: 'Consolas, monospace',
          fontSize: '12px',
          color: CssColors.white,
          fontStyle: 'bold'
        })
        .setOrigin(0.5);
      this.duelTargetMarkers.push(frame, badgeBg, badgeText);
      this.container.add([frame, badgeBg, badgeText]);
    });

    if (contested) {
      const labelBg = this.scene.add
        .rectangle(0, this.cardH / 2 + 14, 86, 18, Colors.bg, 0.9)
        .setStrokeStyle(1, Colors.white, 0.45);
      const label = this.scene.add
        .text(0, this.cardH / 2 + 14, 'CONTESTED', {
          fontFamily: 'Consolas, monospace',
          fontSize: '10px',
          color: CssColors.white,
          fontStyle: 'bold'
        })
        .setOrigin(0.5);
      this.duelTargetMarkers.push(labelBg, label);
      this.container.add([labelBg, label]);
    }
  }

  private clearDuelTargetMarkers(): void {
    for (const marker of this.duelTargetMarkers) marker.destroy();
    this.duelTargetMarkers.length = 0;
  }

  /** Whether the event is currently within the interception zone. */
  isInZone(playerX: number, halfWidth: number): boolean {
    return Math.abs(this.container.x - playerX) <= halfWidth + this.cardW / 2;
  }

  /** Whether the event shares the player's lane. */
  isAligned(playerLane: number): boolean {
    return this.laneIndex === playerLane;
  }

  /**
   * Jump to a nearby different lane (used by chained "mega" events after
   * each completed step, forcing the player to reposition).
   */
  jumpToRandomLane(): void {
    this.driftTarget = null;
    const options: number[] = [];
    for (let i = 0; i < LANES.length; i++) {
      const dist = Math.abs(i - this.laneIndex);
      if (dist >= 1 && dist <= 2) options.push(i);
    }
    if (options.length === 0) return;
    const next = options[this.rng.between(0, options.length - 1)];
    this.laneIndex = next;
    this.scene.tweens.add({
      targets: this.container,
      y: laneCenterY(next),
      duration: 240,
      ease: 'Back.easeOut'
    });
    // Quick flash to signal the jump.
    this.bg.setStrokeStyle(4, Colors.white);
    this.scene.time.delayedCall(160, () => {
      if (this.bg.active) this.bg.setStrokeStyle(this.def.mega ? 4 : 3, this.def.color);
    });
  }

  /** Begin drifting toward a neighbouring lane. */
  startDrift(): void {
    if (this.driftTarget !== null) return;
    const options: number[] = [];
    if (this.laneIndex > 0) options.push(this.laneIndex - 1);
    if (this.laneIndex < LANES.length - 1) options.push(this.laneIndex + 1);
    if (options.length === 0) return;
    this.driftTarget = options[this.rng.between(0, options.length - 1)];
  }

  /** Advance movement; returns nothing. Called each frame by GameScene. */
  move(dx: number): void {
    this.container.x -= dx;
    if (this.driftTarget !== null) {
      const targetY = laneCenterY(this.driftTarget);
      const step = (laneHeight() / 40);
      if (Math.abs(this.container.y - targetY) <= step) {
        this.container.y = targetY;
        this.laneIndex = this.driftTarget;
        this.driftTarget = null;
      } else {
        this.container.y += Math.sign(targetY - this.container.y) * step;
      }
    }
  }

  flashSuccess(): void {
    this.bg.fillColor = this.def.color;
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1.12, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 220,
      ease: 'Quad.easeOut'
    });
  }

  flashWrong(): void {
    const original = this.bg.fillColor;
    this.bg.fillColor = Colors.red;
    this.scene.time.delayedCall(120, () => {
      if (this.bg.active) this.bg.fillColor = original;
    });
    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x + 6,
      duration: 40,
      yoyo: true,
      repeat: 2
    });
  }

  destroy(): void {
    this.clearDuelTargetMarkers();
    this.container.destroy();
  }
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
