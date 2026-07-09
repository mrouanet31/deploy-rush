/**
 * OptionsScene — toggles persistent settings (sound, reduced motion) with
 * keyboard or gamepad. Up/Down to move, Enter/Space/A to toggle, Esc/B back.
 */
import Phaser from 'phaser';
import {
  Colors,
  CssColors,
  GAME_HEIGHT,
  GAME_WIDTH,
  KeyboardLayoutLabels,
  KeyboardLayouts,
  PlayerInputDeviceLabels,
  SceneKeys
} from '../constants';
import { SettingsService, type Settings } from '../systems/SettingsService';
import { GamepadController } from '../systems/GamepadController';
import { InputDeviceService } from '../systems/InputDeviceService';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, pulseHint, titleStyle } from '../ui';
import type { KeyboardLayout } from '../types';

type ToggleKey = 'sound' | 'music' | 'reducedMotion';

interface ToggleRow {
  kind: 'toggle';
  key: ToggleKey;
  label: string;
  desc: string;
}

interface ChoiceRow {
  kind: 'choice';
  key: 'keyboardLayout' | 'playerInputDevice';
  label: string;
  desc: string;
}

type Row = ToggleRow | ChoiceRow;

const ROWS: Row[] = [
  { kind: 'toggle', key: 'sound', label: 'Sound', desc: 'Synthetic sound effects.' },
  { kind: 'toggle', key: 'music', label: 'Music', desc: 'Procedural background music.' },
  { kind: 'toggle', key: 'reducedMotion', label: 'Reduced Motion', desc: 'Disable screen shake and full-screen flashes.' },
  { kind: 'choice', key: 'playerInputDevice', label: 'P1 Input', desc: 'Auto: gamepad when connected, keyboard otherwise.' },
  { kind: 'choice', key: 'keyboardLayout', label: 'Keyboard Layout', desc: 'Action-key positions for QWERTY or AZERTY keyboards.' }
];

export class OptionsScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private settings!: Settings;
  private index = 0;
  private valueTexts: Phaser.GameObjects.Text[] = [];
  private panels: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super(SceneKeys.Options);
  }

  init(data: { sound?: SoundManager }): void {
    this.soundMgr = data.sound ?? new SoundManager();
    this.settings = SettingsService.load();
    this.index = 0;
    this.valueTexts = [];
    this.panels = [];
  }

  create(): void {
    createBackdrop(this);
    this.add.text(GAME_WIDTH / 2, 100, 'OPTIONS', titleStyle(48)).setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 148, '\u2191/\u2193 or D-pad choose \u00B7 ENTER/SPACE/(A) change \u00B7 ESC/(B) back', bodyStyle(16, CssColors.textDim))
      .setOrigin(0.5);

    ROWS.forEach((row, i) => {
      const y = 218 + i * 82;
      const bg = panel(this, GAME_WIDTH / 2, y, 620, 72);
      this.panels.push(bg);
      this.add.text(GAME_WIDTH / 2 - 285, y - 18, row.label, bodyStyle(24, CssColors.white)).setOrigin(0, 0);
      this.add.text(GAME_WIDTH / 2 - 285, y + 14, row.desc, bodyStyle(14, CssColors.textDim)).setOrigin(0, 0);
      const value = this.add
        .text(GAME_WIDTH / 2 + 285, y, '', bodyStyle(24, CssColors.cyan))
        .setOrigin(1, 0.5);
      this.valueTexts.push(value);
    });

    pulseHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Press ESC to go back', CssColors.cyan);
    this.refresh();
    this.bindKeys();
    this.bindGamepad();
  }

  update(): void {
    this.refresh();
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-ENTER', () => this.toggle());
    kb.on('keydown-SPACE', () => this.toggle());
    kb.on('keydown-ESC', () => this.backToMenu());
  }

  private bindGamepad(): void {
    new GamepadController(this, {
      onNav: (i) => {
        if (i === 'UP') this.move(-1);
        else if (i === 'DOWN') this.move(1);
      },
      onConfirm: () => this.toggle(),
      onBack: () => this.backToMenu()
    });
  }

  private backToMenu(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Menu, { sound: this.soundMgr });
  }

  private move(delta: number): void {
    this.index = Phaser.Math.Wrap(this.index + delta, 0, ROWS.length);
    this.soundMgr.move();
    this.refresh();
  }

  private toggle(): void {
    const row = ROWS[this.index];
    if (row.kind === 'toggle') {
      this.settings = SettingsService.update({ [row.key]: !this.settings[row.key] });
      if (row.key === 'sound') this.soundMgr.setEnabled(this.settings.sound);
      if (row.key === 'music') this.soundMgr.setMusicEnabled(this.settings.music);
    } else {
      if (row.key === 'keyboardLayout') {
        this.settings = SettingsService.update({ keyboardLayout: nextKeyboardLayout(this.settings.keyboardLayout) });
      } else {
        this.soundMgr.move();
      }
    }
    this.soundMgr.select();
    this.refresh();
  }

  private refresh(): void {
    ROWS.forEach((row, i) => {
      if (row.kind === 'toggle') {
        const on = this.settings[row.key];
        this.valueTexts[i].setText(on ? 'ON' : 'OFF');
        this.valueTexts[i].setColor(on ? CssColors.green : CssColors.textDim);
      } else {
        this.valueTexts[i].setText(row.key === 'keyboardLayout'
          ? KeyboardLayoutLabels[this.settings.keyboardLayout]
          : PlayerInputDeviceLabels[InputDeviceService.effectivePlayerInputDevice(this.settings, this)]);
        this.valueTexts[i].setColor(CssColors.cyan);
      }
      const selected = i === this.index;
      this.panels[i].setStrokeStyle(selected ? 3 : 2, selected ? Colors.green : Colors.panelLight, selected ? 1 : 0.7);
    });
  }
}

function nextKeyboardLayout(current: KeyboardLayout): KeyboardLayout {
  const index = KeyboardLayouts.indexOf(current);
  return KeyboardLayouts[(index + 1) % KeyboardLayouts.length];
}
