/**
 * Shared backend types — the persistence port contract (see
 * PRODUCTION_READINESS.md, B2) and the shapes crossing the HTTP/store
 * boundary. Kept dependency-free so every module can import from here
 * without cycles.
 */

export interface Badge {
  id: string;
  label: string;
  description: string;
}

export type DifficultyId = 'normal' | 'hard' | 'conference';

/** Publicly-visible leaderboard entry — never includes the ip hash. */
export interface Entry {
  id: string;
  name: string;
  score: number;
  duration: number;
  title: string;
  badges: Badge[];
  difficulty: DifficultyId;
  daily: boolean;
  seed: number;
  /** ISO date string. */
  date: string;
}

/** A submission once validated, before the store assigns id/date. */
export interface ValidatedSubmission {
  name: string;
  score: number;
  duration: number;
  title: string;
  badges: Badge[];
  difficulty: DifficultyId;
  daily: boolean;
  seed: number;
}

/** What Store.add() accepts: a validated submission plus the caller's ip hash. */
export interface SubmitData extends ValidatedSubmission {
  ipHash: string | null;
}

export interface BoardOptions {
  daily: boolean;
  seed?: number;
  limit?: number;
}

interface ValidationFailure {
  ok: false;
  status: number;
  error: string;
}

export type ValidationResult = { ok: true; value: ValidatedSubmission } | ValidationFailure;

/**
 * Persistence port implemented by both the JSON and SQLite stores. A new
 * backend must satisfy this contract (see store.conformance.test.ts).
 */
export interface Store {
  add(data: SubmitData): { entry: Entry; rank: number } | Promise<{ entry: Entry; rank: number }>;
  board(opts: BoardOptions): Entry[] | Promise<Entry[]>;
  count(): number | Promise<number>;
  readonly kind: string;
  close(): void;
}

/** Frozen result of config.ts's loadConfig(). */
export interface Config {
  readonly port: number;
  readonly trustProxy: string | number;
  readonly allowedOrigins: string[];
  readonly extraBlocklist: string[];
  readonly submitToken: string;
  readonly ipHashSalt: string;
  readonly ipHashSaltProvided: boolean;
  readonly store: string;
  readonly nodeEnv: string;
  readonly maxLimit: number;
}
