/**
 * Entry point — creates the Phaser game and mounts it into #game-root.
 */
import Phaser from 'phaser';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import { createGameConfig } from './game/config';
import { installPhaserGamepadShutdownGuard } from './game/systems/PhaserGamepadPatch';

const PARENT_ID = 'game-root';

window.addEventListener('load', async () => {
  await Promise.all([
    document.fonts.load('500 16px "Space Grotesk"'),
    document.fonts.load('700 16px "Space Grotesk"'),
    document.fonts.load('400 16px "IBM Plex Mono"'),
    document.fonts.load('500 16px "IBM Plex Mono"')
  ]);
  installPhaserGamepadShutdownGuard();
  const game = new Phaser.Game(createGameConfig(PARENT_ID));
  // Expose for debugging in dev console.
  (window as unknown as { __DEPLOY_RUSH__?: Phaser.Game }).__DEPLOY_RUSH__ = game;
});
