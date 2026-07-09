/**
 * InputController — maps physical keys to game-level PlayerAction events
 * and exposes navigation intents (lane up/down, dodge, pause, confirm).
 *
 * Uses Phaser's keyboard with `emitOnRepeat = false` semantics by
 * listening to keydown events once per press.
 */
import Phaser from 'phaser';
import { ActionKeyCodesByLayout } from '../constants';
import type { KeyboardLayout, PlayerAction } from '../types';

export type NavIntent = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface InputHandlers {
  onAction: (action: PlayerAction) => void;
  onNav: (intent: NavIntent) => void;
  onPause: () => void;
}

const NAV_KEYMAP: Record<string, NavIntent> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT'
};

export class InputController {
  private readonly keydown: (event: KeyboardEvent) => void;
  private enabled = true;

  constructor(
    private readonly scene: Phaser.Scene,
    handlers: InputHandlers,
    keyboardLayout: KeyboardLayout = 'qwerty'
  ) {
    const actionKeymap = ActionKeyCodesByLayout[keyboardLayout];

    this.keydown = (event: KeyboardEvent) => {
      if (!this.enabled) return;
      // Ignore auto-repeat to keep one action per physical press.
      if (event.repeat) return;

      const code = event.code;

      if (code === 'Escape' || code === 'KeyP') {
        handlers.onPause();
        event.preventDefault();
        return;
      }

      const nav = NAV_KEYMAP[code];
      if (nav) {
        handlers.onNav(nav);
        event.preventDefault();
        return;
      }

      const action = actionKeymap[code];
      if (action) {
        handlers.onAction(action);
        event.preventDefault();
      }
    };

    this.scene.input.keyboard?.on('keydown', this.keydown);
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown', this.keydown);
  }
}
