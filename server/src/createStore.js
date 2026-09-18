/**
 * Store factory.
 *
 * - Uses Supabase when explicitly requested or when Supabase configuration is
 *   present.
 * - Otherwise keeps the original SQLite -> JSON fallback for local/offline
 *   development.
 */
import { Store as JsonStore } from './store.js';
import { hasSupabaseConfig, SupabaseStore } from './supabaseStore.js';

export async function createStore() {
  const forced = (process.env.STORE ?? '').toLowerCase();

  if (forced === 'supabase' || (!forced && hasSupabaseConfig())) {
    console.log('[deploy-rush] store: supabase');
    return new SupabaseStore();
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
    console.warn('[deploy-rush] sqlite unavailable, falling back to JSON store:', err.message);
    return new JsonStore();
  }
}
