import Phaser from 'phaser';

export class ExampleScenePlugin extends Phaser.Plugins.ScenePlugin {
  boot() {
    const events = this.systems.events;
    events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    events.once(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }
  shutdown() {}
  destroy() { this.pluginManager = null as any; }
}
