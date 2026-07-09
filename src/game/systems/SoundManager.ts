/**
 * SoundManager — asset-free synthetic audio via the Web Audio API:
 * short SFX blips plus a lightweight procedural music loop (bass + arpeggio
 * with an intensity-driven sparkle layer). SFX and music toggle independently
 * and never block gameplay if audio is unavailable.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true; // SFX master
  private musicEnabled = true;

  // Music engine state.
  private musicBus: GainNode | null = null;
  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private intensity = 0;

  private readonly SECONDS_PER_STEP = 60 / 108 / 2; // 8th notes at 108 BPM
  // A-minor pentatonic arpeggio (16 steps) over an Am–F–C–G bass.
  private readonly LEAD = [
    220, 261.63, 329.63, 440, 392, 329.63, 293.66, 261.63,
    220, 261.63, 329.63, 392, 440, 392, 329.63, 293.66
  ];
  private readonly BASS = [110, 87.31, 130.81, 98.0];

  constructor() {
    // AudioContext is created lazily on first sound (after a user gesture),
    // which browsers require for autoplay policies.
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  private ensureCtx(): AudioContext | null {
    if (!this.enabled && !this.musicEnabled) return null;
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return null;
        this.ctx = new Ctor();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private blip(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    gain = 0.08,
    freqEnd?: number
  ): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
    }
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  success(): void {
    this.blip(660, 0.12, 'square', 0.06, 880);
  }

  combo(): void {
    this.blip(880, 0.14, 'triangle', 0.07, 1320);
  }

  ship(): void {
    this.blip(523, 0.1, 'triangle', 0.07);
    window.setTimeout(() => this.blip(784, 0.16, 'triangle', 0.07), 90);
  }

  error(): void {
    this.blip(180, 0.18, 'sawtooth', 0.07, 90);
  }

  incident(): void {
    this.blip(120, 0.35, 'sawtooth', 0.09, 60);
  }

  warning(): void {
    this.blip(330, 0.09, 'square', 0.045, 440);
    window.setTimeout(() => this.blip(440, 0.12, 'square', 0.05, 660), 120);
  }

  move(): void {
    this.blip(420, 0.05, 'square', 0.03);
  }

  select(): void {
    this.blip(600, 0.07, 'square', 0.05, 720);
  }

  // ---- Procedural music ----------------------------------------------

  get isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  setMusicEnabled(value: boolean): void {
    this.musicEnabled = value;
    if (!value) this.stopMusic();
  }

  toggleMusic(): boolean {
    this.setMusicEnabled(!this.musicEnabled);
    return this.musicEnabled;
  }

  setMusicIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value));
  }

  startMusic(): void {
    if (!this.musicEnabled || this.musicTimer !== null) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    this.musicBus = ctx.createGain();
    this.musicBus.gain.setValueAtTime(0.55, ctx.currentTime);
    this.musicBus.connect(ctx.destination);
    this.step = 0;
    this.nextNoteTime = ctx.currentTime + 0.1;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 25);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (ctx && bus) {
      const now = ctx.currentTime;
      try {
        bus.gain.cancelScheduledValues(now);
        bus.gain.setValueAtTime(bus.gain.value, now);
        bus.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      } catch {
        /* ignore */
      }
      window.setTimeout(() => {
        try {
          bus.disconnect();
        } catch {
          /* ignore */
        }
      }, 220);
    }
    this.musicBus = null;
  }

  private scheduleMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicEnabled || !this.musicBus) return;
    const lookahead = 0.12;
    while (this.nextNoteTime < ctx.currentTime + lookahead) {
      this.playMusicStep(ctx, this.step, this.nextNoteTime);
      this.nextNoteTime += this.SECONDS_PER_STEP;
      this.step = (this.step + 1) % 16;
    }
  }

  private playMusicStep(ctx: AudioContext, step: number, t: number): void {
    const bus = this.musicBus;
    if (!bus) return;
    const lead = this.LEAD[step];
    const leadPeak = 0.03 + 0.035 * this.intensity;
    this.tone(ctx, bus, lead, t, 0.22, 'triangle', leadPeak);

    // Bass on the downbeat of each 4-step bar.
    if (step % 4 === 0) {
      const bass = this.BASS[(step / 4) % this.BASS.length];
      this.tone(ctx, bus, bass, t, 0.5, 'square', 0.06);
    }

    // Sparkle octave layer when the run heats up.
    if (this.intensity > 0.55 && step % 2 === 0) {
      this.tone(ctx, bus, lead * 2, t, 0.12, 'square', 0.018);
    }
  }

  private tone(
    ctx: AudioContext,
    bus: GainNode,
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    peak: number
  ): void {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(peak, start + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp).connect(bus);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }
}
