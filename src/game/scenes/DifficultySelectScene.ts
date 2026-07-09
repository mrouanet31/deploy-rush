/**
 * DifficultySelectScene — keyboard/gamepad choice of difficulty tier plus a
 * seeded Daily Challenge. Up/Down to move, Enter/A to start, Esc/B to go back.
 */
import Phaser from 'phaser';
import { Colors, CssColors, GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants';
import { DIFFICULTY_PROFILES } from '../data/difficultyProfiles';
import { DEFAULT_RUN_MODIFIER, RUN_MODIFIER_IDS, RUN_MODIFIERS } from '../data/runModifiers';
import { GamepadController } from '../systems/GamepadController';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, pulseHint, titleStyle } from '../ui';
import type { DifficultyId, RunModifierId } from '../types';

interface Option {
  id: DifficultyId | 'versus';
  daily?: boolean;
  label: string;
  desc: string;
}

const OPTIONS: Option[] = [
  { id: 'training', daily: false, label: 'Training Shift', desc: '60s guided run. Learn the hotkeys safely.' },
  { id: 'versus', label: 'Local Duel', desc: 'P1 pad 1 vs P2 pad 2. Same pipeline, highest score wins.' },
  { id: 'normal', daily: false, label: 'Normal', desc: 'Relaxed pacing. Learn the pipeline.' },
  { id: 'hard', daily: false, label: 'Hard', desc: 'Faster events, more sequences.' },
  { id: 'conference', daily: false, label: 'Conference', desc: 'Punchy booth mode. The default rush.' },
  { id: 'conference', daily: true, label: 'Daily Challenge', desc: 'Same event sequence for everyone today.' }
];

const ROW_START_Y = 210;
const ROW_STEP = 68;
const ROW_WIDTH = 620;
const ROW_HEIGHT = 62;
const ROW_TEXT_LEFT = -290;
const ROW_META_RIGHT = 290;

