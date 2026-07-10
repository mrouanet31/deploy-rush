/**
 * MenuScene — main menu. Keyboard/gamepad navigation:
 *   Up/Down or D-pad/left stick moves, Enter/A confirms.
 */
import Phaser from 'phaser';
import {
  Colors,
  CssColors,
  dailySeed,
  GAME_HEIGHT,
  GAME_WIDTH,
  LANES,
  LaneColors,
  SceneKeys
} from '../constants';
import { LeaderboardService } from '../systems/LeaderboardService';
import { GamepadController } from '../systems/GamepadController';
import { InputDeviceService } from '../systems/InputDeviceService';
import { SettingsService } from '../systems/SettingsService';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, pulseHint, titleStyle } from '../ui';
import type { LeaderboardEntry } from '../types';

const ATTRACT_DELAY_MS = 12000;
const DEMO_CARD_LOOP_MIN_X = 664;
const DEMO_CARD_LOOP_MAX_X = 714;
const DEMO_CARD_RESET_X = 306;
const DEMO_TARGET_LOOKAHEAD_SECONDS = 1.45;

interface DemoCard {
  container: Phaser.GameObjects.Container;
  speed: number;
  laneY: number;
}

type MenuAction = 'start' | 'help' | 'leaderboard' | 'options' | 'sound';

interface MenuItem {
  action: MenuAction;
  label: string;
}

interface MenuRow {
  panel: Phaser.GameObjects.Rectangle;
  labelText: Phaser.GameObjects.Text;
}

const MENU_ITEMS: MenuItem[] = [
  { action: 'start', label: 'Start Shift' },
  { action: 'help', label: 'Help & Controls' },
  { action: 'leaderboard', label: 'Leaderboard' },
  { action: 'options', label: 'Options' },
  { action: 'sound', label: 'Toggle Sound' }
];

