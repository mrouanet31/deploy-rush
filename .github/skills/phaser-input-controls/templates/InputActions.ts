export type Action = 'left' | 'right' | 'up' | 'down' | 'primary' | 'pause';

export class InputActions {
  private keys: Record<Action, Phaser.Input.Keyboard.Key>;
  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      primary: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };
  }
  pressed(action: Action) { return this.keys[action].isDown; }
  justPressed(action: Action) { return Phaser.Input.Keyboard.JustDown(this.keys[action]); }
}
