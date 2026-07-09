/**
 * VersusScene — local same-screen duel. P1 uses gamepad 1, P2 uses gamepad 2.
 * Both race on the same event stream.
 */
import Phaser from 'phaser';
import {
  Colors,
  CssColors,
  GAME_HEIGHT,
  GAME_WIDTH,
  GamepadActionLabels,
  LANES,
  LaneColors,
  Layout,
  laneCenterY,
  laneHeight,
  SceneKeys
} from '../constants';
import { DIFFICULTY_PROFILES } from '../data/difficultyProfiles';
import { FloatingText } from '../entities/FloatingText';
import { PipelineEvent, type PipelineTargetMarker } from '../entities/PipelineEvent';
import { Player } from '../entities/Player';
import { DifficultySystem } from '../systems/DifficultySystem';
import { EffectsSystem } from '../systems/EffectsSystem';
import { EventSpawner } from '../systems/EventSpawner';
import { GamepadController, type GamepadButtonName } from '../systems/GamepadController';
import type { NavIntent } from '../systems/InputController';
import { ScoreSystem } from '../systems/ScoreSystem';
import { SettingsService } from '../systems/SettingsService';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, titleStyle } from '../ui';
import type { EventEffect, PlayerAction } from '../types';

interface VersusData {
  sound?: SoundManager;
  p1Color?: number;
  p2Color?: number;
}

interface DuelPlayer {
  id: 'P1' | 'P2';
  label: string;
  color: number;
  colorCss: string;
  avatar: Player;
  score: ScoreSystem;
  scoreText: Phaser.GameObjects.Text;
  comboText: Phaser.GameObjects.Text;
  statsText: Phaser.GameObjects.Text;
  duelStats: DuelStats;
}

interface DuelStats {
  steals: number;
  stolen: number;
}

const DUEL_DURATION_SECONDS = 120;
const DUEL_PROFILE = {
  ...DIFFICULTY_PROFILES.hard,
  label: 'Local Duel',
  matchDuration: DUEL_DURATION_SECONDS
};

