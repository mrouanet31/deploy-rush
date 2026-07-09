/**
 * LeaderboardService — local persistence via localStorage.
 * No backend, no network. Fails gracefully if storage is unavailable.
 */
import {
  LEADERBOARD_MAX_ENTRIES,
  LEADERBOARD_STORAGE_KEY
} from '../constants';
import { DEFAULT_RUN_MODIFIER } from '../data/runModifiers';
import type { LeaderboardEntry, LeaderboardScope, RunBadge, RunModifierId } from '../types';

export class LeaderboardService {
  static load(scope?: LeaderboardScope): LeaderboardEntry[] {
    return LeaderboardService.sorted(LeaderboardService.loadAll(), scope)
      .slice(0, LEADERBOARD_MAX_ENTRIES);
  }

  private static loadAll(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(LeaderboardService.normalizeEntry)
        .filter((entry): entry is LeaderboardEntry => entry !== null);
    } catch {
      return [];
    }
  }

  /**
   * Adds an entry and returns { entries, rank } where rank is the 1-based
   * position of the newly inserted entry (0 if it did not make the top list).
   */
  static submit(
    entry: LeaderboardEntry,
    scope: LeaderboardScope = LeaderboardService.scopeFromEntry(entry)
  ): { entries: LeaderboardEntry[]; rank: number } {
    const entries = LeaderboardService.loadAll();
    entries.push(entry);
    const scoped = LeaderboardService.sorted(entries, scope);
    const rankIndex = scoped.findIndex((e) => e === entry);
    const trimmed = scoped.slice(0, LEADERBOARD_MAX_ENTRIES);
    LeaderboardService.persist(LeaderboardService.prune(entries));
    const rank = rankIndex >= 0 && rankIndex < LEADERBOARD_MAX_ENTRIES ? rankIndex + 1 : 0;
    return { entries: trimmed, rank };
  }

  /** Rank the given score would achieve without persisting anything. */
  static previewRank(score: number, scope?: LeaderboardScope): number {
    const entries = LeaderboardService.sorted(LeaderboardService.loadAll(), scope);
    const better = entries.filter((e) => e.score >= score).length;
    return better + 1;
  }

  static clear(): void {
    try {
      localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  private static persist(entries: LeaderboardEntry[]): void {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — silently ignore for MVP */
    }
  }

  private static sorted(entries: LeaderboardEntry[], scope?: LeaderboardScope): LeaderboardEntry[] {
    const filtered = scope
      ? entries.filter((entry) => LeaderboardService.matchesScope(entry, scope))
      : entries;
    return filtered.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
  }

  private static matchesScope(entry: LeaderboardEntry, scope: LeaderboardScope): boolean {
    const entryDifficulty = entry.difficulty ?? 'conference';
    const entryDaily = entry.daily ?? false;
    const entrySeed = entry.seed ?? 0;
    const entryModifier = entry.modifier ?? DEFAULT_RUN_MODIFIER;
    const scopeModifier = scope.modifier ?? DEFAULT_RUN_MODIFIER;
    if (entryDifficulty !== scope.difficulty) return false;
    if (entryDaily !== scope.daily) return false;
    if (!scope.daily && entryModifier !== scopeModifier) return false;
    return !scope.daily || entrySeed === scope.seed;
  }

  private static scopeFromEntry(entry: LeaderboardEntry): LeaderboardScope {
    return {
      difficulty: entry.difficulty ?? 'conference',
      daily: entry.daily ?? false,
      seed: entry.seed ?? 0,
      modifier: entry.modifier ?? DEFAULT_RUN_MODIFIER
    };
  }

  private static prune(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const groups = new Map<string, LeaderboardEntry[]>();
    for (const entry of entries) {
      const scope = LeaderboardService.scopeFromEntry(entry);
      const key = `${scope.difficulty}:${scope.daily ? scope.seed : 'global'}:${scope.modifier ?? DEFAULT_RUN_MODIFIER}`;
      const group = groups.get(key) ?? [];
      group.push(entry);
      groups.set(key, group);
    }
    return [...groups.values()].flatMap((group) =>
      LeaderboardService.sorted(group).slice(0, LEADERBOARD_MAX_ENTRIES)
    );
  }

  private static normalizeEntry(value: unknown): LeaderboardEntry | null {
    if (typeof value !== 'object' || value === null) return null;
    const v = value as Record<string, unknown>;
    if (
      typeof v.name !== 'string' ||
      typeof v.score !== 'number' ||
      typeof v.date !== 'string' ||
      typeof v.duration !== 'number' ||
      typeof v.title !== 'string'
    ) {
      return null;
    }

    const difficulty =
      v.difficulty === 'training' ||
      v.difficulty === 'normal' ||
      v.difficulty === 'hard' ||
      v.difficulty === 'conference'
        ? v.difficulty
        : 'conference';
    const daily = typeof v.daily === 'boolean' ? v.daily : false;
    const seed = typeof v.seed === 'number' && Number.isFinite(v.seed) ? v.seed : 0;
    const modifier = normalizeModifier(v.modifier);

    return {
      name: v.name,
      score: v.score,
      date: v.date,
      duration: v.duration,
      title: v.title,
      difficulty,
      daily,
      seed,
      modifier,
      badges: LeaderboardService.normalizeBadges(v.badges)
    };
  }

  private static normalizeBadges(value: unknown): RunBadge[] {
    if (!Array.isArray(value)) return [];
    const badges: RunBadge[] = [];
    const seen = new Set<string>();

    for (const raw of value) {
      if (typeof raw !== 'object' || raw === null) continue;
      const badge = raw as Record<string, unknown>;
      if (
        typeof badge.id !== 'string' ||
        typeof badge.label !== 'string' ||
        typeof badge.description !== 'string'
      ) {
        continue;
      }
      const id = badge.id.trim().slice(0, 32);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      badges.push({
        id,
        label: badge.label.trim().slice(0, 32),
        description: badge.description.trim().slice(0, 120)
      });
      if (badges.length >= 5) break;
    }

    return badges;
  }
}

function normalizeModifier(value: unknown): RunModifierId {
  return value === 'fastPipeline' ||
    value === 'fragileProd' ||
    value === 'techDebtSurge' ||
    value === 'precisionRun'
    ? value
    : DEFAULT_RUN_MODIFIER;
}
