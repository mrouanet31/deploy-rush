/**
 * Centralised environment parsing (see PRODUCTION_READINESS.md, A4.3).
 * Values are parsed and normalized once at boot; malformed values throw
 * immediately instead of degrading silently at request time.
 */
import crypto from 'node:crypto';
import type { Config } from './types.js';

const MAX_LIMIT = 50;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Readonly<Config> {
  return Object.freeze({
    port: parsePort(env.PORT),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
    allowedOrigins: splitEnv(env.ALLOWED_ORIGINS),
    extraBlocklist: splitEnv(env.EXTRA_BLOCKLIST),
    submitToken: env.SUBMIT_TOKEN || '',
    ipHashSalt: env.IP_HASH_SALT || crypto.randomBytes(16).toString('hex'),
    ipHashSaltProvided: Boolean(env.IP_HASH_SALT),
    store: (env.STORE ?? '').toLowerCase(),
    nodeEnv: env.NODE_ENV ?? 'development',
    maxLimit: MAX_LIMIT
  });
}

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw === '') return 8787;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0 || n > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got: ${raw}`);
  }
  return n;
}

/** Coerce TRUST_PROXY to a hop count when numeric; otherwise pass through. */
function parseTrustProxy(value: string | undefined): string | number {
  if (value === undefined || value === '') return 'loopback';
  return /^\d+$/.test(value) ? Number(value) : value;
}

function splitEnv(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
