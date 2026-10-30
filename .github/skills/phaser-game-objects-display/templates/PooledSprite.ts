export class PooledSprite extends Phaser.Physics.Arcade.Sprite {
  activate(x: number, y: number) {
    this.setActive(true).setVisible(true).setPosition(x, y);
    this.body?.enable = true;
  }
  deactivate() {
    this.setActive(false).setVisible(false);
    if (this.body) this.body.enable = false;
  }
}
