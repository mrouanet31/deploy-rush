/**
 * VersusLobbyScene — pre-duel pairing screen. Each player confirms on their
 * own controller before the local 1v1 starts.
 */
import Phaser from 'phaser';
import { Colors, CssColors, GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants';
import { GamepadController } from '../systems/GamepadController';
import { InputDeviceService } from '../systems/InputDeviceService';
import { SoundManager } from '../systems/SoundManager';
import { bodyStyle, createBackdrop, panel, titleStyle } from '../ui';
import type { NavIntent } from '../systems/InputController';

interface VersusLobbyData {
  sound?: SoundManager;
}

interface ColorChoice {
  name: string;
  color: number;
}

interface SlotState {
  id: 'P1' | 'P2';
  title: string;
  padLabel: string;
  padSlot: 0 | 1;
  ready: boolean;
  colorIndex: number;
}

interface SlotView {
  panel: Phaser.GameObjects.Rectangle;
  stripe: Phaser.GameObjects.Rectangle;
  statusText: Phaser.GameObjects.Text;
  deviceText: Phaser.GameObjects.Text;
  avatarGlow: Phaser.GameObjects.Arc;
  avatarBody: Phaser.GameObjects.Rectangle;
  avatarFace: Phaser.GameObjects.Text;
  colorText: Phaser.GameObjects.Text;
  readyText: Phaser.GameObjects.Text;
  hintText: Phaser.GameObjects.Text;
  swatches: Phaser.GameObjects.Rectangle[];
}

const DUEL_COLORS: ColorChoice[] = [
  { name: 'CYAN', color: Colors.cyan },
  { name: 'PURPLE', color: Colors.purple },
  { name: 'GREEN', color: Colors.green },
  { name: 'ORANGE', color: Colors.orange },
  { name: 'YELLOW', color: Colors.yellow },
  { name: 'RED', color: Colors.red }
];

export class VersusLobbyScene extends Phaser.Scene {
  private soundMgr!: SoundManager;
  private p1!: SlotState;
  private p2!: SlotState;
  private p1View!: SlotView;
  private p2View!: SlotView;
  private p1GamepadCtl!: GamepadController;
  private p2GamepadCtl!: GamepadController;
  private launchText!: Phaser.GameObjects.Text;
  private launchTimer?: Phaser.Time.TimerEvent;
  private readonly keyboardBack = () => this.backToModes();

  constructor() {
    super(SceneKeys.VersusLobby);
  }

  init(data: VersusLobbyData): void {
    this.soundMgr = data.sound ?? new SoundManager();
    this.p1 = {
      id: 'P1',
      title: 'PLAYER 1',
      padLabel: 'PAD 1',
      padSlot: 0,
      ready: false,
      colorIndex: 0
    };
    this.p2 = {
      id: 'P2',
      title: 'PLAYER 2',
      padLabel: 'PAD 2',
      padSlot: 1,
      ready: false,
      colorIndex: 1
    };
    this.launchTimer = undefined;
  }

  create(): void {
    createBackdrop(this);
    this.add.text(GAME_WIDTH / 2, 78, 'LOCAL DUEL', titleStyle(52)).setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 124, 'Pair two controllers, pick colors, then ready up', bodyStyle(16, CssColors.textDim))
      .setOrigin(0.5);

    this.p1View = this.renderSlot(this.p1, GAME_WIDTH / 2 - 232);
    this.p2View = this.renderSlot(this.p2, GAME_WIDTH / 2 + 232);

    this.launchText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 72, '', {
        ...bodyStyle(24, CssColors.green),
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'B / ESC back to mode select', bodyStyle(15, CssColors.textDim))
      .setOrigin(0.5);

    this.bindKeys();
    this.bindGamepads();
    this.refresh();
  }

  update(): void {
    this.refresh();
    this.scheduleLaunchIfReady();
  }

  private renderSlot(state: SlotState, x: number): SlotView {
    const choice = DUEL_COLORS[state.colorIndex];
    const card = panel(this, x, 338, 410, 370, choice.color);
    const stripe = this.add.rectangle(x - 185, 338, 5, 326, choice.color, 0.95);
    this.add
      .text(x, 184, state.title, {
        ...bodyStyle(25, CssColors.white),
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.add
      .text(x, 216, state.padLabel, bodyStyle(16, colorToCss(choice.color)))
      .setOrigin(0.5);
    const statusText = this.add.text(x, 248, '', bodyStyle(17, CssColors.text)).setOrigin(0.5);
    const deviceText = this.add
      .text(x, 276, '', {
        ...bodyStyle(12, CssColors.textDim),
        align: 'center',
        wordWrap: { width: 320 }
      })
      .setOrigin(0.5);

    const avatarGlow = this.add
      .circle(x, 348, 54, choice.color, 0.2)
      .setStrokeStyle(3, choice.color, 0.55)
      .setBlendMode(Phaser.BlendModes.ADD);
    const avatarBody = this.add
      .rectangle(x, 348, 66, 66, Colors.panelLight)
      .setStrokeStyle(4, choice.color);
    const avatarFace = this.add
      .text(x, 348, '\u2B22', {
        fontFamily: 'Consolas, monospace',
        fontSize: '42px',
        color: colorToCss(choice.color),
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const swatches = DUEL_COLORS.map((colorChoice, i) =>
      this.add
        .rectangle(x - 75 + i * 30, 432, 22, 22, colorChoice.color, 0.9)
        .setStrokeStyle(2, Colors.bg, 0.9)
    );
    const colorText = this.add
      .text(x, 466, '', bodyStyle(18, colorToCss(choice.color)))
      .setOrigin(0.5);
    const readyText = this.add
      .text(x, 494, '', {
        ...bodyStyle(23, CssColors.green),
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    const hintText = this.add
      .text(x, 540, '', {
        ...bodyStyle(12, CssColors.textDim),
        align: 'center',
        wordWrap: { width: 330 }
      })
      .setOrigin(0.5);

    return {
      panel: card,
      stripe,
      statusText,
      deviceText,
      avatarGlow,
      avatarBody,
      avatarFace,
      colorText,
      readyText,
      hintText,
      swatches
    };
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.on('keydown-ESC', this.keyboardBack);
  }

  private bindGamepads(): void {
    this.p1GamepadCtl = new GamepadController(this, {
      onNav: (intent) => this.handleGamepadNav(this.p1, intent),
      onConfirm: () => this.toggleReady(this.p1),
      onBack: () => this.cancelReadyOrBack(this.p1),
      onPause: () => this.launchIfReady()
    }, { padSlot: this.p1.padSlot });

    this.p2GamepadCtl = new GamepadController(this, {
      onNav: (intent) => this.handleGamepadNav(this.p2, intent),
      onConfirm: () => this.toggleReady(this.p2),
      onBack: () => this.cancelReadyOrBack(this.p2),
      onPause: () => this.launchIfReady()
    }, { padSlot: this.p2.padSlot });
  }

  private handleGamepadNav(state: SlotState, intent: NavIntent): void {
    if (intent === 'LEFT') this.moveColor(state, -1);
    else if (intent === 'RIGHT') this.moveColor(state, 1);
  }

  private moveColor(state: SlotState, delta: -1 | 1): void {
    const other = state.id === 'P1' ? this.p2 : this.p1;
    let next = state.colorIndex;
    for (let i = 0; i < DUEL_COLORS.length; i += 1) {
      next = Phaser.Math.Wrap(next + delta, 0, DUEL_COLORS.length);
      if (next !== other.colorIndex) break;
    }
    if (next === state.colorIndex) return;
    state.colorIndex = next;
    state.ready = false;
    this.cancelLaunch();
    this.soundMgr.move();
    this.refresh();
  }

  private toggleReady(state: SlotState): void {
    if (!this.canReady(state)) {
      this.soundMgr.error();
      return;
    }
    state.ready = !state.ready;
    if (!state.ready) this.cancelLaunch();
    this.soundMgr.select();
    this.refresh();
  }

  private cancelReadyOrBack(state: SlotState): void {
    if (state.ready) {
      state.ready = false;
      this.cancelLaunch();
      this.soundMgr.move();
      return;
    }
    this.backToModes();
  }

  private refresh(): void {
    this.refreshSlot(this.p1, this.p1View);
    this.refreshSlot(this.p2, this.p2View);
    if (!this.launchTimer) {
      this.launchText.setText(this.bothReady() ? 'READY TO DEPLOY' : this.waitingLabel());
      this.launchText.setColor(this.bothReady() ? CssColors.green : CssColors.textDim);
    }
  }

  private refreshSlot(state: SlotState, view: SlotView): void {
    if (!this.canReady(state)) state.ready = false;

    const pad = this.pad(state.padSlot);
    const connected = Boolean(pad?.connected);
    const choice = DUEL_COLORS[state.colorIndex];
    const online = this.canReady(state);
    const status = connected
      ? `${state.padLabel} ONLINE`
      : `WAITING FOR ${state.padLabel}`;
    const device = connected
      ? shortPadName(pad?.id ?? state.padLabel)
      : `Connect ${state.padLabel.toLowerCase()}, then press A`;

    view.panel.setFillStyle(state.ready ? Colors.bgAlt : Colors.panel, state.ready ? 0.98 : 0.92);
    view.panel.setStrokeStyle(state.ready ? 4 : 2, state.ready ? choice.color : online ? Colors.panelLight : Colors.red, state.ready ? 1 : 0.75);
    view.panel.setAlpha(online ? 1 : 0.82);
    view.stripe.setFillStyle(choice.color, online ? 0.95 : 0.35);
    view.statusText.setText(status);
    view.statusText.setColor(online ? CssColors.text : CssColors.red);
    view.deviceText.setText(device);
    view.avatarGlow.setFillStyle(choice.color, online ? 0.22 : 0.08);
    view.avatarGlow.setStrokeStyle(3, choice.color, online ? 0.55 : 0.22);
    view.avatarBody.setStrokeStyle(state.ready ? 5 : 4, choice.color, online ? 1 : 0.45);
    view.avatarFace.setText(state.ready ? '\u2713' : '\u2B22');
    view.avatarFace.setColor(colorToCss(choice.color));
    view.colorText.setText(`\u2190 ${choice.name} \u2192`);
    view.colorText.setColor(colorToCss(choice.color));
    view.readyText.setText(this.readyLabel(state));
    view.readyText.setColor(state.ready ? CssColors.green : online ? CssColors.yellow : CssColors.textDim);
    view.hintText.setText(this.hintLabel(state, connected));
    view.swatches.forEach((swatch, i) => {
      const selected = i === state.colorIndex;
      swatch.setAlpha(selected ? 1 : 0.82);
      swatch.setStrokeStyle(selected ? 3 : 2, selected ? Colors.white : Colors.bg, selected ? 1 : 0.9);
    });
  }

  private readyLabel(state: SlotState): string {
    if (state.ready) return 'READY';
    if (!this.canReady(state)) return `CONNECT ${state.padLabel}`;
    return 'PRESS A TO READY';
  }

  private hintLabel(state: SlotState, connected: boolean): string {
    if (!connected) return `${state.padLabel}: press any button to pair`;
    return `${state.padLabel}: D-pad left/right color, A ready`;
  }

  private waitingLabel(): string {
    if (!this.p1.ready) return this.canReady(this.p1) ? 'WAITING FOR P1' : 'CONNECT PAD 1';
    if (!this.p2.ready) return this.canReady(this.p2) ? 'WAITING FOR P2' : 'CONNECT PAD 2';
    return 'WAITING';
  }

  private scheduleLaunchIfReady(): void {
    if (!this.bothReady()) {
      this.cancelLaunch();
      return;
    }
    if (this.launchTimer) return;
    this.launchText.setText('DEPLOYING DUEL...');
    this.launchText.setColor(CssColors.green);
    this.soundMgr.combo();
    this.launchTimer = this.time.delayedCall(700, () => this.launchIfReady());
  }

  private launchIfReady(): void {
    if (!this.bothReady()) {
      this.cancelLaunch();
      return;
    }
    const p1Color = DUEL_COLORS[this.p1.colorIndex].color;
    const p2Color = DUEL_COLORS[this.p2.colorIndex].color;
    this.cleanup();
    this.scene.start(SceneKeys.Versus, { sound: this.soundMgr, p1Color, p2Color });
  }

  private bothReady(): boolean {
    return this.p1.ready && this.p2.ready && this.canReady(this.p1) && this.canReady(this.p2);
  }

  private canReady(state: SlotState): boolean {
    return Boolean(this.pad(state.padSlot)?.connected);
  }

  private pad(slot: number): Phaser.Input.Gamepad.Gamepad | null {
    return InputDeviceService.getLogicalGamepad(this, slot);
  }

  private cancelLaunch(): void {
    if (!this.launchTimer) return;
    this.launchTimer.remove(false);
    this.launchTimer = undefined;
  }

  private backToModes(): void {
    this.soundMgr.select();
    this.cleanup();
    this.scene.start(SceneKeys.DifficultySelect, { sound: this.soundMgr });
  }

  private cleanup(): void {
    this.cancelLaunch();
    const kb = this.input.keyboard;
    if (kb) {
      kb.off('keydown-ESC', this.keyboardBack);
    }
    this.p1GamepadCtl?.destroy();
    this.p2GamepadCtl?.destroy();
  }
}

function shortPadName(id: string): string {
  return id.replace(/\s+\(.+\)$/u, '').slice(0, 34);
}

function colorToCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
