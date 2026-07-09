/**
 * LeaderboardApi — thin client for the optional online leaderboard backend.
 *
 * Every call is best-effort: on any network/timeout/parse error it resolves
 * to null so the game can fall back to the local leaderboard and never
 * blocks on the network.
 */
import type { DifficultyId, LeaderboardEntry, RunBadge } from '../types';

/** Base path — proxied to the backend by Vite in dev (see vite.config.ts). */
const API_BASE = '/api';
const TIMEOUT_MS = 2500;

/**
 * Optional API key for locked-down deployments (backend `SUBMIT_TOKEN`).
 * Set `VITE_SUBMIT_TOKEN` at build/dev time to have the client send it.
 */
const SUBMIT_TOKEN = import.meta.env.VITE_SUBMIT_TOKEN ?? '';

export interface OnlineEntry extends LeaderboardEntry {
  id: string;
  difficulty: DifficultyId;
  daily: boolean;
  seed: number;
}

export interface SubmitPayload {
  name: string;
  score: number;
  duration: number;
  title: string;
  badges: RunBadge[];
  difficulty: string;
  daily: boolean;
  seed: number;
}

export class LeaderboardApi {
  /** Quick availability probe. */
  static async isOnline(): Promise<boolean> {
    const data = await getJson<{ ok: boolean }>(`${API_BASE}/health`);
    return data?.ok === true;
  }

  static async fetchGlobal(limit = 10): Promise<OnlineEntry[] | null> {
    const data = await getJson<{ entries: OnlineEntry[] }>(
      `${API_BASE}/leaderboard/global?limit=${limit}`
    );
    return data?.entries ?? null;
  }

  static async fetchDaily(seed: number, limit = 10): Promise<OnlineEntry[] | null> {
    const data = await getJson<{ entries: OnlineEntry[] }>(
      `${API_BASE}/leaderboard/daily?seed=${seed}&limit=${limit}`
    );
    return data?.entries ?? null;
  }

  /** Returns the online rank (1-based) or null on failure. */
  static async submit(payload: SubmitPayload): Promise<{ rank: number; entries: OnlineEntry[] } | null> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (SUBMIT_TOKEN) headers['x-api-key'] = SUBMIT_TOKEN;
    const data = await request<{ rank: number; entries: OnlineEntry[] }>(`${API_BASE}/scores`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!data) return null;
    return { rank: data.rank, entries: data.entries ?? [] };
  }
}

async function getJson<T>(url: string): Promise<T | null> {
  return request<T>(url, { method: 'GET' });
}

async function request<T>(url: string, init: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
