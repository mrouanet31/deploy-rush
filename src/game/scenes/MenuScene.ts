/**
 * MenuScene — main menu. Keyboard/gamepad navigation:
 *   Up/Down or D-pad/left stick moves, Enter/A confirms.
 */
import Phaser from 'phaser';
import {
  Colors,
  CssColors,
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
      const loopX = 812;
      if (card.container.x < 266) {
        card.container.x = loopX + Phaser.Math.Between(0, 180);
        card.container.y = card.laneY;
      }
    }
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
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, Colors.bg, 0.92)
      .setOrigin(0, 0);
    objects.push(scrim);

    objects.push(
      this.add
        .text(GAME_WIDTH / 2, 68, 'DEPLOY RUSH', titleStyle(54))
        .setOrigin(0.5)
        .setStroke('#0b1020', 8)
    );
    objects.push(
      this.add
        .text(GAME_WIDTH / 2, 118, 'LIVE PIPELINE DEMO', bodyStyle(19, CssColors.cyan))
        .setOrigin(0.5)
    );

    this.createDemoPipeline(objects);
    this.createAttractScores(objects, LeaderboardService.load().slice(0, 5));

    const cta = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 58, 'PRESS ENTER OR (A) TO START', {
        fontFamily: 'Consolas, monospace',
        fontSize: '27px',
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
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 26, 'Use arrows / D-pad to choose, then ENTER / (A)', bodyStyle(14, CssColors.textDim))
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
    this.attractGroup?.destroy();
    this.attractGroup = undefined;
  }

  private createDemoPipeline(objects: Phaser.GameObjects.GameObject[]): void {
    const x = 226;
    const y = 170;
    const w = 572;
    const h = 292;
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
          .text(x + 26, cy, lane, bodyStyle(13, colorToCss(LaneColors[lane])))
          .setOrigin(0, 0.5)
      );
    });

    objects.push(
      this.add
        .rectangle(x + 156, y + h / 2, 106, h - 22, Colors.cyan, 0.07)
        .setStrokeStyle(2, Colors.cyan, 0.35)
    );
    objects.push(
      this.add
        .text(x + 156, y + 18, 'ZONE', bodyStyle(12, CssColors.cyan))
        .setOrigin(0.5)
    );

    const player = this.add
      .container(x + 156, y + laneH * 2.5, [
        this.add.circle(0, 0, 24, Colors.cyan, 0.16).setStrokeStyle(2, Colors.cyan, 0.55),
        this.add.rectangle(0, 0, 34, 34, Colors.panelLight).setStrokeStyle(2, Colors.cyan),
        this.add.text(0, 28, 'YOU', bodyStyle(11, CssColors.textDim)).setOrigin(0.5)
      ]);
    objects.push(player);
    this.tweens.add({
      targets: player,
      y: y + laneH * 3.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const settings = SettingsService.load();
    const actionLabels = InputDeviceService.actionLabels(settings, this);
    const cards = [
      { label: 'Bug', key: `[${actionLabels.FIX}]`, color: Colors.orange, lane: 1, speed: 86, x: x + w - 60 },
      { label: 'Feature', key: `[${actionLabels.TEST}] [${actionLabels.DEPLOY}]`, color: Colors.green, lane: 4, speed: 72, x: x + w + 90 },
      { label: 'Sec', key: `[${actionLabels.BLOCK}]`, color: Colors.red, lane: 3, speed: 96, x: x + w + 210 },
      { label: 'Debt', key: `[${actionLabels.ANALYZE}]`, color: Colors.cyan, lane: 0, speed: 64, x: x + w + 330 }
    ];

    this.demoCards = cards.map((card) => {
      const laneY = y + laneH * (card.lane + 0.5);
      const bg = this.add.rectangle(0, 0, 82, 42, Colors.panel).setStrokeStyle(2, card.color);
      const label = this.add.text(0, -9, card.label, bodyStyle(12, CssColors.text)).setOrigin(0.5);
      const key = this.add.text(0, 10, card.key, bodyStyle(12, colorToCss(card.color))).setOrigin(0.5);
      const container = this.add.container(card.x, laneY, [bg, label, key]);
      objects.push(container);
      return { container, speed: card.speed, laneY };
    });
  }

  private createAttractScores(objects: Phaser.GameObjects.GameObject[], entries: LeaderboardEntry[]): void {
    const x = 824;
    const y = 170;
    const w = 154;
    const h = 292;
    objects.push(panel(this, x, y + h / 2, w, h, Colors.green));
    objects.push(
      this.add
        .text(x, y + 22, 'LOCAL TOP', bodyStyle(15, CssColors.yellow))
        .setOrigin(0.5)
    );

    if (entries.length === 0) {
      objects.push(
        this.add
          .text(x, y + 112, 'No scores yet.\nBe first to ship.', {
            ...bodyStyle(13, CssColors.textDim),
            align: 'center',
            wordWrap: { width: w - 28 }
          })
          .setOrigin(0.5)
      );
      return;
    }

    entries.forEach((entry, i) => {
      const rowY = y + 58 + i * 40;
      objects.push(
        this.add
          .text(x - 62, rowY, `${i + 1}`, bodyStyle(14, CssColors.yellow))
          .setOrigin(0, 0.5)
      );
      objects.push(
        this.add
          .text(x - 38, rowY - 8, truncate(entry.name, 8), bodyStyle(13, CssColors.white))
          .setOrigin(0, 0)
      );
      objects.push(
        this.add
          .text(x - 38, rowY + 8, `${entry.score}`, bodyStyle(12, CssColors.cyan))
          .setOrigin(0, 0)
      );
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
