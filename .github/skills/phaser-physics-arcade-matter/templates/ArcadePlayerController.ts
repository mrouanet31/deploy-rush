export class ArcadePlayerController {
  constructor(private sprite: Phaser.Physics.Arcade.Sprite, private speed = 240) {}
  update(input: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    if (input.left) body.setVelocityX(-this.speed);
    if (input.right) body.setVelocityX(this.speed);
    if (input.up) body.setVelocityY(-this.speed);
    if (input.down) body.setVelocityY(this.speed);
    body.velocity.normalize().scale(this.speed);
  }
}
