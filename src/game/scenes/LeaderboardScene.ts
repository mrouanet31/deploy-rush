/**
 * LeaderboardScene — shows leaderboards from the online backend when it is
 * reachable, with a graceful fallback to the local (localStorage) board.
 *
 * Views:
 *   - Source: ONLINE or LOCAL  (toggle with T)
 *   - Board: GLOBAL or DAILY  (toggle with D)
 *   - Local mode scope: Training / Normal / Hard / Conference (toggle with F)
 *
 * Highlights the row the player just submitted (matched by name + score).
 */
import Phaser from 'phaser';
import { Colors, CssColors, dailySeed, GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants';
import { DIFFICULTY_PROFILES } from '../data/difficultyProfiles';
import { DEFAULT_RUN_MODIFIER, RUN_MODIFIERS } from '../data/runModifiers';
import { LeaderboardApi } from '../systems/LeaderboardApi';
import { LeaderboardService } from '../systems/LeaderboardService';
import { GamepadController } from '../systems/GamepadController';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, pulseHint, titleStyle } from '../ui';
import type { DifficultyId, LeaderboardEntry, LeaderboardScope, RunBadge, RunModifierId } from '../types';

interface LeaderboardData {
  sound?: SoundManager;
  from?: string;
  highlightRank?: number;
  highlightName?: string;
  highlightScore?: number;
  difficulty?: DifficultyId;
  daily?: boolean;
  seed?: number;
  modifier?: RunModifierId;
  online?: boolean;
}

type Source = 'online' | 'local';
type Board = 'global' | 'daily';

const DIFFICULTY_ORDER: DifficultyId[] = ['training', 'normal', 'hard', 'conference'];

