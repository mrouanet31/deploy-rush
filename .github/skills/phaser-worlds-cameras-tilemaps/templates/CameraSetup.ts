export function setupWorldCamera(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, bounds: Phaser.Geom.Rectangle) {
  const cam = scene.cameras.main;
  cam.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  cam.startFollow(target, true, 0.12, 0.12);
  cam.setDeadzone(160, 100);
  return cam;
}
