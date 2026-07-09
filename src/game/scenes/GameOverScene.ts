/**
 * GameOverScene — shows final score, stats, score breakdown, obtained
 * title, and a keyboard/gamepad-driven name entry that saves to the local
 * leaderboard. Enter confirms; then jump to the leaderboard.
 */
import Phaser from 'phaser';
import { Colors, CssColors, dailySeed, GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants';
import { DIFFICULTY_PROFILES } from '../data/difficultyProfiles';
import { DEFAULT_RUN_MODIFIER, RUN_MODIFIERS } from '../data/runModifiers';
import { GamepadController, type GamepadButtonName } from '../systems/GamepadController';
import { InputDeviceService } from '../systems/InputDeviceService';
import { LeaderboardApi } from '../systems/LeaderboardApi';
import { LeaderboardService } from '../systems/LeaderboardService';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, titleStyle } from '../ui';
import type { GameResult, LeaderboardScope, RunBadge, RunModifierId } from '../types';

interface GameOverData {
  result: GameResult;
  reason: string;
  sound?: SoundManager;
  daily?: boolean;
}

const MAX_NAME_LEN = 12;
const GAMEPAD_NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
const VIRTUAL_KEYS = [...GAMEPAD_NAME_CHARS.split(''), 'DEL', 'SAVE'];
const VIRTUAL_KEY_COLUMNS = 10;
const VIRTUAL_KEY_COMMAND_START = GAMEPAD_NAME_CHARS.length;

