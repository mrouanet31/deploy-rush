export class Cooldown {
  private readyAt = 0;
  constructor(private durationMs: number) {}
  canUse(now: number) { return now >= this.readyAt; }
  trigger(now: number) { this.readyAt = now + this.durationMs; }
}