export class VersusScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private difficulty!: DifficultySystem;
  private spawner!: EventSpawner;
  private effects!: EffectsSystem;
  private p1GamepadCtl!: GamepadController;
  private p2GamepadCtl!: GamepadController;

  private p1!: DuelPlayer;
  private p2!: DuelPlayer;
  private timerText!: Phaser.GameObjects.Text;
  private pipelineEvents: PipelineEvent[] = [];
  private progressOwners = new WeakMap<PipelineEvent, DuelPlayer['id']>();
  private paused = false;
  private ended = false;
  private pauseGroup?: Phaser.GameObjects.Container;
  private speedMultiplier = 1;
  private slowToken = 0;
  private p1Color: number = Colors.cyan;
  private p2Color: number = Colors.purple;

  constructor() {
    super(SceneKeys.Versus);
  }

  init(data: VersusData): void {
    this.soundMgr = data.sound ?? new SoundManager();
    this.p1Color = data.p1Color ?? Colors.cyan;
    this.p2Color = data.p2Color ?? Colors.purple;
    this.pipelineEvents = [];
    this.progressOwners = new WeakMap<PipelineEvent, DuelPlayer['id']>();
    this.paused = false;
    this.ended = false;
    this.speedMultiplier = 1;
    this.slowToken = 0;
  }

  create(): void {
    const settings = SettingsService.load();

    createBackdrop(this);
    this.drawLanes();

    this.difficulty = new DifficultySystem(DUEL_PROFILE);
    this.spawner = new EventSpawner(
      this,
      this.difficulty,
      new Phaser.Math.RandomDataGenerator([`versus:${Date.now()}`]),
      GamepadActionLabels
    );
    this.effects = new EffectsSystem(this, this.soundMgr, settings.reducedMotion);

    const p1Score = new ScoreSystem(DUEL_DURATION_SECONDS);
    const p2Score = new ScoreSystem(DUEL_DURATION_SECONDS);
    this.p1 = this.createDuelPlayer('P1', 'P1 PAD 1', this.p1Color, Layout.playerX - 34, p1Score);
    this.p2 = this.createDuelPlayer('P2', 'P2 PAD 2', this.p2Color, Layout.playerX + 34, p2Score);

    this.p1GamepadCtl = new GamepadController(this, {
      onAction: (action) => this.handleAction(this.p1, action),
      onNav: (intent) => this.handleNav(this.p1, intent),
      onPause: () => this.togglePause(),
      onButton: (button) => this.handleGamepadButton(button)
    }, { padSlot: 0 });

    this.p2GamepadCtl = new GamepadController(this, {
      onAction: (action) => this.handleAction(this.p2, action),
      onNav: (intent) => this.handleNav(this.p2, intent),
      onPause: () => this.togglePause(),
      onButton: (button) => this.handleGamepadButton(button)
    }, { padSlot: 1 });

    if (settings.music) {
      this.soundMgr.startMusic();
      this.soundMgr.setMusicIntensity(0.35);
    }

    this.showDuelIntro();
    this.updateHud();
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.ended) return;
    const dt = delta / 1000;

    this.difficulty.update(dt);
    this.p1.score.tickTimer(dt);
    this.p2.score.tickTimer(dt);
    this.soundMgr.setMusicIntensity(Math.min(1, 0.35 + this.difficulty.progress * 0.55));

    const spawned = this.spawner.update(dt, this.sharedTechDebt());
    if (spawned) this.pipelineEvents.push(spawned);

    const dx = this.difficulty.eventSpeed() * dt * this.speedMultiplier;
    for (let i = this.pipelineEvents.length - 1; i >= 0; i -= 1) {
      const ev = this.pipelineEvents[i];
      ev.move(dx);
      if (!ev.handled && ev.x < Layout.despawnX) {
        this.resolveIgnore(ev);
        this.pipelineEvents.splice(i, 1);
      }
    }

    this.refreshTargeting();
    this.updateHud();

    if (this.p1.score.state.timeLeft <= 0) {
      this.endDuel();
    }
  }

  private drawLanes(): void {
    const h = laneHeight();
    LANES.forEach((lane, i) => {
      const cy = laneCenterY(i);
      const top = cy - h / 2;
      this.add
        .rectangle(Layout.laneLabelWidth, top, GAME_WIDTH - Layout.laneLabelWidth, h, Colors.bgAlt, i % 2 === 0 ? 0.5 : 0.25)
        .setOrigin(0, 0);
      this.add
        .rectangle(Layout.laneLabelWidth, top, GAME_WIDTH - Layout.laneLabelWidth, 1, Colors.laneLine)
        .setOrigin(0, 0);
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
          color: colorToCss(LaneColors[lane]),
          fontStyle: 'bold'
        })
        .setOrigin(0, 0.5);
    });

    const bottom = laneCenterY(LANES.length - 1) + h / 2;
    this.add
      .rectangle(Layout.laneLabelWidth, bottom, GAME_WIDTH - Layout.laneLabelWidth, 1, Colors.laneLine)
      .setOrigin(0, 0);

    this.add
      .rectangle(
        Layout.playerX,
        (Layout.laneAreaTop + Layout.laneAreaBottom) / 2,
        (Layout.hitZoneHalfWidth + 64) * 2,
        Layout.laneAreaBottom - Layout.laneAreaTop,
        Colors.white,
        0.035
      )
      .setStrokeStyle(2, Colors.white, 0.18)
      .setOrigin(0.5);
  }

  private createDuelPlayer(
    id: 'P1' | 'P2',
    label: string,
    color: number,
    x: number,
    score: ScoreSystem
  ): DuelPlayer {
    const colorCss = colorToCss(color);
    const panelX = id === 'P1' ? 24 : GAME_WIDTH - 278;
    const textX = id === 'P1' ? 42 : GAME_WIDTH - 260;
    const scoreX = id === 'P1' ? 42 : GAME_WIDTH - 260;

    panel(this, panelX + 127, 48, 254, 74, color);
    this.add.text(textX, 16, label, bodyStyle(13, colorCss)).setOrigin(0, 0);
    const scoreText = this.add
      .text(scoreX, 30, '0', {
        fontFamily: 'Consolas, monospace',
        fontSize: '30px',
        color: CssColors.white,
        fontStyle: 'bold'
      })
      .setOrigin(0, 0);
    const comboText = this.add.text(textX, 64, '', bodyStyle(12, colorCss)).setOrigin(0, 0);
    const statsText = this.add.text(textX + 108, 66, '', bodyStyle(11, CssColors.textDim)).setOrigin(0, 0);
    const avatar = new Player(this, { x, color, label: id, depth: id === 'P1' ? 62 : 63 });

    return {
      id,
      label,
      color,
      colorCss,
      avatar,
      score,
      scoreText,
      comboText,
      statsText,
      duelStats: { steals: 0, stolen: 0 }
    };
  }

  private showDuelIntro(): void {
    this.add
      .text(GAME_WIDTH / 2, 12, 'LOCAL DUEL', bodyStyle(15, CssColors.yellow))
      .setOrigin(0.5, 0);
    this.timerText = this.add
      .text(GAME_WIDTH / 2, 30, '2:00', {
        fontFamily: 'Consolas, monospace',
        fontSize: '34px',
        color: CssColors.cyan,
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0);
    this.add
      .text(GAME_WIDTH / 2, 70, 'P1 pad 1 vs P2 pad 2  \u00B7  race for the same cards', bodyStyle(13, CssColors.textDim))
      .setOrigin(0.5, 0);

    const go = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'DUEL!', titleStyle(58))
      .setOrigin(0.5)
      .setDepth(150);
    this.tweens.add({
      targets: go,
      alpha: 0,
      scale: 1.35,
      duration: 850,
      ease: 'Cubic.easeIn',
      onComplete: () => go.destroy()
    });
  }

  private handleNav(player: DuelPlayer, intent: NavIntent): void {
    if (this.paused || this.ended) return;
    switch (intent) {
      case 'UP':
        if (player.avatar.moveLane(-1)) this.soundMgr.move();
        break;
      case 'DOWN':
        if (player.avatar.moveLane(1)) this.soundMgr.move();
        break;
      case 'LEFT':
        player.avatar.dodge(-1);
        break;
      case 'RIGHT':
        player.avatar.dodge(1);
        break;
    }
  }

  private handleAction(player: DuelPlayer, action: PlayerAction): void {
    if (this.paused || this.ended) return;
    const target = this.getTargetEvent(player);
    if (!target) {
      player.avatar.react(Colors.textDim);
      return;
    }

    const resolved: PlayerAction = action === 'CONTEXT' ? target.nextAction : action;
    const previousOwner = this.progressOwners.get(target);
    const progressBefore = target.progress;
    const result = target.applyAction(resolved);

    if (result === 'complete') {
      this.recordSteal(player, target, previousOwner, progressBefore);
      this.resolveSuccess(player, target);
    } else if (result === 'progress') {
      this.progressOwners.set(target, player.id);
      player.avatar.react(target.def.color);
      this.effects.positiveFlash(player.avatar.x, player.avatar.y - 30, target.def.color);
      FloatingText.spawn(this, target.x, target.container.y - 42, `${player.id} step`, player.colorCss, 16);
      if (target.def.chain) {
        target.jumpToRandomLane();
        this.soundMgr.combo();
      }
    } else {
      this.resolveWrong(player, target, resolved);
    }
  }

  private getTargetEvent(player: DuelPlayer): PipelineEvent | null {
    let best: PipelineEvent | null = null;
    let bestDist = Infinity;
    for (const ev of this.pipelineEvents) {
      if (ev.handled) continue;
      if (!ev.isAligned(player.avatar.laneIndex)) continue;
      if (!ev.isInZone(Layout.playerX, Layout.hitZoneHalfWidth)) continue;
      const dist = Math.abs(ev.x - Layout.playerX);
      if (dist < bestDist) {
        bestDist = dist;
        best = ev;
      }
    }
    return best;
  }

  private refreshTargeting(): void {
    const p1Target = this.getTargetEvent(this.p1);
    const p2Target = this.getTargetEvent(this.p2);
    for (const ev of this.pipelineEvents) {
      const targeters: PipelineTargetMarker[] = [];
      if (ev === p1Target) targeters.push({ id: this.p1.id, color: this.p1.color });
      if (ev === p2Target) targeters.push({ id: this.p2.id, color: this.p2.color });
      ev.setDuelTargeters(targeters);
    }
  }

  private recordSteal(
    player: DuelPlayer,
    ev: PipelineEvent,
    previousOwner: DuelPlayer['id'] | undefined,
    progressBefore: number
  ): void {
    if (progressBefore <= 0 || previousOwner === undefined || previousOwner === player.id) return;
    player.duelStats.steals += 1;
    this.opponentOf(player).duelStats.stolen += 1;
    FloatingText.spawn(this, ev.x, ev.container.y - 72, `${player.id} STEAL`, player.colorCss, 18);
  }

  private opponentOf(player: DuelPlayer): DuelPlayer {
    return player.id === 'P1' ? this.p2 : this.p1;
  }

  private resolveSuccess(player: DuelPlayer, ev: PipelineEvent): void {
    const def = ev.def;
    const gained = player.score.apply(def.onSuccess, 'success');
    ev.handled = true;
    ev.flashSuccess();
    this.removeEvent(ev);

    player.avatar.react(def.color);
    FloatingText.spawn(this, ev.x, ev.container.y - 44, `${player.id} +${gained}`, player.colorCss, 24);

    if (def.mega) {
      this.effects.megaCelebrate(ev.x, ev.container.y);
    } else if (def.onSuccess.featureShipped) {
      this.effects.shipFeature(ev.x, ev.container.y);
    } else {
      this.effects.positiveFlash(ev.x, ev.container.y, def.color);
    }

    const combo = player.score.state.combo;
    if (combo >= 2 && combo % 4 === 0) {
      this.effects.comboPop(player.avatar.x, player.avatar.y - 40);
      FloatingText.spawn(this, player.avatar.x, player.avatar.y - 60, `${player.id} x${player.score.state.comboMultiplier}`, player.colorCss, 20);
    }

    if (def.powerUp === 'SLOW') this.activateSlow(player);
    else if (def.powerUp === 'CLEAR') this.activateClear(player);
  }

  private resolveWrong(player: DuelPlayer, ev: PipelineEvent, action: PlayerAction): void {
    const def = ev.def;
    const isDangerous = def.dangerousActions?.includes(action) ?? false;
    const effect: EventEffect =
      isDangerous && def.dangerousEffect ? def.dangerousEffect : def.onWrong;
    const delta = player.score.apply(effect, 'wrong');
    player.score.recordWrongAction(isDangerous);
    ev.handled = true;
    ev.flashWrong();
    this.time.delayedCall(140, () => this.removeEvent(ev));
    player.avatar.react(Colors.red);

    if (isDangerous || effect.majorIncident) this.effects.incident();
    else this.effects.errorFeedback();

    FloatingText.spawn(this, ev.x, ev.container.y - 44, `${player.id} ${delta}`, CssColors.red, 22);
  }

  private resolveIgnore(ev: PipelineEvent): void {
    const def = ev.def;
    if (!def.powerUp) {
      this.p1.score.recordMissedEvent(Boolean(def.critical));
      this.p2.score.recordMissedEvent(Boolean(def.critical));
    }
    this.p1.score.apply(def.onIgnore, 'ignore');
    this.p2.score.apply(def.onIgnore, 'ignore');
    if (def.onIgnore.majorIncident) this.effects.incident();
    else if (def.critical) this.effects.errorFeedback();
    ev.destroy();
  }

  private removeEvent(ev: PipelineEvent): void {
    this.progressOwners.delete(ev);
    ev.setDuelTargeters([]);
    const idx = this.pipelineEvents.indexOf(ev);
    if (idx >= 0) this.pipelineEvents.splice(idx, 1);
    this.time.delayedCall(240, () => ev.destroy());
  }

  private activateSlow(player: DuelPlayer): void {
    player.score.recordPowerUpUsed();
    this.speedMultiplier = 0.45;
    const token = ++this.slowToken;
    this.showBanner(`${player.id} COFFEE BREAK`, player.colorCss);
    this.time.delayedCall(4500, () => {
      if (token === this.slowToken) this.speedMultiplier = 1;
    });
  }

  private activateClear(player: DuelPlayer): void {
    player.score.recordPowerUpUsed();
    this.showBanner(`${player.id} HOTFIX STEAL`, player.colorCss);
    const criticals = this.pipelineEvents.filter((ev) => !ev.handled && ev.def.critical);
    for (const ev of criticals) this.resolveSuccess(player, ev);
  }

  private showBanner(text: string, color: string): void {
    const banner = this.add
      .text(GAME_WIDTH / 2, Layout.hudHeight + 20, text, {
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
      duration: 1300,
      ease: 'Cubic.easeOut',
      onComplete: () => banner.destroy()
    });
  }

  private updateHud(): void {
    this.updatePlayerHud(this.p1);
    this.updatePlayerHud(this.p2);
    const t = Math.ceil(this.p1.score.state.timeLeft);
    const mm = Math.floor(t / 60);
    const ss = t % 60;
    this.timerText.setText(`${mm}:${ss.toString().padStart(2, '0')}`);
    this.timerText.setColor(t <= 20 ? CssColors.orange : CssColors.cyan);
  }

  private updatePlayerHud(player: DuelPlayer): void {
    const s = player.score.state;
    player.scoreText.setText(String(s.score));
    player.comboText.setText(s.combo >= 2 ? `COMBO x${s.comboMultiplier} (${s.combo})` : '');
    player.statsText.setText(`OK ${s.eventsHandled}  MISS ${s.eventsMissed}`);
  }

  private sharedTechDebt(): number {
    return Math.max(this.p1.score.state.techDebt, this.p2.score.state.techDebt);
  }

  private togglePause(): void {
    if (this.ended) return;
    this.paused = !this.paused;
    if (this.paused) this.showPauseMenu();
    else this.hidePauseMenu();
  }

  private handleGamepadButton(button: GamepadButtonName): void {
    if (this.ended) {
      if (button === 'A' || button === 'START') this.restart();
      else if (button === 'B') this.quitToMenu();
      return;
    }
    if (!this.paused) return;
    if (button === 'A') this.restart();
    else if (button === 'B') this.quitToMenu();
  }

  private showPauseMenu(): void {
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Colors.bg, 0.82).setOrigin(0, 0);
    const title = this.add.text(GAME_WIDTH / 2, 205, 'DUEL PAUSED', titleStyle(54)).setOrigin(0.5);
    const lines = [
      '(Menu)   Resume',
      '(A)      Rematch',
      '(B)      Back to menu'
    ];
    const texts = lines.map((line, i) =>
      this.add.text(GAME_WIDTH / 2, 306 + i * 44, line, bodyStyle(24, CssColors.text)).setOrigin(0.5)
    );
    this.pauseGroup = this.add.container(0, 0, [overlay, title, ...texts]).setDepth(220);
  }

  private hidePauseMenu(): void {
    this.pauseGroup?.destroy();
    this.pauseGroup = undefined;
  }

  private endDuel(): void {
    if (this.ended) return;
    this.ended = true;
    this.p1GamepadCtl.setEnabled(false);
    this.p2GamepadCtl.setEnabled(false);

    const p1Score = this.p1.score.state.score;
    const p2Score = this.p2.score.state.score;
    const winner =
      p1Score === p2Score ? 'DRAW' : p1Score > p2Score ? 'P1 WINS' : 'P2 WINS';
    const winnerColor = p1Score === p2Score ? CssColors.yellow : p1Score > p2Score ? this.p1.colorCss : this.p2.colorCss;

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Colors.bg, 0.9).setOrigin(0, 0);
    const title = this.add.text(GAME_WIDTH / 2, 72, winner, titleStyle(58)).setOrigin(0.5);
    title.setColor(winnerColor);
    const gap = Math.abs(p1Score - p2Score);
    const subtitle = this.add
      .text(GAME_WIDTH / 2, 124, p1Score === p2Score ? 'Perfect tie on the pipeline' : `${gap} point gap`, bodyStyle(18, CssColors.textDim))
      .setOrigin(0.5);

    const winnerId = p1Score === p2Score ? null : p1Score > p2Score ? 'P1' : 'P2';
    const p1Card = this.renderDuelResultCard(this.p1, GAME_WIDTH / 2 - 225, 336, winnerId === 'P1', winnerId === null);
    const p2Card = this.renderDuelResultCard(this.p2, GAME_WIDTH / 2 + 225, 336, winnerId === 'P2', winnerId === null);
    const commands = [
      this.add
        .text(GAME_WIDTH / 2, 568, '(A)  REMATCH', bodyStyle(20, CssColors.green))
        .setOrigin(0.5),
      this.add
        .text(GAME_WIDTH / 2, 602, '(B)  MENU', bodyStyle(18, CssColors.cyan))
        .setOrigin(0.5)
    ];
    this.add.container(0, 0, [overlay, title, subtitle, ...p1Card, ...p2Card, ...commands]).setDepth(240);
    this.p1GamepadCtl.setEnabled(true);
    this.p2GamepadCtl.setEnabled(true);
  }

  private renderDuelResultCard(
    player: DuelPlayer,
    x: number,
    y: number,
    winner: boolean,
    draw: boolean
  ): Phaser.GameObjects.GameObject[] {
    const s = player.score.state;
    const card = panel(this, x, y, 400, 340, winner || draw ? player.color : Colors.panelLight);
    card.setFillStyle(winner ? Colors.panelLight : Colors.panel, winner ? 1 : 0.94);
    card.setStrokeStyle(winner || draw ? 4 : 2, winner || draw ? player.color : Colors.panelLight, winner || draw ? 1 : 0.75);

    const tag = this.add
      .text(x - 174, y - 142, player.label, {
        ...bodyStyle(15, player.colorCss),
        fontStyle: 'bold'
      })
      .setOrigin(0, 0);
    const result = this.add
      .text(x + 174, y - 142, winner ? 'WINNER' : draw ? 'DRAW' : 'RUNNER-UP', bodyStyle(13, winner ? CssColors.green : draw ? CssColors.yellow : CssColors.textDim))
      .setOrigin(1, 0);
    const score = this.add
      .text(x, y - 112, String(s.score), {
        fontFamily: 'Consolas, monospace',
        fontSize: '46px',
        color: CssColors.white,
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0);

    const metrics = [
      ['Handled', s.eventsHandled],
      ['Best combo', s.bestCombo],
      ['Mistakes', s.wrongActions],
      ['Dangerous', s.dangerousActions],
      ['Features', s.featuresShipped],
      ['Incidents', s.majorIncidents],
      ['Steals', player.duelStats.steals],
      ['Stolen', player.duelStats.stolen],
      ['Power-ups', s.powerUpsUsed]
    ] as const;

    const metricObjects = metrics.flatMap(([label, value], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const mx = x - 158 + col * 116;
      const my = y - 24 + row * 64;
      const labelText = this.add.text(mx, my, label.toUpperCase(), bodyStyle(10, CssColors.textDim)).setOrigin(0, 0);
      const valueText = this.add
        .text(mx, my + 16, String(value), {
          ...bodyStyle(24, col === 0 ? player.colorCss : CssColors.text),
          fontStyle: 'bold'
        })
        .setOrigin(0, 0);
      return [labelText, valueText];
    });

    const footerText = s.criticalMisses > 0
      ? `${s.criticalMisses} critical miss${s.criticalMisses > 1 ? 'es' : ''}`
      : winner
        ? 'Pipeline pressure handled'
        : 'Ready for the rematch';
    const footer = this.add
      .text(x, y + 150, footerText, bodyStyle(13, winner ? CssColors.green : CssColors.textDim))
      .setOrigin(0.5, 0);

    return [card, tag, result, score, ...metricObjects, footer];
  }

  private restart(): void {
    this.cleanup();
    this.scene.restart({ sound: this.soundMgr, p1Color: this.p1Color, p2Color: this.p2Color });
  }

  private quitToMenu(): void {
    this.cleanup();
    this.scene.start(SceneKeys.Menu, { sound: this.soundMgr });
  }

  private cleanup(): void {
    this.soundMgr.stopMusic();
    this.p1GamepadCtl?.destroy();
    this.p2GamepadCtl?.destroy();
    for (const ev of this.pipelineEvents) ev.destroy();
    this.pipelineEvents = [];
    this.pauseGroup?.destroy();
    this.pauseGroup = undefined;
  }
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
