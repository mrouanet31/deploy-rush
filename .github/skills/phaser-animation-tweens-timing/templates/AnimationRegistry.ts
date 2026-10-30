export function registerAnimations(scene: Phaser.Scene) {
  if (scene.anims.exists('player-idle')) return;
  scene.anims.create({
    key: 'player-idle',
    frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
}
