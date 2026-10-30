export function createLabel(scene: Phaser.Scene, text: string, x: number, y: number) {
  return scene.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '18px' }).setDepth(1000);
}