export class LeaderboardScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private from = SceneKeys.Menu as string;
  private highlightName = '';
  private highlightScore = -1;
  private difficulty: DifficultyId = 'conference';
  private daily = false;
  private seed = 0;
  private modifier: RunModifierId = DEFAULT_RUN_MODIFIER;

  private source: Source = 'online';
  private board: Board = 'global';
  private tableGroup?: Phaser.GameObjects.Container;
  private badge!: Phaser.GameObjects.Text;
  private loadToken = 0;

  constructor() {
    super(SceneKeys.Leaderboard);
  }

  init(data: LeaderboardData): void {
    this.soundMgr = data.sound ?? new SoundManager();
    this.from = data.from ?? SceneKeys.Menu;
    this.highlightName = data.highlightName ?? '';
    this.highlightScore = data.highlightScore ?? -1;
    this.difficulty = data.difficulty ?? 'conference';
    this.daily = data.daily ?? false;
    this.seed = data.seed ?? dailySeed();
    this.modifier = data.modifier ?? DEFAULT_RUN_MODIFIER;
    this.board = this.daily ? 'daily' : 'global';
    this.source = data.online === false ? 'local' : 'online';
    this.loadToken = 0;
  }

  create(): void {
    createBackdrop(this);
    this.add.text(GAME_WIDTH / 2, 38, 'LEADERBOARD', titleStyle(40)).setOrigin(0.5);

    this.badge = this.add
      .text(GAME_WIDTH / 2, 76, '', bodyStyle(15, CssColors.textDim))
      .setOrigin(0.5);

    this.renderHeader();
    this.bindKeys();
    this.bindGamepad();
    void this.reload();

    const controls =
      this.from === SceneKeys.GameOver
        ? '[ENTER]/(A) Replay  \u00B7  [M]/(B) Menu  \u00B7  [T]/(X) Source  \u00B7  [D]/(Y) Board  \u00B7  [F] Mode'
        : '[ENTER/ESC]/(A/B) Back  \u00B7  [T]/(X) Source  \u00B7  [D]/(Y) Board  \u00B7  [F] Mode';
    pulseHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 26, controls, CssColors.cyan);
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    if (this.from === SceneKeys.GameOver) {
      kb.on('keydown-ENTER', () => this.replay());
      kb.on('keydown-M', () => this.backToMenu());
    } else {
      kb.on('keydown-ENTER', () => this.backToMenu());
      kb.on('keydown-ESC', () => this.backToMenu());
    }

    kb.on('keydown-T', () => this.toggleSource());
    kb.on('keydown-D', () => this.toggleBoard());
    kb.on('keydown-F', () => this.cycleMode());
  }

  private bindGamepad(): void {
    const fromGameOver = this.from === SceneKeys.GameOver;
    new GamepadController(this, {
      onConfirm: () => (fromGameOver ? this.replay() : this.backToMenu()),
      onBack: () => this.backToMenu(),
      onButton: (b) => {
        if (b === 'X') this.toggleSource();
        else if (b === 'Y') this.toggleBoard();
      }
    });
  }

  private replay(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Game, { difficulty: this.difficulty, sound: this.soundMgr, daily: this.daily, modifier: this.modifier });
  }

  private toggleSource(): void {
    this.source = this.source === 'online' ? 'local' : 'online';
    this.soundMgr.move();
    void this.reload();
  }

  private toggleBoard(): void {
    this.board = this.board === 'global' ? 'daily' : 'global';
    this.soundMgr.move();
    void this.reload();
  }

  private cycleMode(): void {
    this.difficulty = nextDifficulty(this.difficulty);
    this.modifier = DEFAULT_RUN_MODIFIER;
    this.source = 'local';
    this.board = 'global';
    this.soundMgr.move();
    void this.reload();
  }

  private backToMenu(): void {
    this.soundMgr.select();
    this.scene.start(SceneKeys.Menu, { sound: this.soundMgr });
  }

  private async reload(): Promise<void> {
    const token = ++this.loadToken;
    this.badge.setText('Loading\u2026').setColor(CssColors.textDim);
    this.showMessage('Fetching scores\u2026');

    if (this.source === 'local') {
      if (token !== this.loadToken) return;
      this.badge.setText(this.localBadge()).setColor(CssColors.yellow);
      this.renderTable(LeaderboardService.load(this.localScope()));
      return;
    }

    const entries =
      this.board === 'daily'
        ? await LeaderboardApi.fetchDaily(this.seed, 10)
        : await LeaderboardApi.fetchGlobal(10);
    if (token !== this.loadToken) return;

    if (entries === null) {
      // Backend unreachable — fall back to the local board automatically.
      this.source = 'local';
      this.badge
        .setText(`OFFLINE \u2014 ${this.localBadge()} (press T to retry)`)
        .setColor(CssColors.orange);
      this.renderTable(LeaderboardService.load(this.localScope()));
      return;
    }

    this.badge
      .setText(this.board === 'daily' ? `ONLINE \u00B7 DAILY #${this.seed}` : 'ONLINE \u00B7 GLOBAL')
      .setColor(CssColors.green);
    this.renderTable(entries);
  }

  private localScope(): LeaderboardScope {
    const daily = this.board === 'daily';
    return {
      difficulty: daily ? 'conference' : this.difficulty,
      daily,
      seed: this.seed,
      modifier: daily ? DEFAULT_RUN_MODIFIER : this.modifier
    };
  }

  private localBadge(): string {
    if (this.board === 'daily') return `LOCAL \u00B7 DAILY #${this.seed}`;
    const modifier = RUN_MODIFIERS[this.modifier];
    const suffix = modifier.id === DEFAULT_RUN_MODIFIER ? 'GLOBAL' : modifier.shortLabel;
    return `LOCAL \u00B7 ${DIFFICULTY_PROFILES[this.difficulty].label.toUpperCase()} \u00B7 ${suffix}`;
  }

  private renderHeader(): void {
    const { cols } = this.geometry();
    this.add.text(cols.rank, 112, '#', bodyStyle(15, CssColors.textDim)).setOrigin(0, 0.5);
    this.add.text(cols.name, 112, 'HANDLE', bodyStyle(15, CssColors.textDim)).setOrigin(0, 0.5);
    this.add.text(cols.title, 112, 'TITLE / BADGES', bodyStyle(15, CssColors.textDim)).setOrigin(0, 0.5);
    this.add.text(cols.score, 112, 'SCORE', bodyStyle(15, CssColors.textDim)).setOrigin(0, 0.5);
    this.add.text(cols.date, 112, 'DATE', bodyStyle(15, CssColors.textDim)).setOrigin(1, 0.5);
  }

  private geometry() {
    const top = 132;
    const rowH = 46;
    const left = 76;
    const width = GAME_WIDTH - left * 2;
    const cols = {
      rank: left + 10,
      name: left + 60,
      title: left + 220,
      score: left + 590,
      date: left + width - 16
    };
    return { top, rowH, left, width, cols };
  }

  private showMessage(text: string): void {
    this.tableGroup?.destroy();
    const { top, width } = this.geometry();
    const bg = panel(this, GAME_WIDTH / 2, top + 150, width, 120);
    const msg = this.add
      .text(GAME_WIDTH / 2, top + 150, text, bodyStyle(20, CssColors.textDim))
      .setOrigin(0.5);
    this.tableGroup = this.add.container(0, 0, [bg, msg]);
  }

  private renderTable(entries: LeaderboardEntry[]): void {
    this.tableGroup?.destroy();
    const { top, rowH, width, cols } = this.geometry();

    if (entries.length === 0) {
      const bg = panel(this, GAME_WIDTH / 2, top + 150, width, 120);
      const msg = this.add
        .text(GAME_WIDTH / 2, top + 150, 'No scores yet. Be the first to ship!', bodyStyle(20, CssColors.textDim))
        .setOrigin(0.5);
      this.tableGroup = this.add.container(0, 0, [bg, msg]);
      return;
    }

    const objects: Phaser.GameObjects.GameObject[] = [];
    entries.forEach((entry, i) => {
      const y = top + 26 + i * rowH;
      const isHighlight =
        entry.name === this.highlightName && entry.score === this.highlightScore;
      const rowColor = isHighlight ? 0x223055 : i % 2 === 0 ? 0x18213f : 0x141b33;
      objects.push(
        this.add
          .rectangle(GAME_WIDTH / 2, y, width, rowH - 6, rowColor, isHighlight ? 1 : 0.7)
          .setStrokeStyle(isHighlight ? 2 : 0, 0x35d07f, 0.9)
      );

      const medal = i < 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][i] : `${i + 1}`;
      const nameColor = isHighlight ? CssColors.green : CssColors.white;

      objects.push(this.add.text(cols.rank, y, medal, bodyStyle(18, CssColors.yellow)).setOrigin(0, 0.5));
      objects.push(this.add.text(cols.name, y, entry.name, bodyStyle(18, nameColor)).setOrigin(0, 0.5));
      objects.push(this.add.text(cols.title, y - 9, entry.title, bodyStyle(14, CssColors.purple)).setOrigin(0, 0.5));
      this.renderBadgePills(objects, entry.badges ?? [], cols.title + 2, y + 8, cols.score - cols.title - 34);
      objects.push(this.add.text(cols.score, y, `${entry.score}`, bodyStyle(18, CssColors.cyan)).setOrigin(0, 0.5));
      objects.push(
        this.add.text(cols.date, y, this.formatMeta(entry), bodyStyle(13, CssColors.textDim)).setOrigin(1, 0.5)
      );
    });

    this.tableGroup = this.add.container(0, 0, objects);
  }

  private renderBadgePills(
    objects: Phaser.GameObjects.GameObject[],
    badges: RunBadge[],
    x: number,
    y: number,
    maxWidth: number
  ): void {
    let cursor = x + 4;
    const right = x + maxWidth;

    for (const badge of badges.slice(0, 4)) {
      const label = compactBadgeLabel(badge);
      const width = Math.min(86, 32 + label.length * 7);
      if (cursor + width > right) break;
      const color = badgeColor(badge.id);
      objects.push(
        this.add
          .rectangle(cursor + width / 2, y, width, 15, Colors.bgAlt, 0.92)
          .setStrokeStyle(1, color, 0.78)
      );
      objects.push(
        this.add
          .text(cursor + width / 2, y, label, bodyStyle(10, colorToCss(color)))
          .setOrigin(0.5)
      );
      cursor += width + 6;
    }
  }

  private formatMeta(entry: LeaderboardEntry): string {
    const d = new Date(entry.date);
    const date = Number.isNaN(d.getTime())
      ? '--'
      : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const mm = Math.floor(entry.duration / 60);
    const ss = entry.duration % 60;
    return `${date}  \u00B7  ${mm}:${pad(ss)}`;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function nextDifficulty(current: DifficultyId): DifficultyId {
  const index = DIFFICULTY_ORDER.indexOf(current);
  return DIFFICULTY_ORDER[(index + 1) % DIFFICULTY_ORDER.length];
}

function compactBadgeLabel(badge: RunBadge): string {
  switch (badge.id) {
    case 'clean-deploy':
      return 'Clean';
    case 'combo-engine':
      return 'Combo';
    case 'wave-rider':
      return 'Waves';
    case 'debt-slayer':
      return 'Debt';
    case 'steady-hands':
      return 'Precise';
    case 'prod-saver':
      return 'Prod';
    case 'hotfix-hunter':
      return 'Power';
    default:
      return badge.label.length > 9 ? `${badge.label.slice(0, 8)}.` : badge.label;
  }
}

function badgeColor(id: string): number {
  switch (id) {
    case 'clean-deploy':
      return Colors.yellow;
    case 'combo-engine':
      return Colors.cyan;
    case 'wave-rider':
    case 'prod-saver':
      return Colors.green;
    case 'debt-slayer':
    case 'steady-hands':
      return Colors.purple;
    case 'hotfix-hunter':
      return Colors.orange;
    default:
      return Colors.textDim;
  }
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
