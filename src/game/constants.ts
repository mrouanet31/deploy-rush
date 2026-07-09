/**
 * Centralized constants: canvas size, colors, lanes, key bindings and
 * gauge limits. Tuning the game should mostly happen here and in the
 * data/ files.
 */
import type { KeyboardLayout, LaneId, PlayerAction, PlayerInputDevice } from './types';

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 640;

/** Scene keys used when starting/stopping scenes. */
export const SceneKeys = {
  Boot: 'BootScene',
  Menu: 'MenuScene',
  Help: 'HelpScene',
  DifficultySelect: 'DifficultySelectScene',
  Options: 'OptionsScene',
  Game: 'GameScene',
  VersusLobby: 'VersusLobbyScene',
  Versus: 'VersusScene',
  GameOver: 'GameOverScene',
  Leaderboard: 'LeaderboardScene'
} as const;

/** Color palette (hex numbers for Phaser). */
export const Colors = {
  bg: 0x0b1020,
  bgAlt: 0x121a33,
  panel: 0x18213f,
  panelLight: 0x223055,
  grid: 0x1d2947,
  text: 0xe6ecff,
  textDim: 0x8a97c2,
  green: 0x35d07f,
  cyan: 0x38bdf8,
  orange: 0xff9f43,
  red: 0xff4d5e,
  purple: 0xa855f7,
  yellow: 0xffd166,
  white: 0xffffff,
  laneLine: 0x2a3a63
} as const;

/** Same palette as CSS strings for text styles. */
export const CssColors = {
  text: '#e6ecff',
  textDim: '#8a97c2',
  green: '#35d07f',
  cyan: '#38bdf8',
  orange: '#ff9f43',
  red: '#ff4d5e',
  purple: '#a855f7',
  yellow: '#ffd166',
  white: '#ffffff'
} as const;

/** Lanes rendered top-to-bottom. */
export const LANES: LaneId[] = ['PLAN', 'CODE', 'TEST', 'SECURITY', 'DEPLOY'];

/** Colors per lane, used for lane headers. */
export const LaneColors: Record<LaneId, number> = {
  PLAN: Colors.purple,
  CODE: Colors.cyan,
  TEST: Colors.yellow,
  SECURITY: Colors.orange,
  DEPLOY: Colors.green
};

/** Playfield geometry. */
export const Layout = {
  hudHeight: 96,
  laneAreaTop: 110,
  laneAreaBottom: GAME_HEIGHT - 40,
  laneLabelWidth: 120,
  /** X where the player "processing zone" sits. */
  playerX: 230,
  /** Half-width of the interception zone around the player. */
  hitZoneHalfWidth: 60,
  /** X where events spawn (off-screen right). */
  spawnX: GAME_WIDTH + 80,
  /** X where events are considered "missed" and removed. */
  despawnX: -120
} as const;

/** Gauge maximums. */
export const Gauges = {
  buildMax: 100,
  productionMax: 100,
  techDebtMax: 100,
  /** Tech debt above this threshold accelerates spawns. */
  techDebtDanger: 70
} as const;

/** Keyboard action → human label (help screen + HUD legend). */
export const ActionLabels: Record<PlayerAction, string> = {
  ANALYZE: 'Analyze',
  FIX: 'Fix',
  TEST: 'Test',
  ROLLBACK: 'Rollback',
  DEPLOY: 'Deploy',
  BLOCK: 'Block',
  CONTEXT: 'Quick'
};

/** Which action key label is shown for each keyboard preset. */
export const ActionKeysByLayout: Record<KeyboardLayout, Record<PlayerAction, string>> = {
  qwerty: {
    ANALYZE: 'A',
    FIX: 'F',
    TEST: 'T',
    ROLLBACK: 'R',
    DEPLOY: 'D',
    BLOCK: 'B',
    CONTEXT: 'SPACE'
  },
  azerty: {
    ANALYZE: 'A',
    FIX: 'F',
    TEST: 'T',
    ROLLBACK: 'R',
    DEPLOY: 'D',
    BLOCK: 'B',
    CONTEXT: 'SPACE'
  }
};

/** Default key labels used before user settings are loaded. */
export const ActionKeys: Record<PlayerAction, string> = ActionKeysByLayout.qwerty;

/** Xbox-style gamepad labels shown on cards when P1 plays with a controller. */
export const GamepadActionLabels: Record<PlayerAction, string> = {
  ANALYZE: 'LB',
  FIX: 'X',
  TEST: 'Y',
  ROLLBACK: 'LT',
  DEPLOY: 'RB',
  BLOCK: 'B',
  CONTEXT: 'A'
};

/** Physical key codes that trigger actions for each keyboard preset. */
export const ActionKeyCodesByLayout: Record<KeyboardLayout, Record<string, PlayerAction>> = {
  qwerty: {
    KeyA: 'ANALYZE',
    KeyF: 'FIX',
    KeyT: 'TEST',
    KeyR: 'ROLLBACK',
    KeyD: 'DEPLOY',
    KeyB: 'BLOCK',
    Space: 'CONTEXT'
  },
  azerty: {
    KeyQ: 'ANALYZE',
    KeyF: 'FIX',
    KeyT: 'TEST',
    KeyR: 'ROLLBACK',
    KeyD: 'DEPLOY',
    KeyB: 'BLOCK',
    Space: 'CONTEXT'
  }
};

export const KeyboardLayoutLabels: Record<KeyboardLayout, string> = {
  qwerty: 'QWERTY',
  azerty: 'AZERTY'
};

export const KeyboardLayouts: KeyboardLayout[] = ['qwerty', 'azerty'];

export const PlayerInputDeviceLabels: Record<PlayerInputDevice, string> = {
  keyboard: 'KEYBOARD',
  gamepad: 'GAMEPAD'
};

export const PlayerInputDevices: PlayerInputDevice[] = ['keyboard', 'gamepad'];

/** localStorage key for the persistent leaderboard. */
export const LEADERBOARD_STORAGE_KEY = 'deploy-rush.leaderboard.v1';
export const LEADERBOARD_MAX_ENTRIES = 10;

/** Combo multiplier steps: every N successful actions raises the tier. */
export const COMBO_STEP = 4;
export const COMBO_MAX_MULTIPLIER = 5;

/** Vertical center Y for a given lane index (0..LANES.length-1). */
export function laneCenterY(laneIndex: number): number {
  const usable = Layout.laneAreaBottom - Layout.laneAreaTop;
  const laneHeight = usable / LANES.length;
  return Layout.laneAreaTop + laneHeight * (laneIndex + 0.5);
}

/** Height of a single lane band. */
export function laneHeight(): number {
  return (Layout.laneAreaBottom - Layout.laneAreaTop) / LANES.length;
}

/** Deterministic seed derived from today's date (YYYYMMDD). */
export function dailySeed(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
