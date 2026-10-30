/**
 * Store factory — prefers the SQLite backend, falling back to the JSON
 * store if the native module can't be loaded (keeps the server runnable
 * everywhere). Pass 'json' to force the file store.
 */
import { Store as JsonStore } from './store.js';
import { SupabaseEdgeStore } from './SupabaseEdgeStore.js';
import type { Store } from './types.js';

/** @param forcedKind Defaults to process.env.STORE for backward compatibility. */
export async function createStore(
  forcedKind: string = (process.env.STORE ?? '').toLowerCase()
): Promise<Store> {
  const forced = forcedKind;

  if (forced === 'supabase' || (!forced && process.env.SUPABASE_URL)) {
    return new SupabaseEdgeStore();
  }

  if (forced === 'json') {
    return new JsonStore();
  }

  try {
    const { SqliteStore } = await import('./store-sqlite.js');
    const store = new SqliteStore();
    console.log('[deploy-rush] store: sqlite');
    return store;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (forced === 'sqlite') {
      // Explicitly requested — don't silently degrade to the unbounded JSON
      // fallback; the operator needs to know sqlite is broken.
      throw new Error(`sqlite store required (STORE=sqlite) but failed to initialize: ${message}`);
    }
    console.warn('[deploy-rush] sqlite unavailable, falling back to JSON store:', message);
    return new JsonStore();
  }
}
