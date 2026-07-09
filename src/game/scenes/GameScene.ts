/**
 * GameScene — the playable core. Owns the run loop, wires all systems and
 * entities together, resolves player actions against events, tracks the
 * pause overlay and triggers game over.
 */
import Phaser from 'phaser';
import {
  Colors,
  CssColors,
  dailySeed,
  GAME_HEIGHT,
  GAME_WIDTH,
  Gauges,
  LANES,
  LaneColors,
  Layout,
  laneCenterY,
  laneHeight,
  SceneKeys
} from '../constants';
import { DIFFICULTY_PROFILES } from '../data/difficultyProfiles';
import {
  DEFAULT_RUN_MODIFIER,
  RUN_MODIFIERS,
  applyRunModifierToEffect,
  type RunModifierProfile
} from '../data/runModifiers';
import { FloatingText } from '../entities/FloatingText';
import { PipelineEvent } from '../entities/PipelineEvent';
import { Player } from '../entities/Player';
import { DifficultySystem } from '../systems/DifficultySystem';
import { EffectsSystem } from '../systems/EffectsSystem';
import { EventSpawner } from '../systems/EventSpawner';
import { HudSystem } from '../systems/HudSystem';
import { InputController, type NavIntent } from '../systems/InputController';
import { GamepadController, type GamepadButtonName } from '../systems/GamepadController';
import { InputDeviceService } from '../systems/InputDeviceService';
import { ScoreSystem } from '../systems/ScoreSystem';
import { SettingsService } from '../systems/SettingsService';
import { SoundManager } from '../systems/SoundManager';
import { createBackdrop } from '../ui';
import type {
  DifficultyId,
  EventEffect,
  PipelineEventType,
  PlayerAction,
  PlayerInputDevice,
  RunModifierId
} from '../types';

interface GameSceneData {
  difficulty: DifficultyId;
  sound?: SoundManager;
  /** When true, spawns use a deterministic daily seed. */
  daily?: boolean;
  modifier?: RunModifierId;
}

interface TrainingSpawn {
  type: PipelineEventType;
  lane: number;
  offsetX?: number;
}

interface TrainingStep {
  at: number;
  message: (labels: Record<PlayerAction, string>) => string;
  color: string;
  spawns: TrainingSpawn[];
}

const WAVE_WARNING_SECONDS = 2;

const TRAINING_STEPS: TrainingStep[] = [
  {
    at: 1,
    message: (labels) => `Move to CODE and press [${labels.FIX}] when the Bug enters the highlighted zone.`,
    color: CssColors.cyan,
    spawns: [{ type: 'BUG', lane: 1, offsetX: -90 }]
  },
  {
    at: 9,
    message: (labels) => `Features need two steps: [${labels.TEST}] Test, then [${labels.DEPLOY}] Deploy. [${labels.CONTEXT}] performs the next required step.`,
    color: CssColors.green,
    spawns: [{ type: 'FEATURE', lane: 4, offsetX: -90 }]
  },
  {
    at: 18,
    message: (labels) => `Tech Debt is optional, but ignoring it makes future spawns faster. [${labels.ANALYZE}] or [${labels.FIX}] clears it.`,
    color: CssColors.cyan,
    spawns: [{ type: 'TECH_DEBT', lane: 0, offsetX: -90 }]
  },
  {
    at: 26,
    message: (labels) => `Critical cards pulse red. Press [${labels.BLOCK}] on security findings before they become incidents.`,
    color: CssColors.red,
    spawns: [{ type: 'SECURITY_FINDING', lane: 3, offsetX: -90 }]
  },
  {
    at: 34,
    message: (labels) => `Production alerts need rollback. Get to DEPLOY and hit [${labels.ROLLBACK}].`,
    color: CssColors.orange,
    spawns: [{ type: 'PROD_ALERT', lane: 4, offsetX: -90 }]
  },
  {
    at: 42,
    message: () => 'Mini wave: follow the white target frame and clear the closest safe event first.',
    color: CssColors.yellow,
    spawns: [
      { type: 'BUG', lane: 1, offsetX: -90 },
      { type: 'BROKEN_TEST', lane: 2, offsetX: 70 },
      { type: 'SECURITY_FINDING', lane: 3, offsetX: 230 }
    ]
  },
  {
    at: 51,
    message: () => 'Final drill: the Release Train jumps lanes after each step. Chase it and ship clean.',
    color: CssColors.purple,
    spawns: [{ type: 'MEGA_RELEASE', lane: 1, offsetX: -150 }]
  }
];

