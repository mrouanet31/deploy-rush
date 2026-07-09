/**
 * Entry point — creates the Phaser game and mounts it into #game-root.
 */
import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { installPhaserGamepadShutdownGuard } from './game/systems/PhaserGamepadPatch';

const PARENT_ID = 'game-root';

window.addEventListener('load', () => {
  installPhaserGamepadShutdownGuard();
  const game = new Phaser.Game(createGameConfig(PARENT_ID));
  // Expose for debugging in dev console.
  (window as unknown as { __DEPLOY_RUSH__?: Phaser.Game }).__DEPLOY_RUSH__ = game;
});
