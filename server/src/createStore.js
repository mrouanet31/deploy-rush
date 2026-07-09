/**
 * Store factory — prefers the SQLite backend, falling back to the JSON
 * store if the native module can't be loaded (keeps the server runnable
 * everywhere). Set STORE=json to force the file store.
 */
import { Store as JsonStore } from './store.js';

export async function createStore() {
  const forced = (process.env.STORE ?? '').toLowerCase();

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
