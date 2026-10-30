import Phaser from 'phaser';

export abstract class BaseScene extends Phaser.Scene {
  protected readonly disposers: Array<() => void> = [];

  protected disposeOnShutdown(fn: () => void) { this.disposers.push(fn); }

  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const dispose of this.disposers.splice(0)) dispose();
    });
  }
}
