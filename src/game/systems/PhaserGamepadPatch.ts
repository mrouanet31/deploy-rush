/**
 * Phaser 3.90 can leave sparse entries in GamepadPlugin.gamepads when the
 * browser reports a pad with an index greater than 0. Scene shutdown then
 * calls removeAllListeners on every array slot without checking holes.
 */
import Phaser from 'phaser';

const PATCH_FLAG = '__deployRushSafeStopListeners';
const INPUT_UPDATE_EVENT = 'update';

interface SafeGamepadPlugin {
  target?: {
    removeEventListener?: Window['removeEventListener'];
  };
  onGamepadHandler?: EventListener;
  sceneInputPlugin?: {
    pluginEvents?: {
      off?: (event: string, fn?: (...args: unknown[]) => void) => void;
    };
  };
  update?: (...args: unknown[]) => void;
  gamepads?: Array<Phaser.Input.Gamepad.Gamepad | undefined>;
}

type SafeGamepadPluginPrototype = SafeGamepadPlugin & {
  [PATCH_FLAG]?: boolean;
  stopListeners?: () => void;
};

export function installPhaserGamepadShutdownGuard(): void {
  const pluginClass = Phaser.Input.Gamepad.GamepadPlugin as unknown as {
    prototype?: SafeGamepadPluginPrototype;
  };
  const prototype = pluginClass.prototype;
  if (!prototype || prototype[PATCH_FLAG]) return;

  prototype.stopListeners = function stopListeners(this: SafeGamepadPlugin): void {
    if (this.target?.removeEventListener && this.onGamepadHandler) {
      this.target.removeEventListener('gamepadconnected', this.onGamepadHandler);
      this.target.removeEventListener('gamepaddisconnected', this.onGamepadHandler);
    }

    this.sceneInputPlugin?.pluginEvents?.off?.(INPUT_UPDATE_EVENT, this.update);

    for (const pad of this.gamepads ?? []) {
      pad?.removeAllListeners();
    }
  };

  prototype[PATCH_FLAG] = true;
}
