/**
 * BootScene — minimal preloader. No external assets are required, so this
 * simply shows a brief splash and hands off to the menu.
 */
import Phaser from 'phaser';
import { CssColors, GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants';
import { SettingsService } from '../systems/SettingsService';
import { SoundManager } from '../systems/SoundManager';
import { createBackdrop, titleStyle } from '../ui';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    createBackdrop(this);

    // Create the shared sound manager and apply persisted settings.
    const settings = SettingsService.load();
    const sound = new SoundManager();
    sound.setEnabled(settings.sound);
    sound.setMusicEnabled(settings.music);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'DEPLOY RUSH', titleStyle(56))
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'booting pipeline...', {
        fontFamily: 'Consolas, monospace',
        fontSize: '18px',
        color: CssColors.textDim
      })
      .setOrigin(0.5);

    this.time.delayedCall(700, () => this.scene.start(SceneKeys.Menu, { sound }));
  }
}
