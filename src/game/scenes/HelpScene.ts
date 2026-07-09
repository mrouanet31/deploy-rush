/**
 * HelpScene — explains the game, controls, event types and objectives.
 * ESC / Enter or gamepad A / B returns to the menu.
 */
import Phaser from 'phaser';
import {
  ActionKeysByLayout,
  Colors,
  CssColors,
  GAME_HEIGHT,
  GAME_WIDTH,
  SceneKeys
} from '../constants';
import { EVENT_DEFINITIONS, ALL_EVENT_TYPES } from '../data/eventDefinitions';
import { GamepadController } from '../systems/GamepadController';
import { InputDeviceService } from '../systems/InputDeviceService';
import { SettingsService } from '../systems/SettingsService';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, pulseHint, titleStyle } from '../ui';
import type { PlayerAction } from '../types';

export class HelpScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private keyboardActionKeys!: Record<PlayerAction, string>;
  private cardActionLabels!: Record<PlayerAction, string>;

  constructor() {
    super(SceneKeys.Help);
  }

  init(data: { sound?: SoundManager }): void {
    this.soundMgr = data.sound ?? new SoundManager();
    const settings = SettingsService.load();
    this.keyboardActionKeys = ActionKeysByLayout[settings.keyboardLayout];
    this.cardActionLabels = InputDeviceService.actionLabels(settings, this);
  }

  create(): void {
    createBackdrop(this);

    this.add
      .text(GAME_WIDTH / 2, 44, 'HOW TO PLAY', titleStyle(40))
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        88,
        'You are a Release Engineer. Intercept events in the pipeline and apply the right action before they scroll off-screen.',
        { ...bodyStyle(16, CssColors.textDim), align: 'center', wordWrap: { width: 900 } }
      )
      .setOrigin(0.5, 0);

    this.renderControls(30, 128, 464, 460);
    this.renderEvents(522, 128, 472, 460);

    pulseHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 34, 'Press ENTER / ESC / (A) / (B) to go back', CssColors.cyan);

    const back = () => {
      this.soundMgr.select();
      this.scene.start(SceneKeys.Menu, { sound: this.soundMgr });
    };
    this.input.keyboard?.on('keydown-ESC', back);
    this.input.keyboard?.on('keydown-ENTER', back);
    new GamepadController(this, { onConfirm: back, onBack: back });
  }

  private renderControls(x: number, y: number, w: number, h: number): void {
    panel(this, x + w / 2, y + h / 2, w, h, Colors.cyan);

    const left = x + 18;
    const keyX = left;
    const actionX = x + 134;
    const padX = x + w - 18;
    const titleY = y + 14;
    const headerY = y + 47;
    const rowStart = y + 70;
    const rowH = 21;

    this.add.text(left, titleY, 'CONTROLS', bodyStyle(19, CssColors.yellow)).setStroke('#0b1020', 4);
    this.add.text(keyX, headerY, 'KEY', bodyStyle(11, CssColors.textDim)).setOrigin(0, 0);
    this.add.text(actionX, headerY, 'ACTION', bodyStyle(11, CssColors.textDim)).setOrigin(0, 0);
    this.add.text(padX, headerY, 'PAD', bodyStyle(11, CssColors.textDim)).setOrigin(1, 0);

    const lines: Array<[string, string, string]> = [
      ['\u2191 / \u2193', 'Change lane', 'D-pad / LS'],
      ['\u2190 / \u2192', 'Dodge horizontally', 'D-pad / LS'],
      [`${this.keyboardActionKeys.ANALYZE}`, 'Analyze', 'LB'],
      [`${this.keyboardActionKeys.FIX}`, 'Fix', 'X'],
      [`${this.keyboardActionKeys.TEST}`, 'Test', 'Y'],
      [`${this.keyboardActionKeys.ROLLBACK}`, 'Rollback', 'LT'],
      [`${this.keyboardActionKeys.DEPLOY}`, 'Deploy', 'RB'],
      [`${this.keyboardActionKeys.BLOCK}`, 'Block', 'B'],
      ['SPACE', 'Quick contextual action', 'A'],
      ['ENTER', 'Confirm in menus', 'A'],
      ['ESC / P', 'Pause', 'Menu']
    ];
    lines.forEach(([key, label, pad], i) => {
      const ly = rowStart + i * rowH;
      this.add.text(keyX, ly, `[${key}]`, bodyStyle(14, CssColors.cyan)).setOrigin(0, 0);
      this.add.text(actionX, ly, label, bodyStyle(14, CssColors.text)).setOrigin(0, 0);
      this.add.text(padX, ly, `(${pad})`, bodyStyle(14, CssColors.purple)).setOrigin(1, 0);
    });

    const oy = rowStart + lines.length * rowH + 18;
    this.add.text(left, oy, 'OBJECTIVES', bodyStyle(19, CssColors.yellow)).setStroke('#0b1020', 4);
    const goals = [
      'Maximize score before time runs out',
      'Keep BUILD and PROD gauges above 0',
      'Keep tech debt low, chain combos',
      'Never Deploy without Testing first',
      'Duel: P1 pad 1 vs P2 pad 2'
    ];
    goals.forEach((g, i) => {
      this.add
        .text(left, oy + 30 + i * 21, `\u2022 ${g}`, bodyStyle(14, CssColors.text))
        .setOrigin(0, 0);
    });
  }

  private renderEvents(x: number, y: number, w: number, h: number): void {
    panel(this, x + w / 2, y + h / 2, w, h, Colors.purple);

    const left = x + 18;
    const keysX = x + w - 18;
    this.add.text(left, y + 14, 'EVENTS', bodyStyle(19, CssColors.yellow)).setStroke('#0b1020', 4);
    this.add.text(left, y + 47, 'CARD', bodyStyle(11, CssColors.textDim)).setOrigin(0, 0);
    this.add.text(keysX, y + 47, 'KEYS / POINTS', bodyStyle(11, CssColors.textDim)).setOrigin(1, 0);

    const regular = ALL_EVENT_TYPES.filter((t) => !EVENT_DEFINITIONS[t].powerUp);
    const rowH = 22;
    regular.forEach((type, i) => {
      const def = EVENT_DEFINITIONS[type];
      const ly = y + 70 + i * rowH;
      const css = '#' + def.color.toString(16).padStart(6, '0');
      this.add.text(left, ly, def.icon, bodyStyle(14, css)).setOrigin(0, 0);
      this.add.text(left + 24, ly, def.label, bodyStyle(13, CssColors.text)).setOrigin(0, 0);
      const keys = def.sequence.map((a) => `[${this.cardActionLabels[a]}]`).join(' ');
      const alt = def.altFirstActions
        ? '/' + def.altFirstActions.map((a) => this.cardActionLabels[a]).join('')
        : '';
      this.add
        .text(keysX, ly, `${keys}${alt}  +${def.basePoints}`, bodyStyle(13, css))
        .setOrigin(1, 0);
    });

    // Power-ups section.
    const py = y + 70 + regular.length * rowH + 12;
    this.add.text(left, py, 'POWER-UPS', bodyStyle(18, CssColors.purple)).setStroke('#0b1020', 4);
    const powerUps = ALL_EVENT_TYPES.filter((t) => EVENT_DEFINITIONS[t].powerUp);
    powerUps.forEach((type, i) => {
      const def = EVENT_DEFINITIONS[type];
      const ly = py + 26 + i * 30;
      const css = '#' + def.color.toString(16).padStart(6, '0');
      const effect =
        def.powerUp === 'SLOW' ? 'slows the conveyor' : 'auto-resolves criticals';
      this.add.text(left, ly, def.icon, bodyStyle(15, css)).setOrigin(0, 0);
      this.add.text(left + 24, ly, def.label, bodyStyle(13, CssColors.text)).setOrigin(0, 0);
      this.add.text(left + 148, ly, '[SPACE] / (A)', bodyStyle(13, css)).setOrigin(0, 0);
      this.add.text(left + 260, ly, effect, bodyStyle(12, CssColors.textDim)).setOrigin(0, 0);
    });
  }
}
