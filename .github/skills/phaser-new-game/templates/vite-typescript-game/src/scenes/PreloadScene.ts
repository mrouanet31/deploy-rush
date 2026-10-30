import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    // Load shared assets here. Keep keys stable and documented.
    // this.load.image('player', '/assets/player.png');
  }

  create() {
    this.scene.start('GameScene');
  }
}
