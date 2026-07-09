import Phaser from 'phaser';
import { ActionKeysByLayout, GamepadActionLabels } from '../constants';
import type { PlayerAction, PlayerInputDevice } from '../types';
import type { Settings } from './SettingsService';

interface RefreshableGamepadPlugin extends Phaser.Input.Gamepad.GamepadPlugin {
  refreshPads?: () => void;
}

export class InputDeviceService {
  static connectedGamepads(scene?: Phaser.Scene): Phaser.Input.Gamepad.Gamepad[] {
    const plugin = scene?.input.gamepad as RefreshableGamepadPlugin | null | undefined;
    plugin?.refreshPads?.();
    return (plugin?.getAll() ?? [])
      .filter((pad) => Boolean(pad?.connected))
      .sort((a, b) => a.index - b.index);
  }

  static getLogicalGamepad(scene: Phaser.Scene, slot: number): Phaser.Input.Gamepad.Gamepad | null {
    return InputDeviceService.connectedGamepads(scene)[slot] ?? null;
  }

  static hasConnectedGamepad(scene?: Phaser.Scene): boolean {
    if (InputDeviceService.connectedGamepads(scene).length > 0) return true;
    return browserHasConnectedGamepad();
  }

  static effectivePlayerInputDevice(settings: Settings, scene?: Phaser.Scene): PlayerInputDevice {
    if (InputDeviceService.hasConnectedGamepad(scene)) return 'gamepad';
    void settings;
    return 'keyboard';
  }

  static actionLabels(settings: Settings, scene?: Phaser.Scene): Record<PlayerAction, string> {
    return InputDeviceService.effectivePlayerInputDevice(settings, scene) === 'gamepad'
      ? GamepadActionLabels
      : ActionKeysByLayout[settings.keyboardLayout];
  }
}

function browserHasConnectedGamepad(): boolean {
  const pads = navigator.getGamepads?.();
  if (!pads) return false;
  for (const pad of pads) {
    if (pad?.connected) return true;
  }
  return false;
}