export class DifficultySelectScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private index = 4;
  private modifierIndex = 0;
  private rows: Phaser.GameObjects.Container[] = [];
  private modifierPanel!: Phaser.GameObjects.Rectangle;
  private modifierLabel!: Phaser.GameObjects.Text;
  private modifierDesc!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.DifficultySelect);
  }

  init(data: { sound?: SoundManager }): void {
    this.soundMgr = data.sound ?? new SoundManager();
    this.index = 4;
    this.modifierIndex = RUN_MODIFIER_IDS.indexOf(DEFAULT_RUN_MODIFIER);
    this.rows = [];
  }

  create(): void {
    createBackdrop(this);
    this.add.text(GAME_WIDTH / 2, 76, 'SELECT MODE', titleStyle(46)).setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 120, '\u2191/\u2193 choose \u00B7 \u2190/\u2192 modifier \u00B7 ENTER/(A) start \u00B7 ESC/(B) back', bodyStyle(15, CssColors.textDim))
      .setOrigin(0.5);

    this.renderModifierControl();

    OPTIONS.forEach((opt, i) => {
      const y = ROW_START_Y + i * ROW_STEP;
      const bg = panel(this, 0, 0, ROW_WIDTH, ROW_HEIGHT);
      const metaText = opt.id === 'versus'
        ? '2P'
        : formatDuration(DIFFICULTY_PROFILES[opt.id].matchDuration);
      const label = this.add
        .text(ROW_TEXT_LEFT, -20, opt.label, bodyStyle(22, CssColors.white))
        .setOrigin(0, 0);
      const desc = this.add
        .text(ROW_TEXT_LEFT, 8, opt.desc, bodyStyle(13, CssColors.textDim))
        .setOrigin(0, 0);
      const meta = this.add
        .text(ROW_META_RIGHT, 0, metaText, bodyStyle(20, CssColors.cyan))
        .setOrigin(1, 0.5);
      const container = this.add.container(GAME_WIDTH / 2, y, [bg, label, desc, meta]);
      this.rows.push(container);
    });

    pulseHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 24, 'Press ENTER to Start', CssColors.green);
    this.refresh();
    this.bindKeys();
    this.bindGamepad();
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-LEFT', () => this.moveModifier(-1));
    kb.on('keydown-RIGHT', () => this.moveModifier(1));
    kb.on('keydown-ENTER', () => this.start());
    kb.on('keydown-ESC', () => this.backToMenu());
  }

  private bindGamepad(): void {
    new GamepadController(this, {
      onNav: (i) => {
        if (i === 'UP') this.move(-1);
        else if (i === 'DOWN') this.move(1);
        else if (i === 'LEFT') this.moveModifier(-1);
        else if (i === 'RIGHT') this.moveModifier(1);
      },
      onConfirm: () => this.start(),
      onBack: () => this.backToMenu()
    });
  }

  private backToMenu(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Menu, { sound: this.soundMgr });
  }

  private move(delta: number): void {
    this.index = Phaser.Math.Wrap(this.index + delta, 0, OPTIONS.length);
    this.soundMgr.move();
    this.refresh();
  }

  private moveModifier(delta: number): void {
    if (!this.modifierApplies()) {
      this.soundMgr.error();
      return;
    }
    this.modifierIndex = Phaser.Math.Wrap(this.modifierIndex + delta, 0, RUN_MODIFIER_IDS.length);
    this.soundMgr.move();
    this.refresh();
  }

  private refresh(): void {
    this.rows.forEach((row, i) => {
      const bg = row.getAt(0) as Phaser.GameObjects.Rectangle;
      const selected = i === this.index;
      bg.setStrokeStyle(selected ? 3 : 2, selected ? Colors.green : Colors.panelLight, selected ? 1 : 0.7);
      bg.setFillStyle(selected ? Colors.panelLight : Colors.panel, selected ? 1 : 0.92);
      row.setScale(selected ? 1.02 : 1);
    });
    this.refreshModifierControl();
  }

  private start(): void {
    const opt = OPTIONS[this.index];
    this.soundMgr.select();
    if (opt.id === 'versus') {
      this.scene.start(SceneKeys.VersusLobby, { sound: this.soundMgr });
      return;
    }
    const daily = opt.daily ?? false;
    const modifier = this.modifierForSelectedMode();
    this.scene.start(SceneKeys.Game, { difficulty: opt.id, sound: this.soundMgr, daily, modifier });
  }

  private renderModifierControl(): void {
    this.modifierPanel = panel(this, GAME_WIDTH / 2, 154, 620, 30, Colors.cyan);
    this.modifierLabel = this.add
      .text(GAME_WIDTH / 2 - 292, 154, '', bodyStyle(14, CssColors.cyan))
      .setOrigin(0, 0.5);
    this.modifierDesc = this.add
      .text(GAME_WIDTH / 2 + 292, 154, '', bodyStyle(12, CssColors.textDim))
      .setOrigin(1, 0.5);
  }

  private refreshModifierControl(): void {
    const applies = this.modifierApplies();
    const modifier = RUN_MODIFIERS[this.selectedModifier()];
    this.modifierPanel.setStrokeStyle(2, applies ? Colors.cyan : Colors.panelLight, applies ? 0.85 : 0.55);
    this.modifierPanel.setFillStyle(Colors.panel, applies ? 0.92 : 0.7);
    this.modifierLabel.setText(applies ? `MOD  \u2190 ${modifier.label} \u2192` : 'MOD  fixed rules');
    this.modifierLabel.setColor(applies ? CssColors.cyan : CssColors.textDim);
    this.modifierDesc.setText(applies ? modifier.desc : 'Training, Daily and Duel ignore modifiers');
  }

  private modifierApplies(): boolean {
    const opt = OPTIONS[this.index];
    return opt.id !== 'training' && opt.id !== 'versus' && !opt.daily;
  }

  private selectedModifier(): RunModifierId {
    return RUN_MODIFIER_IDS[this.modifierIndex] ?? DEFAULT_RUN_MODIFIER;
  }

  private modifierForSelectedMode(): RunModifierId {
    return this.modifierApplies() ? this.selectedModifier() : DEFAULT_RUN_MODIFIER;
  }
}

function formatDuration(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}
