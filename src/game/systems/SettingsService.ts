/**
 * SettingsService — small persistent user preferences (sound, reduced
 * motion). Stored locally via localStorage, fails gracefully.
 */
import type { KeyboardLayout, PlayerInputDevice } from '../types';

const SETTINGS_STORAGE_KEY = 'deploy-rush.settings.v1';

export interface Settings {
  /** Master sound toggle (SFX). */
  sound: boolean;
  /** Procedural background music toggle. */
  music: boolean;
  /** Reduced motion: disables screen shake and full-screen flashes. */
  reducedMotion: boolean;
  /** Physical keyboard preset used by action keys. */
  keyboardLayout: KeyboardLayout;
  /** Solo gameplay input device for player 1. */
  playerInputDevice: PlayerInputDevice;
}

const DEFAULTS: Settings = {
  sound: true,
  music: true,
  reducedMotion: false,
  keyboardLayout: 'qwerty',
  playerInputDevice: 'keyboard'
};

export class SettingsService {
  static load(): Settings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULTS.sound,
        music: typeof parsed.music === 'boolean' ? parsed.music : DEFAULTS.music,
        reducedMotion:
          typeof parsed.reducedMotion === 'boolean'
            ? parsed.reducedMotion
            : DEFAULTS.reducedMotion,
        keyboardLayout: isKeyboardLayout(parsed.keyboardLayout)
          ? parsed.keyboardLayout
          : DEFAULTS.keyboardLayout,
        playerInputDevice: isPlayerInputDevice(parsed.playerInputDevice)
          ? parsed.playerInputDevice
          : DEFAULTS.playerInputDevice
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  static save(settings: Settings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  static update(patch: Partial<Settings>): Settings {
    const next = { ...SettingsService.load(), ...patch };
    SettingsService.save(next);
    return next;
  }
}

function isKeyboardLayout(value: unknown): value is KeyboardLayout {
  return value === 'qwerty' || value === 'azerty';
}

function isPlayerInputDevice(value: unknown): value is PlayerInputDevice {
  return value === 'keyboard' || value === 'gamepad';
}
