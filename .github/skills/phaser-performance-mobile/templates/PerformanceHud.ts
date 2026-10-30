export class PerformanceHud {
  private text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, '', { fontSize: '14px', fontFamily: 'monospace' }).setDepth(99999).setScrollFactor(0);
  }
  update(scene: Phaser.Scene) {
    const fps = Math.round(scene.game.loop.actualFps);
    this.text.setText(`FPS ${fps} | objects ${scene.children.length}`);
  }
}
