/**
 * GamepadController — maps an Xbox-style controller to the same high-level
 * events the keyboard uses, for both gameplay and menu navigation.
 *
 * Buttons (Phaser standard mapping / Xbox):
 *   A(0)  confirm / contextual action        B(1)  back / Block
 *   X(2)  Fix                                 Y(3)  Test
 *   LB(4) Analyze                             RB(5) Deploy
 *   LT(6) Rollback                            RT(7) Deploy
 *   View(8) back        Menu(9) pause / start
 *   D-pad(12-15) navigate / dodge   Left stick navigate / dodge
 *
 * Every handler is optional; each scene wires only what it needs. Pass a
 * `padIndex` option to bind a player to one physical controller. Without it,
 * buttons from any pad are accepted and stick polling uses the first pad.
 * The controller auto-detaches on scene shutdown/destroy.
 */
import Phaser from 'phaser';
import { InputDeviceService } from './InputDeviceService';
import type { NavIntent } from './InputController';
import type { PlayerAction } from '../types';

export type GamepadButtonName =
  | 'A'
  | 'B'
  | 'X'
  | 'Y'
  | 'LB'
  | 'RB'
  | 'LT'
  | 'RT'
  | 'VIEW'
  | 'START'
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT';

export interface GamepadHandlers {
  onNav?: (intent: NavIntent) => void;
  onAction?: (action: PlayerAction) => void;
  onPause?: () => void;
  onConfirm?: () => void;
  onBack?: () => void;
  onButton?: (name: GamepadButtonName) => void;
}

export interface GamepadControllerOptions {
  /** Browser gamepad index: 0 = first connected pad, 1 = second, etc. */
  padIndex?: number;
  /** Logical connected-pad slot: 0 = first connected pad, 1 = second connected pad. */
  padSlot?: number;
}

const STICK_THRESHOLD = 0.5;
const STICK_RELEASE = 0.3;
const STICK_REPEAT_MS = 220;

export class GamepadController {
  private enabled = true;
  private lastVert = 0;
  private lastHoriz = 0;
  private vertArmed = true;
  private horizArmed = true;
  private destroyed = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly handlers: GamepadHandlers,
    private readonly options: GamepadControllerOptions = {}
  ) {
    const gamepad = scene.input.gamepad;
    if (!gamepad) return;
    gamepad.on('down', this.onDown, this);
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.pollSticks, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    scene.events.once(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  private onDown(pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button): void {
    if (!this.enabled) return;
    if (!this.acceptsPad(pad)) return;
    const h = this.handlers;
    switch (button.index) {
      case 0:
        h.onConfirm?.();
        h.onAction?.('CONTEXT');
        h.onButton?.('A');
        break;
      case 1:
        h.onBack?.();
        h.onAction?.('BLOCK');
        h.onButton?.('B');
        break;
      case 2:
        h.onAction?.('FIX');
        h.onButton?.('X');
        break;
      case 3:
        h.onAction?.('TEST');
        h.onButton?.('Y');
        break;
      case 4:
        h.onAction?.('ANALYZE');
        h.onButton?.('LB');
        break;
      case 5:
        h.onAction?.('DEPLOY');
        h.onButton?.('RB');
        break;
      case 6:
        h.onAction?.('ROLLBACK');
        h.onButton?.('LT');
        break;
      case 7:
        h.onAction?.('DEPLOY');
        h.onButton?.('RT');
        break;
      case 8:
        h.onButton?.('VIEW');
        break;
      case 9:
        h.onPause?.();
        h.onButton?.('START');
        break;
      case 12:
        h.onButton?.('UP');
        break;
      case 13:
        h.onButton?.('DOWN');
        break;
      case 14:
        h.onButton?.('LEFT');
        break;
      case 15:
        h.onButton?.('RIGHT');
        break;
    }
  }

  /** Left-stick navigation with an initial step + slow auto-repeat. */
  private pollSticks(): void {
    if (!this.enabled || !this.handlers.onNav) return;
    const pad = this.activePad();
    if (!pad) return;

    const now = this.scene.time.now;
    const stickX = pad.leftStick?.x ?? 0;
    const stickY = pad.leftStick?.y ?? 0;
    const x = pad.left ? -1 : pad.right ? 1 : stickX;
    const y = pad.up ? -1 : pad.down ? 1 : stickY;

    if (Math.abs(y) < STICK_RELEASE) this.vertArmed = true;
    if (Math.abs(y) > STICK_THRESHOLD && (this.vertArmed || now - this.lastVert > STICK_REPEAT_MS)) {
      this.handlers.onNav(y < 0 ? 'UP' : 'DOWN');
      this.lastVert = now;
      this.vertArmed = false;
    }

    if (Math.abs(x) < STICK_RELEASE) this.horizArmed = true;
    if (Math.abs(x) > STICK_THRESHOLD && (this.horizArmed || now - this.lastHoriz > STICK_REPEAT_MS)) {
      this.handlers.onNav(x < 0 ? 'LEFT' : 'RIGHT');
      this.lastHoriz = now;
      this.horizArmed = false;
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.enabled = false;
    this.scene.input.gamepad?.off('down', this.onDown, this);
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.pollSticks, this);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.scene.events.off(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }

  private acceptsPad(pad: Phaser.Input.Gamepad.Gamepad): boolean {
    if (this.options.padIndex !== undefined) return pad.index === this.options.padIndex;
    if (this.options.padSlot !== undefined) {
      return InputDeviceService.getLogicalGamepad(this.scene, this.options.padSlot)?.index === pad.index;
    }
    return InputDeviceService.connectedGamepads(this.scene)[0]?.index === pad.index;
  }

  private activePad(): Phaser.Input.Gamepad.Gamepad | null {
    const gamepad = this.scene.input.gamepad;
    if (!gamepad) return null;
    if (this.options.padIndex !== undefined) {
      return gamepad.getPad(this.options.padIndex) ?? null;
    }
    if (this.options.padSlot !== undefined) {
      return InputDeviceService.getLogicalGamepad(this.scene, this.options.padSlot);
    }
    return InputDeviceService.connectedGamepads(this.scene)[0] ?? null;
  }
}
