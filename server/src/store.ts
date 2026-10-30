/**
 * Simple JSON-file backed store for leaderboard entries.
 *
 * No native dependencies: entries live in a single JSON file that is read
 * on boot and rewritten (atomically) on every mutation. This keeps the
 * backend trivial to run anywhere `node` is available.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BoardOptions, Entry, Store as StorePort, SubmitData } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'leaderboard.json');

/** Entry as persisted on disk — includes the ip hash, unlike the public Entry shape. */
interface StoredEntry extends Entry {
  ipHash?: string | null;
}

export class Store implements StorePort {
  private readonly dataFile: string;
  private readonly dataDir: string;
  private entries: StoredEntry[] = [];

  /** @param dataFile Override for tests; defaults to server/data/leaderboard.json. */
  constructor(dataFile: string = DATA_FILE) {
    this.dataFile = dataFile;
    this.dataDir = dirname(dataFile);
    this._load();
  }

  private _load(): void {
    try {
      if (existsSync(this.dataFile)) {
        const raw = readFileSync(this.dataFile, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.entries = parsed;
      }
    } catch (err) {
      console.error('[store] failed to load data file:', (err as Error).message);
      this.entries = [];
    }
  }

  private _persist(): void {
    try {
      if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true });
      const tmp = `${this.dataFile}.tmp`;
      writeFileSync(tmp, JSON.stringify(this.entries, null, 2), 'utf8');
      renameSync(tmp, this.dataFile); // atomic replace
    } catch (err) {
      console.error('[store] failed to persist data file:', (err as Error).message);
      // Propagate so callers don't report success (HTTP 201) on a write that
      // never reached disk.
      throw new Error(`failed to persist leaderboard data: ${(err as Error).message}`);
    }
  }

  add(data: SubmitData): { entry: Entry; rank: number } {
    const entry: StoredEntry = {
      id: cryptoRandomId(),
      date: new Date().toISOString(),
      ...data
    };
    this.entries.push(entry);
    this._persist();
    const board = this.board({ daily: entry.daily, seed: entry.seed, limit: Number.MAX_SAFE_INTEGER });
    const rankIndex = board.findIndex((e) => e.id === entry.id);
    return { entry: this._toPublic(entry), rank: rankIndex >= 0 ? rankIndex + 1 : 0 };
  }

  board({ daily, seed, limit = 10 }: BoardOptions): Entry[] {
    let list = this.entries.filter((e) => Boolean(e.daily) === Boolean(daily));
    if (daily && typeof seed === 'number') {
      list = list.filter((e) => e.seed === seed);
    }
    list.sort((a, b) => b.score - a.score || Date.parse(a.date) - Date.parse(b.date));
    return list.slice(0, limit).map((entry) => this._toPublic(entry));
  }

  /** Total number of stored entries. */
  count(): number {
    return this.entries.length;
  }

  /** Human label for the active backend. */
  get kind(): string {
    return 'json';
  }

  /** No-op — kept for interface parity with SqliteStore. */
  close(): void {}

  /** Strip internal fields (e.g. ipHash) — mirrors SqliteStore._toPublic. */
  private _toPublic(entry: StoredEntry): Entry {
    const { id, name, score, duration, title, badges, difficulty, daily, seed, date } = entry;
    return {
      id,
      name,
      score,
      duration,
      title,
      badges: Array.isArray(badges) ? badges : [],
      difficulty,
      daily,
      seed,
      date
    };
  }
}

function cryptoRandomId(): string {
  // Node 18+ has global crypto.randomUUID.
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
