/**
 * Phaser game configuration factory.
 */
import Phaser from 'phaser';
import { Colors, GAME_HEIGHT, GAME_WIDTH } from './constants';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { HelpScene } from './scenes/HelpScene';
import { DifficultySelectScene } from './scenes/DifficultySelectScene';
import { OptionsScene } from './scenes/OptionsScene';
import { GameScene } from './scenes/GameScene';
import { VersusLobbyScene } from './scenes/VersusLobbyScene';
import { VersusScene } from './scenes/VersusScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: Colors.bg,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    input: {
      // Enable Xbox-style gamepad support across all scenes.
      gamepad: true
    },
    scene: [
      BootScene,
      MenuScene,
      HelpScene,
      DifficultySelectScene,
      OptionsScene,
      GameScene,
      VersusLobbyScene,
      VersusScene,
      GameOverScene,
      LeaderboardScene
    ]
  };
}
