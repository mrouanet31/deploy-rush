export function createCollisionLayer(scene: Phaser.Scene, mapKey: string, tilesetKey: string, layerName: string) {
  const map = scene.make.tilemap({ key: mapKey });
  const tileset = map.addTilesetImage(tilesetKey);
  if (!tileset) throw new Error(`Missing tileset ${tilesetKey}`);
  const layer = map.createLayer(layerName, tileset, 0, 0);
  if (!layer) throw new Error(`Missing layer ${layerName}`);
  layer.setCollisionByProperty({ collides: true });
  return { map, layer };
}
