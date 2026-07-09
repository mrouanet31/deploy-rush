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

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'leaderboard.json');

/**
 * @typedef {Object} Entry
 * @property {string} id
 * @property {string} name
 * @property {number} score
 * @property {number} duration
 * @property {string} title
 * @property {Array<{ id: string, label: string, description: string }>} badges
 * @property {string} difficulty
 * @property {boolean} daily
 * @property {number} seed
 * @property {string} date  ISO string
 */

export class Store {
  constructor() {
    /** @type {Entry[]} */
    this.entries = [];
    this._load();
  }

  _load() {
    try {
      if (existsSync(DATA_FILE)) {
        const raw = readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.entries = parsed;
      }
    } catch (err) {
      console.error('[store] failed to load data file:', err.message);
      this.entries = [];
    }
  }

  _persist() {
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      const tmp = `${DATA_FILE}.tmp`;
      writeFileSync(tmp, JSON.stringify(this.entries, null, 2), 'utf8');
      renameSync(tmp, DATA_FILE); // atomic replace
    } catch (err) {
      console.error('[store] failed to persist data file:', err.message);
    }
  }

  /**
   * @param {Omit<Entry, 'id' | 'date'>} data
   * @returns {{ entry: Entry, rank: number }}
   */
  add(data) {
    /** @type {Entry} */
    const entry = {
      id: cryptoRandomId(),
      date: new Date().toISOString(),
      ...data
    };
    this.entries.push(entry);
    this._persist();
    const board = this.board({ daily: entry.daily, seed: entry.seed, limit: Number.MAX_SAFE_INTEGER });
    const rankIndex = board.findIndex((e) => e.id === entry.id);
    return { entry, rank: rankIndex >= 0 ? rankIndex + 1 : 0 };
  }

  /**
   * Return a ranked board.
   * @param {{ daily: boolean, seed?: number, limit?: number }} opts
   * @returns {Entry[]}
   */
  board({ daily, seed, limit = 10 }) {
    let list = this.entries.filter((e) => Boolean(e.daily) === Boolean(daily));
    if (daily && typeof seed === 'number') {
      list = list.filter((e) => e.seed === seed);
    }
    list.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
    return list.slice(0, limit);
  }

  /** Total number of stored entries. */
  count() {
    return this.entries.length;
  }

  /** Human label for the active backend. */
  get kind() {
    return 'json';
  }
}

function cryptoRandomId() {
  // Node 18+ has global crypto.randomUUID.
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
