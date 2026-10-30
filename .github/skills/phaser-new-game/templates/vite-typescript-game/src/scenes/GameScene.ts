import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.add.text(40, 40, 'Phaser game ready', { fontFamily: 'sans-serif', fontSize: '32px' });
  }
}
