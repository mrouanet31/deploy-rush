export function createPreloadBar(scene: Phaser.Scene) {
  const width = Number(scene.scale.width);
  const y = Number(scene.scale.height) / 2;
  const bg = scene.add.rectangle(width / 2, y, width * 0.6, 18, 0x222222);
  const bar = scene.add.rectangle(width * 0.2, y, 0, 14, 0x66d9ef).setOrigin(0, 0.5);
  scene.load.on('progress', (value: number) => { bar.width = width * 0.6 * value; });
  scene.load.once('complete', () => { bg.destroy(); bar.destroy(); });
}
