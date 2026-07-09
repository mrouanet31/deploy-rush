/**
 * SQLite-backed store (via better-sqlite3). Same interface as the JSON
 * Store so the two are interchangeable. Uses WAL mode and indexed queries.
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_FILE = join(DATA_DIR, 'leaderboard.db');

// Soft caps to bound growth per board.
const KEEP_GLOBAL = 2000;
const KEEP_PER_DAILY = 500;

export class SqliteStore {
  constructor(dbPath = DB_FILE) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this._migrate();
    this._prepare();
  }

  _migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        score      INTEGER NOT NULL,
        duration   INTEGER NOT NULL,
        title      TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        badges    TEXT NOT NULL DEFAULT '[]',
        daily      INTEGER NOT NULL DEFAULT 0,
        seed       INTEGER NOT NULL DEFAULT 0,
        date       TEXT NOT NULL,
        ip_hash    TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_global ON scores(daily, score DESC, date ASC);
      CREATE INDEX IF NOT EXISTS idx_daily  ON scores(daily, seed, score DESC, date ASC);
    `);
    const columns = this.db.prepare('PRAGMA table_info(scores)').all().map((column) => column.name);
    if (!columns.includes('badges')) {
      this.db.exec("ALTER TABLE scores ADD COLUMN badges TEXT NOT NULL DEFAULT '[]'");
    }
  }

  _prepare() {
    this._insert = this.db.prepare(`
      INSERT INTO scores (id, name, score, duration, title, badges, difficulty, daily, seed, date, ip_hash)
      VALUES (@id, @name, @score, @duration, @title, @badges, @difficulty, @daily, @seed, @date, @ip_hash)
    `);
    this._rankGlobal = this.db.prepare(`
      SELECT COUNT(*) AS c FROM scores
      WHERE daily = 0 AND (score > @score OR (score = @score AND date < @date))
    `);
    this._rankDaily = this.db.prepare(`
      SELECT COUNT(*) AS c FROM scores
      WHERE daily = 1 AND seed = @seed AND (score > @score OR (score = @score AND date < @date))
    `);
    this._boardGlobal = this.db.prepare(`
      SELECT * FROM scores WHERE daily = 0 ORDER BY score DESC, date ASC LIMIT @limit
    `);
    this._boardDaily = this.db.prepare(`
      SELECT * FROM scores WHERE daily = 1 AND seed = @seed ORDER BY score DESC, date ASC LIMIT @limit
    `);
    this._count = this.db.prepare('SELECT COUNT(*) AS c FROM scores');
  }

  /**
   * @param {object} data
   * @returns {{ entry: object, rank: number }}
   */
  add(data) {
    const entry = {
      id: cryptoRandomId(),
      date: new Date().toISOString(),
      ip_hash: data.ipHash ?? null,
      ...data
    };
    // Normalize field the DB expects.
    const row = {
      id: entry.id,
      name: entry.name,
      score: entry.score,
      duration: entry.duration,
      title: entry.title,
      badges: JSON.stringify(Array.isArray(entry.badges) ? entry.badges : []),
      difficulty: entry.difficulty,
      daily: entry.daily ? 1 : 0,
      seed: entry.seed ?? 0,
      date: entry.date,
      ip_hash: entry.ip_hash
    };
    this._insert.run(row);

    const rank =
      (row.daily
        ? this._rankDaily.get({ score: row.score, date: row.date, seed: row.seed })
        : this._rankGlobal.get({ score: row.score, date: row.date })
      ).c + 1;

    this._prune(row.daily, row.seed);

    return { entry: this._toPublic(row), rank };
  }

  /**
   * @param {{ daily: boolean, seed?: number, limit?: number }} opts
   * @returns {object[]}
   */
  board({ daily, seed = 0, limit = 10 }) {
    const rows = daily
      ? this._boardDaily.all({ seed, limit })
      : this._boardGlobal.all({ limit });
    return rows.map((r) => this._toPublic(r));
  }

  count() {
    return this._count.get().c;
  }

  get kind() {
    return 'sqlite';
  }

  _prune(daily, seed) {
    if (daily) {
      this.db
        .prepare(
          `DELETE FROM scores WHERE daily = 1 AND seed = @seed AND id NOT IN (
             SELECT id FROM scores WHERE daily = 1 AND seed = @seed
             ORDER BY score DESC, date ASC LIMIT @keep
           )`
        )
        .run({ seed, keep: KEEP_PER_DAILY });
    } else {
      this.db
        .prepare(
          `DELETE FROM scores WHERE daily = 0 AND id NOT IN (
             SELECT id FROM scores WHERE daily = 0
             ORDER BY score DESC, date ASC LIMIT @keep
           )`
        )
        .run({ keep: KEEP_GLOBAL });
    }
  }

  _toPublic(row) {
    return {
      id: row.id,
      name: row.name,
      score: row.score,
      duration: row.duration,
      title: row.title,
      badges: parseBadges(row.badges),
      difficulty: row.difficulty,
      daily: Boolean(row.daily),
      seed: row.seed,
      date: row.date
    };
  }
}

function parseBadges(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cryptoRandomId() {
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