export class GameScene extends Phaser.Scene {
  private difficultyId: DifficultyId = 'conference';
  private soundMgr!: SoundManager;

  private scoreSys!: ScoreSystem;
  private difficulty!: DifficultySystem;
  private spawner!: EventSpawner;
  private hud!: HudSystem;
  private effects!: EffectsSystem;
  private inputCtl?: InputController;
  private gamepadCtl?: GamepadController;
  private player!: Player;

  private pipelineEvents: PipelineEvent[] = [];
  private paused = false;
  private ended = false;
  private pauseGroup?: Phaser.GameObjects.Container;

  /** Conveyor speed multiplier (temporarily lowered by the Coffee Break power-up). */
  private speedMultiplier = 1;
  private slowToken = 0;

  /** Boss "incident wave" scheduling. */
  private elapsed = 0;
  private nextWaveAt = 35;
  private waveCount = 0;
  private waveWarningIssued = false;
  private activeWaveEvents = new Set<PipelineEvent>();
  private activeWaveFailed = false;

  private daily = false;
  private seed = 0;
  private modifierId: RunModifierId = DEFAULT_RUN_MODIFIER;
  private modifier: RunModifierProfile = RUN_MODIFIERS[DEFAULT_RUN_MODIFIER];
  private playerInputDevice: PlayerInputDevice = 'keyboard';
  private actionLabels!: Record<PlayerAction, string>;
  private reducedMotion = false;
  private laneWarningOverlays: Phaser.GameObjects.Rectangle[] = [];
  private trainingStepIndex = 0;
  private trainingPanel?: Phaser.GameObjects.Container;
  private trainingText?: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.Game);
  }

  init(data: GameSceneData): void {
    this.difficultyId = data.difficulty ?? 'conference';
    this.soundMgr = data.sound ?? new SoundManager();
    this.daily = data.daily ?? false;
    this.seed = dailySeed();
    this.modifierId = this.daily || data.difficulty === 'training'
      ? DEFAULT_RUN_MODIFIER
      : data.modifier ?? DEFAULT_RUN_MODIFIER;
    this.modifier = RUN_MODIFIERS[this.modifierId] ?? RUN_MODIFIERS[DEFAULT_RUN_MODIFIER];
    this.pipelineEvents = [];
    this.paused = false;
    this.ended = false;
    this.speedMultiplier = 1;
    this.slowToken = 0;
    this.elapsed = 0;
    this.nextWaveAt = 35;
    this.waveCount = 0;
    this.waveWarningIssued = false;
    this.activeWaveEvents.clear();
    this.activeWaveFailed = false;
    this.laneWarningOverlays = [];
    this.trainingStepIndex = 0;
  }

  create(): void {
    const profile = DIFFICULTY_PROFILES[this.difficultyId];
    const settings = SettingsService.load();
    this.reducedMotion = settings.reducedMotion;
    this.playerInputDevice = InputDeviceService.effectivePlayerInputDevice(settings, this);
    const actionLabels = InputDeviceService.actionLabels(settings, this);
    this.actionLabels = actionLabels;

    createBackdrop(this);
    this.drawLanes();

    const rng =
      this.daily || this.isTraining()
        ? new Phaser.Math.RandomDataGenerator([this.isTraining() ? 'training-shift' : String(this.seed)])
        : undefined;

    this.scoreSys = new ScoreSystem(profile.matchDuration);
    this.applyInitialModifierState();
    this.difficulty = new DifficultySystem(profile);
    this.spawner = new EventSpawner(this, this.difficulty, rng, actionLabels);
    this.effects = new EffectsSystem(this, this.soundMgr, this.reducedMotion);
    this.player = new Player(this);
    this.hud = new HudSystem(this, this.runLabel(profile.label));
    if (this.isTraining()) {
      this.createTrainingPanel();
      this.setTrainingMessage('Training Shift: follow the next card, then use the shown control.');
    }

    if (this.playerInputDevice === 'keyboard') {
      this.inputCtl = new InputController(this, {
        onAction: (a) => this.handleAction(a),
        onNav: (n) => this.handleNav(n),
        onPause: () => this.togglePause()
      }, settings.keyboardLayout);
      this.gamepadCtl = undefined;
    } else {
      this.inputCtl = undefined;
      this.gamepadCtl = new GamepadController(this, {
        onAction: (a) => this.handleAction(a),
        onNav: (n) => this.handleNav(n),
        onPause: () => this.togglePause(),
        onButton: (b) => this.onPauseButton(b)
      });
    }

    if (settings.music) {
      this.soundMgr.startMusic();
      this.soundMgr.setMusicIntensity(0);
    }

    // Small "GO" flourish at start.
    const go = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SHIP IT!', {
        fontFamily: 'Consolas, monospace',
        fontSize: '64px',
        color: CssColors.green,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(120);
    this.tweens.add({
      targets: go,
      alpha: 0,
      scale: 1.6,
      duration: 900,
      ease: 'Cubic.easeIn',
      onComplete: () => go.destroy()
    });

    this.pipelineEvents = [];
    this.hud.update(this.scoreSys.state);
    if (this.modifier.id !== 'classic') {
      this.showBanner(`MODIFIER: ${this.modifier.shortLabel}`, CssColors.cyan);
    }
  }

  private drawLanes(): void {
    const h = laneHeight();
    LANES.forEach((lane, i) => {
      const cy = laneCenterY(i);
      const top = cy - h / 2;
      // Alternating band background.
      this.add
        .rectangle(Layout.laneLabelWidth, top, GAME_WIDTH - Layout.laneLabelWidth, h, Colors.bgAlt, i % 2 === 0 ? 0.5 : 0.25)
        .setOrigin(0, 0);
      // Separator line.
      this.add
        .rectangle(Layout.laneLabelWidth, top, GAME_WIDTH - Layout.laneLabelWidth, 1, Colors.laneLine)
        .setOrigin(0, 0);
      const warningOverlay = this.add
        .rectangle(
          Layout.laneLabelWidth,
          top,
          GAME_WIDTH - Layout.laneLabelWidth,
          h,
          LaneColors[lane],
          0
        )
        .setOrigin(0, 0)
        .setDepth(35);
      this.laneWarningOverlays[i] = warningOverlay;
      // Lane label block.
      this.add
        .rectangle(0, top, Layout.laneLabelWidth, h, Colors.panel)
        .setOrigin(0, 0);
      this.add
        .rectangle(Layout.laneLabelWidth - 4, top + 8, 4, h - 16, LaneColors[lane])
        .setOrigin(0, 0);
      this.add
        .text(16, cy, lane, {
          fontFamily: 'Consolas, monospace',
          fontSize: '18px',
          color: '#' + LaneColors[lane].toString(16).padStart(6, '0'),
          fontStyle: 'bold'
        })
        .setOrigin(0, 0.5);
    });

    // Bottom separator for last lane.
    const bottom = laneCenterY(LANES.length - 1) + h / 2;
    this.add
      .rectangle(Layout.laneLabelWidth, bottom, GAME_WIDTH - Layout.laneLabelWidth, 1, Colors.laneLine)
      .setOrigin(0, 0);

    // Interception zone marker around the player column.
    this.add
      .rectangle(
        Layout.playerX,
        (Layout.laneAreaTop + Layout.laneAreaBottom) / 2,
        (Layout.hitZoneHalfWidth + 64) * 2,
        Layout.laneAreaBottom - Layout.laneAreaTop,
        Colors.cyan,
        0.05
      )
      .setStrokeStyle(2, Colors.cyan, 0.25)
      .setOrigin(0.5);
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.ended) return;
    const dt = delta / 1000;

    this.difficulty.update(dt);
    this.scoreSys.tickTimer(dt);
    this.elapsed += dt;

    // Music intensity rises with difficulty and combo.
    const intensity = Math.min(
      1,
      this.difficulty.progress * 0.7 + Math.min(this.scoreSys.state.combo, 12) / 12 * 0.3
    );
    this.soundMgr.setMusicIntensity(intensity);

    if (this.isTraining()) {
      this.updateTrainingScript();
    } else {
      this.updateWaveWarning();
      if (this.elapsed >= this.nextWaveAt && this.scoreSys.state.timeLeft > 20) {
        // Boss incident waves (not in the final stretch, to stay fair).
        this.triggerIncidentWave();
        const interval = 40 - 15 * this.difficulty.progress; // 40s -> 25s
        this.nextWaveAt = this.elapsed + interval;
        this.waveWarningIssued = false;
      }
    }

    if (!this.isTraining()) {
      // Spawn.
      const spawned = this.spawner.update(dt * (this.modifier.spawnRateMultiplier ?? 1), this.scoreSys.state.techDebt);
      if (spawned) this.pipelineEvents.push(spawned);
    }

    // Move + cull.
    const speed = this.difficulty.eventSpeed();
    const dx = speed * dt * this.speedMultiplier * (this.modifier.speedMultiplier ?? 1);
    for (let i = this.pipelineEvents.length - 1; i >= 0; i--) {
      const ev = this.pipelineEvents[i];
      ev.move(dx);
      if (!ev.handled && ev.x < Layout.despawnX) {
        this.resolveIgnore(ev);
        this.pipelineEvents.splice(i, 1);
      }
    }
    this.refreshTargeting();

    this.hud.update(this.scoreSys.state);

    if (this.scoreSys.isGameOver()) {
      this.endGame();
    }
  }

  // ---- Input handling -------------------------------------------------

  private handleNav(intent: NavIntent): void {
    if (this.paused || this.ended) return;
    switch (intent) {
      case 'UP':
        if (this.player.moveLane(-1)) this.soundMgr.move();
        break;
      case 'DOWN':
        if (this.player.moveLane(1)) this.soundMgr.move();
        break;
      case 'LEFT':
        this.player.dodge(-1);
        break;
      case 'RIGHT':
        this.player.dodge(1);
        break;
    }
  }

  private handleAction(action: PlayerAction): void {
    if (this.paused || this.ended) return;
    const target = this.getTargetEvent();
    if (!target) {
      // Whiff — no target in zone. Neutral, tiny visual cue only.
      this.player.react(Colors.textDim);
      return;
    }

    // Contextual quick action auto-selects the next expected input.
    const resolved: PlayerAction = action === 'CONTEXT' ? target.nextAction : action;
    const result = target.applyAction(resolved);

    if (result === 'complete') {
      this.resolveSuccess(target);
    } else if (result === 'progress') {
      this.player.react(target.def.color);
      this.effects.positiveFlash(this.player.x, this.player.y - 30, target.def.color);
      const label = target.def.chain ? 'CHAIN!' : 'nice';
      FloatingText.spawn(this, target.x, target.container.y - 40, label, CssColors.cyan, target.def.chain ? 20 : 16);
      // Chained mega events leap to a new lane after each step.
      if (target.def.chain) {
        target.jumpToRandomLane();
        this.soundMgr.combo();
      }
    } else {
      this.resolveWrong(target, resolved);
    }
  }

  /** Choose the most urgent event aligned with the player and in zone. */
  private getTargetEvent(): PipelineEvent | null {
    let best: PipelineEvent | null = null;
    let bestDist = Infinity;
    for (const ev of this.pipelineEvents) {
      if (ev.handled) continue;
      if (!ev.isAligned(this.player.laneIndex)) continue;
      if (!ev.isInZone(this.player.x, Layout.hitZoneHalfWidth)) continue;
      const dist = Math.abs(ev.x - this.player.x);
      if (dist < bestDist) {
        bestDist = dist;
        best = ev;
      }
    }
    return best;
  }

  private refreshTargeting(): void {
    const target = this.getTargetEvent();
    for (const ev of this.pipelineEvents) {
      ev.setTargeted(ev === target);
    }
  }

  // ---- Outcome resolution --------------------------------------------

  private resolveSuccess(ev: PipelineEvent): void {
    const def = ev.def;
    const gained = this.scoreSys.apply(this.modifiedEffect(def.onSuccess, 'success'), 'success');
    ev.handled = true;
    ev.flashSuccess();
    this.removeEvent(ev);

    this.player.react(def.color);
    FloatingText.spawn(
      this,
      ev.x,
      ev.container.y - 44,
      `+${gained}`,
      CssColors.green,
      28
    );

    if (def.mega) {
      this.effects.megaCelebrate(ev.x, ev.container.y);
      FloatingText.spawn(this, ev.x, ev.container.y + 6, 'RELEASED!', CssColors.purple, 22);
    } else if (def.onSuccess.featureShipped) {
      this.effects.shipFeature(ev.x, ev.container.y);
      FloatingText.spawn(this, ev.x, ev.container.y + 6, 'SHIPPED', CssColors.green, 18);
    } else {
      this.effects.positiveFlash(ev.x, ev.container.y, def.color);
    }

    const combo = this.scoreSys.state.combo;
    if (combo >= 2 && combo % 4 === 0) {
      this.effects.comboPop(this.player.x, this.player.y - 40);
      FloatingText.spawn(
        this,
        this.player.x,
        this.player.y - 60,
        `COMBO x${this.scoreSys.state.comboMultiplier}`,
        CssColors.purple,
        22
      );
    }

    if (def.powerUp === 'SLOW') this.activateSlow();
    else if (def.powerUp === 'CLEAR') this.activateClear();
    this.markWaveEventResolved(ev, true);
  }

  // ---- Power-ups ------------------------------------------------------

  private activateSlow(): void {
    this.scoreSys.recordPowerUpUsed();
    this.speedMultiplier = 0.45;
    const token = ++this.slowToken;
    this.showBanner('COFFEE BREAK \u2014 conveyor slowed', CssColors.purple);
    this.time.delayedCall(5000, () => {
      if (token === this.slowToken) this.speedMultiplier = 1;
    });
  }

  private activateClear(): void {
    this.scoreSys.recordPowerUpUsed();
    // Auto-resolve all critical events currently on screen (big combo boost).
    const criticals = this.pipelineEvents.filter((e) => !e.handled && e.def.critical);
    this.showBanner('HOTFIX \u2014 criticals auto-resolved', CssColors.green);
    this.effects.positiveFlash(this.player.x, this.player.y, Colors.green);
    for (const ev of criticals) {
      this.resolveSuccess(ev);
    }
  }

  // ---- Boss incident waves -------------------------------------------

  private isTraining(): boolean {
    return this.difficultyId === 'training';
  }

  // ---- Training script ------------------------------------------------

  private createTrainingPanel(): void {
    const y = GAME_HEIGHT - 22;
    const bg = this.add
      .rectangle(GAME_WIDTH / 2, y, 860, 34, Colors.panel, 0.94)
      .setStrokeStyle(2, Colors.cyan, 0.75);
    this.trainingText = this.add
      .text(GAME_WIDTH / 2, y, '', {
        fontFamily: 'Consolas, monospace',
        fontSize: '15px',
        color: CssColors.text,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 820 }
      })
      .setOrigin(0.5);
    this.trainingPanel = this.add
      .container(0, 0, [bg, this.trainingText])
      .setDepth(145);
  }

  private setTrainingMessage(message: string, color: string = CssColors.text): void {
    this.trainingText?.setText(message);
    this.trainingText?.setColor(color);
  }

  private updateTrainingScript(): void {
    while (
      this.trainingStepIndex < TRAINING_STEPS.length &&
      this.elapsed >= TRAINING_STEPS[this.trainingStepIndex].at
    ) {
      const step = TRAINING_STEPS[this.trainingStepIndex];
      this.setTrainingMessage(step.message(this.actionLabels), step.color);
      this.showBanner('TRAINING DRILL', step.color);
      for (const spawn of step.spawns) {
        this.pipelineEvents.push(
          this.spawner.spawnOfType(spawn.type, spawn.lane, spawn.offsetX ?? 0)
        );
      }
      this.trainingStepIndex += 1;
    }
  }

  private triggerIncidentWave(): void {
    this.waveCount += 1;
    this.startWaveTracking();
    // Rotate wave patterns deterministically (fair for daily runs).
    const pattern = this.waveCount % 3;
    if (pattern === 1) this.waveBurst();
    else if (pattern === 2) this.waveRush();
    else this.waveMega();
  }

  private updateWaveWarning(): void {
    if (this.waveWarningIssued) return;
    if (this.scoreSys.state.timeLeft <= 20 + WAVE_WARNING_SECONDS) return;
    if (this.elapsed < this.nextWaveAt - WAVE_WARNING_SECONDS) return;
    if (this.elapsed >= this.nextWaveAt) return;

    this.waveWarningIssued = true;
    const warning = this.nextWaveWarning();
    this.showBanner(warning.text, warning.color);
    this.pulseWarningLanes(warning.lanes, warning.colorNumber);
    this.soundMgr.warning();
  }

  private nextWaveWarning(): { text: string; color: string; colorNumber: number; lanes: number[] } {
    const nextWaveCount = this.waveCount + 1;
    const pattern = nextWaveCount % 3;
    if (pattern === 1) {
      const lanes = [4, 3, 2];
      if (this.difficulty.progress > 0.5) lanes.push(1);
      return {
        text: 'INCIDENT INCOMING',
        color: CssColors.red,
        colorNumber: Colors.red,
        lanes
      };
    }
    if (pattern === 2) {
      const lane = 1 + (nextWaveCount % 4);
      const label = nextWaveCount % 2 === 0 ? 'BUG STORM' : 'TEST STORM';
      return {
        text: `${label} INCOMING \u2014 ${LANES[lane]}`,
        color: CssColors.orange,
        colorNumber: Colors.orange,
        lanes: [lane]
      };
    }
    return {
      text: 'RELEASE TRAIN APPROACHING',
      color: CssColors.purple,
      colorNumber: Colors.purple,
      lanes: [1]
    };
  }

  private pulseWarningLanes(lanes: number[], color: number): void {
    for (const lane of lanes) {
      const overlay = this.laneWarningOverlays[lane];
      if (!overlay) continue;
      overlay.fillColor = color;
      overlay.setAlpha(0);
      this.tweens.killTweensOf(overlay);
      this.tweens.add({
        targets: overlay,
        alpha: { from: 0.06, to: 0.28 },
        duration: 260,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => overlay.setAlpha(0)
      });
    }
  }

  private startWaveTracking(): void {
    this.activeWaveEvents.clear();
    this.activeWaveFailed = false;
    this.scoreSys.recordWaveStarted();
  }

  private trackWaveEvent(ev: PipelineEvent): void {
    this.activeWaveEvents.add(ev);
    this.pipelineEvents.push(ev);
  }

  private markWaveEventResolved(ev: PipelineEvent, success: boolean): void {
    if (!this.activeWaveEvents.has(ev)) return;
    if (!success) this.activeWaveFailed = true;
    this.activeWaveEvents.delete(ev);
    if (this.activeWaveEvents.size === 0 && !this.activeWaveFailed) {
      this.scoreSys.recordWaveCleared();
    }
  }

  /** Pattern A — critical burst spread across lanes. */
  private waveBurst(): void {
    this.effects.incident();
    this.showBanner(`\u26A0 INCIDENT WAVE ${this.waveCount} \u26A0`, CssColors.red);
    const specs: Array<[PipelineEventType, number]> = [
      ['PROD_ALERT', 4],
      ['SECURITY_FINDING', 3],
      ['ONCALL_PAGE', 2]
    ];
    if (this.difficulty.progress > 0.5) specs.push(['PROD_ALERT', 1]);
    specs.forEach(([type, lane], i) => {
      this.trackWaveEvent(this.spawner.spawnOfType(type, lane, i * 200));
    });
  }

  /** Pattern B — a single-lane storm of the same event type. */
  private waveRush(): void {
    this.effects.incident();
    const lane = 1 + (this.waveCount % 4); // CODE..DEPLOY
    const type: PipelineEventType = this.waveCount % 2 === 0 ? 'BUG' : 'BROKEN_TEST';
    const label = type === 'BUG' ? 'BUG STORM' : 'TEST STORM';
    this.showBanner(`\u26A1 ${label} \u2014 lane ${LANES[lane]}`, CssColors.orange);
    const count = 4 + Math.round(this.difficulty.progress * 2);
    for (let i = 0; i < count; i++) {
      this.trackWaveEvent(this.spawner.spawnOfType(type, lane, i * 150));
    }
  }

  /** Pattern C — a chained multi-lane mega release. */
  private waveMega(): void {
    this.effects.incident();
    this.showBanner('\u21C9 RELEASE TRAIN INCOMING \u21C9', CssColors.purple);
    this.trackWaveEvent(this.spawner.spawnOfType('MEGA_RELEASE', 1, 0));
  }

  /** Transient top-center notification banner. */
  private showBanner(text: string, color: string): void {
    const banner = this.add
      .text(GAME_WIDTH / 2, Layout.hudHeight + 26, text, {
        fontFamily: 'Consolas, monospace',
        fontSize: '22px',
        color,
        fontStyle: 'bold',
        stroke: '#05070f',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(150);
    this.tweens.add({
      targets: banner,
      y: banner.y - 16,
      alpha: { from: 1, to: 0 },
      duration: 1800,
      ease: 'Cubic.easeOut',
      onComplete: () => banner.destroy()
    });
  }

  private resolveWrong(ev: PipelineEvent, action: PlayerAction): void {
    const def = ev.def;
    const isDangerous = def.dangerousActions?.includes(action) ?? false;
    const rawEffect: EventEffect =
      isDangerous && def.dangerousEffect ? def.dangerousEffect : def.onWrong;
    const effect = this.modifiedEffect(rawEffect, 'wrong');

    const delta = this.scoreSys.apply(effect, 'wrong');
    this.scoreSys.recordWrongAction(isDangerous);
    ev.handled = true;
    ev.flashWrong();
    this.markWaveEventResolved(ev, false);
    this.time.delayedCall(140, () => this.removeEvent(ev));

    if (isDangerous || effect.majorIncident) {
      this.effects.incident();
    } else {
      this.effects.errorFeedback();
    }
    FloatingText.spawn(
      this,
      ev.x,
      ev.container.y - 44,
      `${delta}`,
      CssColors.red,
      24
    );
  }

  private resolveIgnore(ev: PipelineEvent): void {
    const def = ev.def;
    const effect = this.modifiedEffect(def.onIgnore, 'ignore');
    const delta = this.scoreSys.apply(effect, 'ignore');
    if (!def.powerUp) this.scoreSys.recordMissedEvent(Boolean(def.critical));
    this.markWaveEventResolved(ev, false);
    if (effect.majorIncident) {
      this.effects.incident();
    } else if (def.critical) {
      this.effects.errorFeedback();
    }
    if (delta !== 0) {
      FloatingText.spawn(
        this,
        Layout.laneLabelWidth + 40,
        ev.container.y - 20,
        `${delta}`,
        CssColors.orange,
        20
      );
    }
    ev.destroy();
  }

  private removeEvent(ev: PipelineEvent): void {
    ev.setTargeted(false);
    const idx = this.pipelineEvents.indexOf(ev);
    if (idx >= 0) this.pipelineEvents.splice(idx, 1);
    this.time.delayedCall(240, () => ev.destroy());
  }

  private modifiedEffect(effect: EventEffect, outcome: 'success' | 'wrong' | 'ignore'): EventEffect {
    return applyRunModifierToEffect(effect, outcome, this.modifier);
  }

  private applyInitialModifierState(): void {
    const s = this.scoreSys.state;
    s.buildStability = clamp(s.buildStability + (this.modifier.initialBuildStability ?? 0), 0, Gauges.buildMax);
    s.productionHealth = clamp(s.productionHealth + (this.modifier.initialProductionHealth ?? 0), 0, Gauges.productionMax);
    s.techDebt = clamp(s.techDebt + (this.modifier.initialTechDebt ?? 0), 0, Gauges.techDebtMax);
  }

  private runLabel(baseLabel: string): string {
    if (this.daily) return `DAILY \u00B7 ${baseLabel}`;
    if (this.modifier.id === 'classic') return baseLabel;
    return `${baseLabel} \u00B7 ${this.modifier.shortLabel}`;
  }

  // ---- Pause ----------------------------------------------------------

  private togglePause(): void {
    if (this.ended) return;
    this.paused = !this.paused;
    if (this.paused) this.showPauseMenu();
    else this.hidePauseMenu();
  }

  /** Gamepad controls while the pause overlay is shown. */
  private onPauseButton(button: GamepadButtonName): void {
    if (!this.paused) return;
    if (button === 'A') this.restartFromPause();
    else if (button === 'B') this.quitToMenu();
  }

  private showPauseMenu(): void {
    const overlay = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Colors.bg, 0.82)
      .setOrigin(0, 0);
    const title = this.add
      .text(GAME_WIDTH / 2, 200, 'PAUSED', {
        fontFamily: 'Consolas, monospace',
        fontSize: '64px',
        color: CssColors.cyan,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    const lines = [
      this.playerInputDevice === 'gamepad' ? '(Menu)   Resume' : '[ESC / P]   Resume',
      this.playerInputDevice === 'gamepad' ? '(A)      Restart shift' : '[ENTER]    Restart shift',
      this.playerInputDevice === 'gamepad' ? '(B)      Back to menu' : '[Q]        Back to menu'
    ];
    const texts = lines.map((l, i) =>
      this.add
        .text(GAME_WIDTH / 2, 300 + i * 44, l, {
          fontFamily: 'Consolas, monospace',
          fontSize: '24px',
          color: CssColors.text
        })
        .setOrigin(0.5)
    );

    this.pauseGroup = this.add.container(0, 0, [overlay, title, ...texts]).setDepth(200);

    if (this.playerInputDevice === 'keyboard') {
      const kb = this.input.keyboard;
      kb?.once('keydown-ENTER', this.restartFromPause, this);
      kb?.once('keydown-Q', this.quitToMenu, this);
    }
  }

  private hidePauseMenu(): void {
    const kb = this.input.keyboard;
    kb?.off('keydown-ENTER', this.restartFromPause, this);
    kb?.off('keydown-Q', this.quitToMenu, this);
    this.pauseGroup?.destroy();
    this.pauseGroup = undefined;
  }

  private restartFromPause(): void {
    this.cleanup();
    this.scene.restart({ difficulty: this.difficultyId, sound: this.soundMgr, daily: this.daily, modifier: this.modifierId });
  }

  private quitToMenu(): void {
    this.cleanup();
    this.scene.start(SceneKeys.Menu, { sound: this.soundMgr });
  }

  // ---- End of match ---------------------------------------------------

  private endGame(): void {
    if (this.ended) return;
    this.ended = true;
    const reason = this.scoreSys.gameOverReason();
    const breakdown = this.scoreSys.computeBreakdown();

    this.inputCtl?.setEnabled(false);
    this.gamepadCtl?.setEnabled(false);
    if (!this.reducedMotion) this.cameras.main.flash(300, 10, 15, 30);

    this.time.delayedCall(600, () => {
      this.cleanup();
      this.scene.start(SceneKeys.GameOver, {
        result: {
          state: { ...this.scoreSys.state },
          breakdown,
          difficulty: this.difficultyId,
          seed: this.seed,
          modifier: this.modifierId
        },
        reason,
        sound: this.soundMgr,
        daily: this.daily
      });
    });
  }

  private cleanup(): void {
    this.soundMgr.stopMusic();
    this.inputCtl?.destroy();
    this.gamepadCtl?.destroy();
    this.inputCtl = undefined;
    this.gamepadCtl = undefined;
    for (const ev of this.pipelineEvents) ev.destroy();
    this.pipelineEvents = [];
    this.pauseGroup?.destroy();
    this.pauseGroup = undefined;
    this.trainingPanel?.destroy();
    this.trainingPanel = undefined;
    this.trainingText = undefined;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
