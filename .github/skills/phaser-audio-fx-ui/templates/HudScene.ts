import Phaser from 'phaser';

export class HudScene extends Phaser.Scene {
  private scoreText?: Phaser.GameObjects.Text;
  constructor() { super('HudScene'); }
  create() {
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: 'monospace', fontSize: '24px' }).setScrollFactor(0);
  }
  setScore(score: number) { this.scoreText?.setText(`Score: ${score}`); }
}