export class MenuScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private soundText!: Phaser.GameObjects.Text;
  private startHint!: Phaser.GameObjects.Text;
  private attractTimer?: Phaser.Time.TimerEvent;
  private attractGroup?: Phaser.GameObjects.Container;
  private demoCards: DemoCard[] = [];
  private demoPlayer?: Phaser.GameObjects.Container;
  private demoProcessX = 0;
  private demoIdleY = 0;
  private menuRows: MenuRow[] = [];
  private selectedIndex = 0;
  private gamepadMode = false;

  constructor() {
    super(SceneKeys.Menu);
  }

  init(data: { sound?: SoundManager }): void {
    this.soundMgr = data.sound ?? new SoundManager();
  }

  create(): void {
    createBackdrop(this);

    this.add
      .text(GAME_WIDTH / 2, 130, 'DEPLOY RUSH', titleStyle(76))
      .setOrigin(0.5)
      .setStroke('#0b1020', 8);

    this.add
      .text(GAME_WIDTH / 2, 196, 'Keep the build green. Ship fast. Don\u2019t burn prod.', {
        ...bodyStyle(22, CssColors.cyan),
        fontStyle: 'italic'
      })
      .setOrigin(0.5);

    const cx = GAME_WIDTH / 2;
    this.gamepadMode = InputDeviceService.hasConnectedGamepad(this);
    this.renderMenuRows(cx);

    this.startHint = pulseHint(this, cx, GAME_HEIGHT - 96, this.startPrompt(), CssColors.green);

    this.soundText = this.add
      .text(GAME_WIDTH - 20, GAME_HEIGHT - 24, this.soundLabel(), bodyStyle(16, CssColors.textDim))
      .setOrigin(1, 1);

    this.add
      .text(20, GAME_HEIGHT - 24, 'v1.0 \u00B7 keyboard + gamepad \u00B7 offline', bodyStyle(16, CssColors.textDim))
      .setOrigin(0, 1);

    this.bindKeys();
    this.armAttractTimer();
  }

  update(_time: number, delta: number): void {
    this.refreshInputMode();
    if (!this.attractGroup) return;
    const dt = delta / 1000;
    for (const card of this.demoCards) {
      card.container.x -= card.speed * dt;
      if (card.container.x < DEMO_CARD_RESET_X) {
        card.container.x = Phaser.Math.Between(DEMO_CARD_LOOP_MIN_X, DEMO_CARD_LOOP_MAX_X);
        card.container.y = card.laneY;
      }
    }
    this.updateDemoPlayer(dt);
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown', () => this.resetAttractTimer());
      kb.on('keydown-UP', () => this.moveSelection(-1));
      kb.on('keydown-DOWN', () => this.moveSelection(1));
      kb.on('keydown-ENTER', () => this.executeSelected());
    }

    new GamepadController(this, {
      onNav: (intent) => {
        this.resetAttractTimer();
        if (intent === 'UP') this.moveSelection(-1);
        else if (intent === 'DOWN') this.moveSelection(1);
      },
      onConfirm: () => {
        this.resetAttractTimer();
        this.executeSelected();
      },
      onButton: (b) => {
        this.resetAttractTimer();
        if (b === 'START') this.executeSelected();
      }
    });
  }

  private renderMenuRows(cx: number): void {
    this.menuRows = MENU_ITEMS.map((item, i) => {
      const y = 282 + i * 46;
      const bg = panel(this, cx, y, 390, 38);
      const labelText = this.add
        .text(cx, y, item.label, bodyStyle(22, CssColors.text))
        .setOrigin(0.5);
      return { panel: bg, labelText };
    });
    this.refreshMenuRows();
  }

  private refreshMenuRows(): void {
    MENU_ITEMS.forEach((item, i) => {
      const row = this.menuRows[i];
      const selected = i === this.selectedIndex;
      row.panel.setStrokeStyle(selected ? 3 : 2, selected ? Colors.green : Colors.panelLight, selected ? 1 : 0.55);
      row.panel.setFillStyle(selected ? Colors.panelLight : Colors.panel, selected ? 0.98 : 0.72);
      row.labelText.setText(`${selected ? '> ' : ''}${item.label}${selected ? ' <' : ''}`);
      row.labelText.setColor(selected ? CssColors.white : CssColors.text);
    });
  }

  private refreshInputMode(): void {
    const next = InputDeviceService.hasConnectedGamepad(this);
    if (next === this.gamepadMode) return;
    this.gamepadMode = next;
    this.refreshMenuRows();
    this.startHint.setText(this.startPrompt());
  }

  private startPrompt(): string {
    return this.gamepadMode ? 'D-pad / Stick to Choose · (A) Select' : '\u2191/\u2193 Choose · ENTER Select';
  }

  private moveSelection(delta: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, MENU_ITEMS.length);
    this.soundMgr.move();
    this.refreshMenuRows();
  }

  private executeSelected(): void {
    this.executeMenuAction(MENU_ITEMS[this.selectedIndex].action);
  }

  private executeMenuAction(action: MenuAction): void {
    if (action === 'start') this.startGame();
    else if (action === 'help') this.openHelp();
    else if (action === 'leaderboard') this.openLeaderboard();
    else if (action === 'options') this.openOptions();
    else this.toggleSound();
  }

  private startGame(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.DifficultySelect, { sound: this.soundMgr });
  }

  private openHelp(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Help, { sound: this.soundMgr });
  }

  private openLeaderboard(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Leaderboard, { sound: this.soundMgr, from: SceneKeys.Menu });
  }

  private openOptions(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Options, { sound: this.soundMgr });
  }

  private toggleSound(): void {
    const enabled = this.soundMgr.toggle();
    SettingsService.update({ sound: enabled });
    if (enabled) this.soundMgr.select();
    this.soundText.setText(this.soundLabel());
  }

  private armAttractTimer(): void {
    this.attractTimer?.remove(false);
    this.attractTimer = this.time.delayedCall(ATTRACT_DELAY_MS, () => this.showAttractMode());
  }

  private resetAttractTimer(): void {
    if (this.attractGroup) this.hideAttractMode();
    this.armAttractTimer();
  }

  private showAttractMode(): void {
    if (this.attractGroup) return;

    const objects: Phaser.GameObjects.GameObject[] = [];
    const scrim = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Colors.bg, 0.97)
      .setOrigin(0, 0);
    objects.push(scrim);

    this.createAttractHeader(objects);
    this.createAttractScores(objects, LeaderboardService.load().slice(0, 5));
    this.createDemoPipeline(objects);
    this.createChallengePanel(objects);

    const cta = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 58, 'PRESS ENTER OR (A) TO TAKE THE NEXT SHIFT', {
        fontFamily: 'Consolas, monospace',
        fontSize: '25px',
        color: CssColors.green,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    objects.push(cta);
    this.tweens.add({
      targets: cta,
      alpha: { from: 1, to: 0.35 },
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    objects.push(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 26, 'One run. One leaderboard. Keep prod alive.', bodyStyle(15, CssColors.textDim))
        .setOrigin(0.5)
    );

    this.attractGroup = this.add.container(0, 0, objects).setDepth(180).setAlpha(0);
    this.tweens.add({
      targets: this.attractGroup,
      alpha: 1,
      duration: 260,
      ease: 'Quad.easeOut'
    });
  }

  private hideAttractMode(): void {
    this.attractTimer?.remove(false);
    this.attractTimer = undefined;
    this.demoCards = [];
    this.demoPlayer = undefined;
    this.demoProcessX = 0;
    this.demoIdleY = 0;
    this.attractGroup?.destroy();
    this.attractGroup = undefined;
  }

  private createAttractHeader(objects: Phaser.GameObjects.GameObject[]): void {
    const title = this.add
      .text(GAME_WIDTH / 2, 46, 'DEPLOY RUSH', titleStyle(50))
      .setOrigin(0.5)
      .setStroke('#0b1020', 8);
    objects.push(title);

    objects.push(
      this.add
        .text(GAME_WIDTH / 2, 91, 'BOOTH CHALLENGE', {
          ...bodyStyle(18, CssColors.cyan),
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
    );

    const seed = dailySeed();
    const chips: Array<[string, string, string]> = [
      ['DAILY', `#${seed}`, CssColors.yellow],
      ['RUN', '3:30', CssColors.green],
      ['GOAL', 'TOP 10', CssColors.purple]
    ];
    chips.forEach(([label, value, color], i) => {
      const x = GAME_WIDTH / 2 - 188 + i * 188;
      objects.push(panel(this, x, 126, 160, 30, Colors.panelLight));
      objects.push(
        this.add
          .text(x - 62, 126, label, bodyStyle(11, CssColors.textDim))
          .setOrigin(0, 0.5)
      );
      objects.push(
        this.add
          .text(x + 62, 126, value, {
            ...bodyStyle(15, color),
            fontStyle: 'bold'
          })
          .setOrigin(1, 0.5)
      );
    });
  }

  private createDemoPipeline(objects: Phaser.GameObjects.GameObject[]): void {
    const x = 254;
    const y = 158;
    const w = 512;
    const h = 320;
    objects.push(panel(this, x + w / 2, y + h / 2, w, h, Colors.cyan));

    const laneH = h / LANES.length;
    LANES.forEach((lane, i) => {
      const cy = y + laneH * (i + 0.5);
      objects.push(
        this.add
          .rectangle(x + 10, y + i * laneH, w - 20, laneH - 2, Colors.bgAlt, i % 2 === 0 ? 0.45 : 0.24)
          .setOrigin(0, 0)
      );
      objects.push(
        this.add
          .text(x + 24, cy, lane, bodyStyle(13, colorToCss(LaneColors[lane])))
          .setOrigin(0, 0.5)
      );
    });

    objects.push(
      this.add
        .rectangle(x + 144, y + h / 2, 112, h - 22, Colors.cyan, 0.08)
        .setStrokeStyle(2, Colors.cyan, 0.35)
    );
    this.demoProcessX = x + 144;
    this.demoIdleY = y + laneH * 2.5;
    objects.push(
      this.add
        .text(x + 144, y + 18, 'PROCESS ZONE', bodyStyle(11, CssColors.cyan))
        .setOrigin(0.5)
    );

    const incidentLane = 4;
    const incidentOverlay = this.add
      .rectangle(x + 10, y + incidentLane * laneH, w - 20, laneH - 2, Colors.red, 0.02)
      .setOrigin(0, 0);
    objects.push(incidentOverlay);
    this.tweens.add({
      targets: incidentOverlay,
      alpha: { from: 0.05, to: 0.22 },
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const player = this.add
      .container(this.demoProcessX, this.demoIdleY, [
        this.add.circle(0, 0, 28, Colors.cyan, 0.18).setStrokeStyle(2, Colors.cyan, 0.62),
        this.add.rectangle(0, 0, 38, 38, Colors.panelLight).setStrokeStyle(3, Colors.cyan),
        this.add.text(0, 32, 'YOU', bodyStyle(11, CssColors.textDim)).setOrigin(0.5)
      ]);
    this.demoPlayer = player;
    objects.push(player);

    const combo = this.add
      .text(x + w - 18, y + 22, 'COMBO x4', {
        ...bodyStyle(17, CssColors.purple),
        fontStyle: 'bold'
      })
      .setOrigin(1, 0.5);
    objects.push(combo);
    this.tweens.add({
      targets: combo,
      scale: { from: 1, to: 1.08 },
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const settings = SettingsService.load();
    const actionLabels = InputDeviceService.actionLabels(settings, this);
    const cards = [
      { label: 'Bug', key: `[${actionLabels.FIX}]`, color: Colors.orange, lane: 1, speed: 98, x: x + w - 70 },
      { label: 'Feature', key: `[${actionLabels.TEST}] [${actionLabels.DEPLOY}]`, color: Colors.green, lane: 4, speed: 78, x: x + w - 206 },
      { label: 'Sec Finding', key: `[${actionLabels.BLOCK}]`, color: Colors.red, lane: 3, speed: 110, x: x + w - 322 },
      { label: 'Tech Debt', key: `[${actionLabels.ANALYZE}]`, color: Colors.cyan, lane: 0, speed: 70, x: x + w - 126 },
      { label: 'Prod Alert', key: `[${actionLabels.ROLLBACK}]`, color: Colors.red, lane: 4, speed: 118, x: x + w - 410 }
    ];

    this.demoCards = cards.map((card) => {
      const laneY = y + laneH * (card.lane + 0.5);
      const bg = this.add.rectangle(0, 0, 104, 46, Colors.panel).setStrokeStyle(2, card.color);
      const accent = this.add.rectangle(-50, 0, 5, 40, card.color, 0.95);
      const label = this.add.text(-38, -10, card.label, bodyStyle(11, CssColors.text)).setOrigin(0, 0.5);
      const key = this.add.text(38, 12, card.key, bodyStyle(11, colorToCss(card.color))).setOrigin(1, 0.5);
      const container = this.add.container(card.x, laneY, [bg, accent, label, key]);
      objects.push(container);
      return { container, speed: card.speed, laneY };
    });
  }

  private updateDemoPlayer(dt: number): void {
    if (!this.demoPlayer || this.demoCards.length === 0 || this.demoProcessX === 0) return;

    const target = this.nextDemoCardTarget();
    if (!target) {
      const idleFollow = 1 - Math.pow(0.001, dt * 0.5);
      this.demoPlayer.y = Phaser.Math.Linear(this.demoPlayer.y, this.demoIdleY, idleFollow);
      this.demoPlayer.x = Phaser.Math.Linear(this.demoPlayer.x, this.demoProcessX, idleFollow);
      return;
    }

    const eta = (target.container.x - this.demoProcessX) / target.speed;
    const urgency = 1 - Phaser.Math.Clamp(Math.max(eta, 0) / DEMO_TARGET_LOOKAHEAD_SECONDS, 0, 1);
    const follow = 1 - Math.pow(0.001, dt * Phaser.Math.Linear(3.2, 9.5, urgency));
    const catchOffset = Phaser.Math.Clamp((0.22 - eta) * 44, -6, 10);

    this.demoPlayer.y = Phaser.Math.Linear(this.demoPlayer.y, target.laneY, follow);
    this.demoPlayer.x = Phaser.Math.Linear(this.demoPlayer.x, this.demoProcessX + catchOffset, follow * 0.38);
  }

  private nextDemoCardTarget(): DemoCard | undefined {
    let target: DemoCard | undefined;
    let targetEta = Number.POSITIVE_INFINITY;

    for (const card of this.demoCards) {
      const eta = (card.container.x - this.demoProcessX) / card.speed;
      if (eta < -0.28 || eta > DEMO_TARGET_LOOKAHEAD_SECONDS) continue;
      const rank = Math.max(eta, 0);
      if (rank < targetEta) {
        target = card;
        targetEta = rank;
      }
    }

    return target;
  }

  private createAttractScores(objects: Phaser.GameObjects.GameObject[], entries: LeaderboardEntry[]): void {
    const x = 124;
    const y = 158;
    const w = 202;
    const h = 320;
    objects.push(panel(this, x, y + h / 2, w, h, Colors.green));
    objects.push(
      this.add
        .text(x, y + 24, 'LOCAL PODIUM', {
          ...bodyStyle(16, CssColors.yellow),
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
    );

    if (entries.length === 0) {
      objects.push(
        this.add
          .text(x, y + 132, 'NO SCORES YET\nBE FIRST TO SHIP', {
            ...bodyStyle(15, CssColors.textDim),
            align: 'center',
            wordWrap: { width: w - 28 }
          })
          .setOrigin(0.5)
      );
      return;
    }

    entries.forEach((entry, i) => {
      const rowY = y + 68 + i * 44;
      const topThree = i < 3;
      const medalColor = i === 0 ? CssColors.yellow : i === 1 ? CssColors.cyan : CssColors.orange;
      objects.push(
        this.add
          .rectangle(x, rowY, w - 24, topThree ? 38 : 34, topThree ? Colors.panelLight : Colors.bgAlt, topThree ? 0.92 : 0.62)
          .setStrokeStyle(topThree ? 2 : 1, topThree ? Colors.yellow : Colors.panelLight, topThree ? 0.62 : 0.36)
      );
      objects.push(
        this.add
          .text(x - 82, rowY, `${i + 1}`, {
            ...bodyStyle(topThree ? 18 : 14, medalColor),
            fontStyle: 'bold'
          })
          .setOrigin(0, 0.5)
      );
      objects.push(
        this.add
          .text(x - 52, rowY - 9, truncate(entry.name, 9), bodyStyle(13, CssColors.white))
          .setOrigin(0, 0.5)
      );
      objects.push(
        this.add
          .text(x + 78, rowY + 9, `${entry.score}`, {
            ...bodyStyle(13, CssColors.cyan),
            fontStyle: topThree ? 'bold' : ''
          })
          .setOrigin(1, 0.5)
      );
    });
  }

  private createChallengePanel(objects: Phaser.GameObjects.GameObject[]): void {
    const x = 896;
    const y = 158;
    const w = 206;
    const h = 320;
    objects.push(panel(this, x, y + h / 2, w, h, Colors.purple));
    objects.push(
      this.add
        .text(x, y + 24, 'STAND RULES', {
          ...bodyStyle(16, CssColors.purple),
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
    );

    const rules: Array<[string, string, string]> = [
      ['1', 'Catch cards', CssColors.cyan],
      ['2', 'Press shown action', CssColors.green],
      ['3', 'Build combos', CssColors.purple],
      ['4', 'Save prod', CssColors.orange]
    ];
    rules.forEach(([num, label, color], i) => {
      const rowY = y + 68 + i * 42;
      objects.push(this.add.circle(x - 74, rowY, 15, Colors.panelLight).setStrokeStyle(2, Colors.cyan, 0.5));
      objects.push(
        this.add
          .text(x - 74, rowY, num, {
            ...bodyStyle(14, color),
            fontStyle: 'bold'
          })
          .setOrigin(0.5)
      );
      objects.push(
        this.add
          .text(x - 48, rowY, label, bodyStyle(14, CssColors.text))
          .setOrigin(0, 0.5)
      );
    });

    const prize = this.add
      .text(x, y + 258, 'TOP SCORE\nTAKES THE BOARD', {
        ...bodyStyle(16, CssColors.yellow),
        align: 'center',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    objects.push(prize);
    this.tweens.add({
      targets: prize,
      alpha: { from: 0.72, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private soundLabel(): string {
    return `Sound: ${this.soundMgr.isEnabled ? 'ON' : 'OFF'}`;
  }
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