interface VirtualKeyView {
  key: string;
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export class GameOverScene extends Phaser.Scene {
  private result!: GameResult;
  private reason = '';
  private soundMgr!: SoundManager;

  private name = '';
  private nameCursor = 0;
  private nameText!: Phaser.GameObjects.Text;
  private caretVisible = true;
  private saved = false;
  private previewRank = 0;
  private daily = false;
  private seed = 0;
  private modifier: RunModifierId = DEFAULT_RUN_MODIFIER;
  private virtualKeyboard = false;
  private virtualKeyIndex = 0;
  private virtualKeyViews: VirtualKeyView[] = [];

  constructor() {
    super(SceneKeys.GameOver);
  }

  init(data: GameOverData): void {
    this.result = data.result;
    this.reason = data.reason;
    this.soundMgr = data.sound ?? new SoundManager();
    this.daily = data.daily ?? false;
    this.seed = this.result.seed || dailySeed();
    this.modifier = this.result.modifier ?? DEFAULT_RUN_MODIFIER;
    this.name = '';
    this.nameCursor = 0;
    this.saved = false;
    this.virtualKeyboard = false;
    this.virtualKeyIndex = 0;
    this.virtualKeyViews = [];
  }

  create(): void {
    createBackdrop(this);
    const { breakdown } = this.result;
    this.previewRank = LeaderboardService.previewRank(breakdown.total, this.scope());

    this.add.text(GAME_WIDTH / 2, 30, 'SHIFT COMPLETE', titleStyle(38)).setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 62, this.reason, bodyStyle(15, CssColors.textDim))
      .setOrigin(0.5);

    // Title obtained.
    this.add
      .text(GAME_WIDTH / 2, 92, `\u201C${breakdown.title}\u201D`, {
        ...bodyStyle(25, CssColors.purple),
        fontStyle: 'bold italic'
      })
      .setOrigin(0.5);

    // Final score big.
    this.add
      .text(GAME_WIDTH / 2, 138, `${breakdown.total}`, {
        fontFamily: 'Consolas, monospace',
        fontSize: '58px',
        color: CssColors.green,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 178, this.scoreMetaLabel(), bodyStyle(15, CssColors.textDim))
      .setOrigin(0.5);

    this.renderBadges(GAME_WIDTH / 2, 202, breakdown.badges);
    this.renderBreakdown(46, 224, 292, 220);
    this.renderStats(366, 224, 292, 220);
    this.renderCoaching(686, 224, 292, 220);
    this.renderNameEntry();

    // Blinking caret.
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.caretVisible = !this.caretVisible;
        this.refreshName();
      }
    });

    this.bindKeys();
    this.bindGamepad();
  }

  private renderBreakdown(x: number, y: number, w: number, h: number): void {
    const b = this.result.breakdown;
    panel(this, x + w / 2, y + h / 2, w, h);
    this.add.text(x + 16, y + 12, 'SCORE BREAKDOWN', bodyStyle(15, CssColors.yellow)).setOrigin(0, 0);
    const rows: Array<[string, number]> = [
      ['In-run score', b.baseScore],
      ['Build bonus', b.buildBonus],
      ['Prod bonus', b.productionBonus],
      ['Tech debt bonus', b.techDebtBonus],
      ['Features bonus', b.featureBonus],
      ['Combo bonus', b.comboBonus],
      ['Clean run', b.cleanRunBonus]
    ];
    rows.forEach(([label, val], i) => {
      const ly = y + 42 + i * 20;
      this.add.text(x + 16, ly, label, bodyStyle(13, CssColors.text)).setOrigin(0, 0);
      this.add
        .text(x + w - 16, ly, `${val >= 0 ? '+' : ''}${val}`, bodyStyle(13, val > 0 ? CssColors.green : CssColors.textDim))
        .setOrigin(1, 0);
    });
    const ty = y + h - 32;
    this.add.text(x + 16, ty, 'TOTAL', bodyStyle(15, CssColors.white)).setOrigin(0, 0);
    this.add.text(x + w - 16, ty, `${b.total}`, bodyStyle(15, CssColors.green)).setOrigin(1, 0);
  }

  private renderBadges(centerX: number, y: number, badges: RunBadge[]): void {
    const visible = badges.slice(0, 4);
    const gap = 10;
    const widths = visible.map((badge) => Math.min(150, 38 + badge.label.length * 8));
    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, visible.length - 1);
    let x = centerX - totalWidth / 2;

    visible.forEach((badge, index) => {
      const width = widths[index];
      const pill = this.add
        .rectangle(x + width / 2, y, width, 24, Colors.panelLight, 0.94)
        .setStrokeStyle(1, index === 0 ? Colors.yellow : Colors.purple, 0.85);

      this.add
        .text(pill.x, y, badge.label, {
          ...bodyStyle(12, index === 0 ? CssColors.yellow : CssColors.white),
          fontStyle: 'bold'
        })
        .setOrigin(0.5);

      x += width + gap;
    });
  }

  private renderStats(x: number, y: number, w: number, h: number): void {
    const s = this.result.state;
    panel(this, x + w / 2, y + h / 2, w, h);
    this.add.text(x + 16, y + 12, 'RUN STATS', bodyStyle(15, CssColors.yellow)).setOrigin(0, 0);
    const rows: Array<[string, string]> = [
      ['Handled', `${s.eventsHandled}`],
      ['Missed', `${s.eventsMissed}`],
      ['Wrong keys', `${s.wrongActions}`],
      ['Dangerous', `${s.dangerousActions}`],
      ['Critical misses', `${s.criticalMisses}`],
      ['Power-ups', `${s.powerUpsUsed}`],
      ['Waves clear', `${s.wavesCleared}/${s.wavesStarted}`],
      ['Best combo', `${s.bestCombo}`],
      ['Features', `${s.featuresShipped}`],
      ['Gauges', `B${Math.round(s.buildStability)} P${Math.round(s.productionHealth)} D${Math.round(s.techDebt)}`]
    ];
    rows.forEach(([label, val], i) => {
      const ly = y + 40 + i * 18;
      this.add.text(x + 16, ly, label, bodyStyle(13, CssColors.text)).setOrigin(0, 0);
      this.add.text(x + w - 16, ly, val, bodyStyle(13, CssColors.cyan)).setOrigin(1, 0);
    });
  }

  private renderCoaching(x: number, y: number, w: number, h: number): void {
    panel(this, x + w / 2, y + h / 2, w, h);
    this.add.text(x + 16, y + 12, 'NEXT RUN COACHING', bodyStyle(15, CssColors.yellow)).setOrigin(0, 0);
    let cy = y + 42;
    this.buildCoachingTips().forEach((tip, i) => {
      const text = this.add
        .text(x + 16, cy, `${i + 1}. ${tip}`, {
          ...bodyStyle(13, CssColors.text),
          wordWrap: { width: w - 32 },
          lineSpacing: 3
        })
        .setOrigin(0, 0);
      cy += text.height + 14;
    });
  }

  private renderNameEntry(): void {
    this.virtualKeyboard = InputDeviceService.hasConnectedGamepad(this);
    if (this.virtualKeyboard) {
      this.renderVirtualNameEntry();
      return;
    }

    const y = GAME_HEIGHT - 62;
    this.add
      .text(
        GAME_WIDTH / 2,
        y - 30,
        'Enter handle + ENTER, or gamepad: D-pad edit \u00B7 X add \u00B7 B delete \u00B7 A save',
        bodyStyle(15, CssColors.textDim)
      )
      .setOrigin(0.5);
    panel(this, GAME_WIDTH / 2, y + 6, 360, 42);
    this.nameText = this.add
      .text(GAME_WIDTH / 2, y + 6, '', {
        fontFamily: 'Consolas, monospace',
        fontSize: '26px',
        color: CssColors.white,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.refreshName();
  }

  private renderVirtualNameEntry(): void {
    const centerX = GAME_WIDTH / 2;
    this.add
      .text(centerX, 459, 'D-pad select \u00B7 A press \u00B7 B delete \u00B7 Start save', bodyStyle(11, CssColors.textDim))
      .setOrigin(0.5);

    panel(this, centerX, 516, 430, 132, Colors.cyan);
    const cellW = 36;
    const cellH = 20;
    const left = centerX - (VIRTUAL_KEY_COLUMNS - 1) * cellW / 2;
    const top = 482;

    this.virtualKeyViews = VIRTUAL_KEYS.map((key, i) => {
      const commandIndex = i - VIRTUAL_KEY_COMMAND_START;
      const isCommand = commandIndex >= 0;
      const col = isCommand ? 4 + commandIndex * 2 : i % VIRTUAL_KEY_COLUMNS;
      const row = isCommand ? 4 : Math.floor(i / VIRTUAL_KEY_COLUMNS);
      const x = isCommand ? centerX + (commandIndex === 0 ? -38 : 38) : left + col * cellW;
      const y = top + row * 20;
      const bg = this.add.rectangle(x, y, isCommand ? 62 : 30, cellH, Colors.panelLight, 0.88);
      const text = this.add
        .text(x, y, key, {
          ...bodyStyle(key.length > 1 ? 10 : 13, CssColors.text),
          fontStyle: 'bold'
        })
        .setOrigin(0.5);
      return { key, bg, text };
    });

    this.add
      .text(centerX, 589, 'HANDLE', bodyStyle(12, CssColors.textDim))
      .setOrigin(0.5);
    panel(this, centerX, 618, 360, 34);
    this.nameText = this.add
      .text(centerX, 618, '', {
        fontFamily: 'Consolas, monospace',
        fontSize: '26px',
        color: CssColors.white,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.refreshVirtualKeyboard();
    this.refreshName();
  }

  private refreshName(): void {
    if (this.saved) return;
    const caret = this.caretVisible ? '\u2588' : '_';
    this.nameCursor = Phaser.Math.Clamp(this.nameCursor, 0, this.name.length);
    if (!this.name) {
      this.nameText.setText(caret);
      return;
    }
    if (this.nameCursor >= this.name.length) {
      this.nameText.setText(`${this.name}${caret}`);
      return;
    }
    this.nameText.setText(
      `${this.name.slice(0, this.nameCursor)}${caret}${this.name.slice(this.nameCursor + 1)}`
    );
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.on('keydown', (event: KeyboardEvent) => {
      if (this.saved) return;
      if (event.key === 'Enter') {
        this.save();
        return;
      }
      if (event.key === 'Backspace') {
        this.name = this.name.slice(0, -1);
        this.nameCursor = this.name.length;
        this.refreshName();
        event.preventDefault();
        return;
      }
      // Accept printable single characters.
      if (event.key.length === 1 && /[a-zA-Z0-9 _\-]/.test(event.key)) {
        if (this.name.length < MAX_NAME_LEN) {
          this.name += event.key;
          this.nameCursor = this.name.length;
          this.soundMgr.move();
          this.refreshName();
        }
      }
    });
  }

  private bindGamepad(): void {
    new GamepadController(this, {
      onNav: (intent) => this.handleNameNav(intent),
      onConfirm: () => this.confirmNameInput(),
      onBack: () => this.deleteNameChar(),
      onButton: (button) => this.handleNameButton(button)
    });
  }

  private handleNameNav(intent: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): void {
    if (this.saved) return;
    if (this.virtualKeyboard) {
      this.moveVirtualKey(intent);
      return;
    }
    if (intent === 'LEFT') this.moveNameCursor(-1);
    else if (intent === 'RIGHT') this.moveNameCursor(1);
    else this.cycleNameChar(intent === 'UP' ? 1 : -1);
  }

  private handleNameButton(button: GamepadButtonName): void {
    if (this.saved) return;
    if (this.virtualKeyboard) {
      if (button === 'START') this.save();
      else if (button === 'X' || button === 'VIEW') this.deleteNameChar();
      return;
    }
    if (button === 'X') this.insertNameChar();
    else if (button === 'Y') this.cycleNameChar(1);
    else if (button === 'LB') this.moveNameCursor(-1);
    else if (button === 'RB') this.moveNameCursor(1);
    else if (button === 'VIEW') this.deleteNameChar();
    else if (button === 'START') this.save();
  }

  private confirmNameInput(): void {
    if (this.virtualKeyboard) this.pressVirtualKey();
    else this.save();
  }

  private moveVirtualKey(intent: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): void {
    const { row, col } = this.virtualPositionForIndex(this.virtualKeyIndex);
    const rows = Math.ceil(GAMEPAD_NAME_CHARS.length / VIRTUAL_KEY_COLUMNS) + 1;
    let nextRow = row;
    let nextCol = col;

    if (intent === 'LEFT') nextCol = Phaser.Math.Wrap(col - 1, 0, VIRTUAL_KEY_COLUMNS);
    else if (intent === 'RIGHT') nextCol = Phaser.Math.Wrap(col + 1, 0, VIRTUAL_KEY_COLUMNS);
    else if (intent === 'UP') nextRow = Phaser.Math.Wrap(row - 1, 0, rows);
    else nextRow = Phaser.Math.Wrap(row + 1, 0, rows);

    this.virtualKeyIndex = this.virtualIndexFromPosition(nextRow, nextCol);
    this.soundMgr.move();
    this.refreshVirtualKeyboard();
  }

  private pressVirtualKey(): void {
    const key = VIRTUAL_KEYS[this.virtualKeyIndex];
    if (key === 'SAVE') {
      this.save();
      return;
    }
    if (key === 'DEL') {
      this.deleteNameChar();
      return;
    }
    if (this.name.length >= MAX_NAME_LEN) {
      this.soundMgr.error();
      return;
    }

    const cursor = Phaser.Math.Clamp(this.nameCursor, 0, this.name.length);
    this.name = `${this.name.slice(0, cursor)}${key}${this.name.slice(cursor)}`;
    this.nameCursor = cursor + 1;
    this.soundMgr.move();
    this.refreshName();
  }

  private virtualIndexFromPosition(row: number, col: number): number {
    const charRows = Math.ceil(GAMEPAD_NAME_CHARS.length / VIRTUAL_KEY_COLUMNS);
    if (row >= charRows) {
      return col < VIRTUAL_KEY_COLUMNS / 2 ? VIRTUAL_KEY_COMMAND_START : VIRTUAL_KEY_COMMAND_START + 1;
    }

    const index = row * VIRTUAL_KEY_COLUMNS + col;
    return Math.min(index, VIRTUAL_KEY_COMMAND_START - 1);
  }

  private virtualPositionForIndex(index: number): { row: number; col: number } {
    const charRows = Math.ceil(GAMEPAD_NAME_CHARS.length / VIRTUAL_KEY_COLUMNS);
    if (index >= VIRTUAL_KEY_COMMAND_START) {
      return {
        row: charRows,
        col: index === VIRTUAL_KEY_COMMAND_START ? 4 : 6
      };
    }

    return {
      row: Math.floor(index / VIRTUAL_KEY_COLUMNS),
      col: index % VIRTUAL_KEY_COLUMNS
    };
  }

  private refreshVirtualKeyboard(): void {
    this.virtualKeyViews.forEach((view, i) => {
      const selected = i === this.virtualKeyIndex;
      const isCommand = view.key === 'DEL' || view.key === 'SAVE';
      const color = view.key === 'SAVE' ? Colors.green : view.key === 'DEL' ? Colors.orange : Colors.cyan;
      view.bg.setFillStyle(selected ? color : Colors.panelLight, selected ? 0.94 : 0.72);
      view.bg.setStrokeStyle(selected ? 3 : 1, selected ? Colors.white : isCommand ? color : Colors.panelLight, selected ? 1 : 0.7);
      view.text.setColor(selected ? '#0b1020' : isCommand ? colorToCss(color) : CssColors.text);
    });
  }

  private moveNameCursor(delta: number): void {
    if (!this.name) return;
    this.nameCursor = Phaser.Math.Clamp(this.nameCursor + delta, 0, this.name.length);
    this.soundMgr.move();
    this.refreshName();
  }

  private insertNameChar(): void {
    if (this.name.length >= MAX_NAME_LEN) return;
    const cursor = Phaser.Math.Clamp(this.nameCursor, 0, this.name.length);
    this.name = `${this.name.slice(0, cursor)}A${this.name.slice(cursor)}`;
    this.nameCursor = cursor;
    this.soundMgr.move();
    this.refreshName();
  }

  private cycleNameChar(delta: number): void {
    const created = this.ensureNameChar();
    if (this.nameCursor >= this.name.length) return;
    const current = this.name[this.nameCursor].toUpperCase();
    const currentIndex = Math.max(0, GAMEPAD_NAME_CHARS.indexOf(current));
    const nextIndex = created
      ? 0
      : Phaser.Math.Wrap(currentIndex + delta, 0, GAMEPAD_NAME_CHARS.length);
    const nextChar = GAMEPAD_NAME_CHARS[nextIndex];
    this.name = `${this.name.slice(0, this.nameCursor)}${nextChar}${this.name.slice(this.nameCursor + 1)}`;
    this.soundMgr.move();
    this.refreshName();
  }

  private ensureNameChar(): boolean {
    if (this.name.length >= MAX_NAME_LEN && this.nameCursor >= this.name.length) {
      this.nameCursor = MAX_NAME_LEN - 1;
      return false;
    }
    if (this.name.length === 0) {
      this.name = 'A';
      this.nameCursor = 0;
      return true;
    }
    if (this.nameCursor >= this.name.length) {
      this.name = `${this.name}A`;
      this.nameCursor = this.name.length - 1;
      return true;
    }
    return false;
  }

  private deleteNameChar(): void {
    if (!this.name) return;
    const cursor = Phaser.Math.Clamp(this.nameCursor, 0, this.name.length);
    const removeIndex = cursor >= this.name.length ? this.name.length - 1 : cursor;
    this.name = `${this.name.slice(0, removeIndex)}${this.name.slice(removeIndex + 1)}`;
    this.nameCursor = Math.min(removeIndex, this.name.length);
    this.soundMgr.move();
    this.refreshName();
  }

  private save(): void {
    if (this.saved) return;
    this.saved = true;
    const finalName = this.name.trim() || 'ANON';
    const b = this.result.breakdown;
    const durationPlayed = Math.round(
      Math.max(0, this.matchDuration() - this.result.state.timeLeft)
    );

    // Always store locally first (offline-first).
    const { rank: localRank } = LeaderboardService.submit({
      name: finalName,
      score: b.total,
      date: new Date().toISOString(),
      duration: durationPlayed,
      title: b.title,
      badges: b.badges,
      difficulty: this.result.difficulty,
      daily: this.daily,
      seed: this.seed,
      modifier: this.modifier
    }, this.scope());

    this.soundMgr.select();
    this.nameText.setText(finalName);

    if (this.result.difficulty === 'training') {
      this.scene.start(SceneKeys.Leaderboard, {
        sound: this.soundMgr,
        from: SceneKeys.GameOver,
        highlightRank: localRank,
        highlightName: finalName,
        highlightScore: b.total,
        difficulty: this.result.difficulty,
        daily: this.daily,
        seed: this.seed,
        modifier: this.modifier,
        online: false
      });
      return;
    }

    if (this.modifier !== DEFAULT_RUN_MODIFIER) {
      this.scene.start(SceneKeys.Leaderboard, {
        sound: this.soundMgr,
        from: SceneKeys.GameOver,
        highlightRank: localRank,
        highlightName: finalName,
        highlightScore: b.total,
        difficulty: this.result.difficulty,
        daily: this.daily,
        seed: this.seed,
        modifier: this.modifier,
        online: false
      });
      return;
    }

    // Show a transient "submitting online" note, then transition once the
    // network call settles (or times out).
    const status = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 18, 'Submitting to online leaderboard\u2026', bodyStyle(14, CssColors.textDim))
      .setOrigin(0.5);

    LeaderboardApi.submit({
      name: finalName,
      score: b.total,
      duration: durationPlayed,
      title: b.title,
      badges: b.badges,
      difficulty: this.result.difficulty,
      daily: this.daily,
      seed: this.seed
    })
      .then((online) => {
        status.destroy();
        this.scene.start(SceneKeys.Leaderboard, {
          sound: this.soundMgr,
          from: SceneKeys.GameOver,
          highlightRank: online ? online.rank : localRank,
          highlightName: finalName,
          highlightScore: b.total,
          difficulty: this.result.difficulty,
          daily: this.daily,
          seed: this.seed,
          modifier: this.modifier,
          online: Boolean(online)
        });
      });
  }

  private scope(): LeaderboardScope {
    return {
      difficulty: this.result.difficulty,
      daily: this.daily,
      seed: this.seed,
      modifier: this.modifier
    };
  }

  private scoreMetaLabel(): string {
    const mod = RUN_MODIFIERS[this.modifier];
    const modifierText = mod.id === DEFAULT_RUN_MODIFIER ? 'CLASSIC' : mod.shortLabel;
    return `FINAL SCORE \u00B7 ${modifierText} \u00B7 local rank #${this.previewRank}`;
  }

  private matchDuration(): number {
    return DIFFICULTY_PROFILES[this.result.difficulty]?.matchDuration ?? 180;
  }

  private buildCoachingTips(): string[] {
    const s = this.result.state;
    const tips: string[] = [];

    if (s.dangerousActions > 0) {
      tips.push(`Avoid risky deploys: ${s.dangerousActions} dangerous action${plural(s.dangerousActions)} hit build or prod hard.`);
    }
    if (s.criticalMisses > 0) {
      tips.push(`Prioritize pulsing red cards: ${s.criticalMisses} critical miss${plural(s.criticalMisses)} became incident pressure.`);
    }
    if (s.wrongActions >= 4) {
      tips.push(`Slow the input rhythm: ${s.wrongActions} wrong key${plural(s.wrongActions)} reset your combo.`);
    }
    if (s.eventsMissed >= 5) {
      tips.push(`Watch the left edge: ${s.eventsMissed} event${plural(s.eventsMissed)} slipped past the zone.`);
    }
    if (s.techDebt >= 70) {
      tips.push('Tech debt finished high. Clear PLAN lane debt before it accelerates the conveyor.');
    }
    if (s.productionHealth < 45) {
      tips.push('Production got low. Treat Prod Alerts and On-call Pages before lower-value work.');
    }
    if (s.buildStability < 45) {
      tips.push('Build stability got low. Broken tests and merge conflicts need earlier attention.');
    }
    if (s.wavesStarted > 0 && s.wavesCleared === 0) {
      tips.push('Use the wave warning lanes to pre-position before the next incident lands.');
    } else if (s.wavesStarted > 0 && s.wavesCleared === s.wavesStarted) {
      tips.push(`Great wave control: ${s.wavesCleared}/${s.wavesStarted} waves cleared cleanly.`);
    }
    if (s.powerUpsUsed === 0 && this.result.difficulty !== 'training') {
      tips.push('Grab Coffee Breaks and Hotfixes with Space; they turn crowded screens into combo fuel.');
    }
    if (s.wrongActions === 0 && s.eventsMissed === 0) {
      tips.push('Clean execution. Next target: stretch the combo multiplier before the first wave.');
    }

    if (tips.length === 0) {
      tips.push('Good all-round run. Push for longer combos while keeping BUILD and PROD above 80.');
    }

    return tips.slice(0, 3);
  }
}

function plural(value: number): string {
  return value === 1 ? '' : 's';
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
