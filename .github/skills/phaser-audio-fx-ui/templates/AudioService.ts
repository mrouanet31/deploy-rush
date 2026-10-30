export class AudioService {
  private muted = false;
  constructor(private scene: Phaser.Scene) {}
  playSfx(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.muted) this.scene.sound.play(key, config);
  }
  setMuted(muted: boolean) { this.muted = muted; this.scene.sound.mute = muted; }
}
