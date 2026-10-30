/**
 * HTTP integration tests for the Express app factory (see
 * PRODUCTION_READINESS.md, A0.1). Uses a fake in-memory store so these
 * tests never touch a real file or database — only createApp()'s wiring
 * (middleware order, auth, rate limits, error handling) is under test.
 * Store behaviour itself is covered by store.conformance.test.ts.
 */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import type { Entry, Store, SubmitData } from './types.js';

function createFakeStore(overrides: Partial<Store> = {}): Store {
  const entries: Entry[] = [];
  return {
    kind: 'fake',
    add(data: SubmitData) {
      const entry: Entry = { id: `id-${entries.length + 1}`, date: new Date().toISOString(), ...data };
      entries.push(entry);
      const board = entries.filter((e) => Boolean(e.daily) === Boolean(data.daily));
      const rank = board.findIndex((e) => e.id === entry.id) + 1;
      return { entry, rank };
    },
    board({ daily, seed = 0 }) {
      return entries.filter((e) => Boolean(e.daily) === Boolean(daily) && (!daily || e.seed === seed));
    },
    count() {
      return entries.length;
    },
    close() {},
    ...overrides
  };
}

function buildApp(envOverrides: NodeJS.ProcessEnv = {}, storeOverrides: Partial<Store> = {}) {
  const config = loadConfig({ ...envOverrides });
  const store = createFakeStore(storeOverrides);
  return { app: createApp({ store, config }), store };
}

const validPayload = () => ({
  name: 'Tester',
  score: 1000,
  duration: 60,
  title: 'Chaos Engineer',
  badges: [],
  difficulty: 'conference',
  daily: false,
  seed: 0
});

describe('createApp', () => {
  it('reports health with the store kind and entry count', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, store: 'fake', entries: 0 });
  });

  it('returns an empty global board by default', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/leaderboard/global');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mode: 'global', entries: [] });
  });

  it('rejects a daily board request without a seed', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/leaderboard/daily');
    expect(res.status).toBe(400);
  });

  it('accepts a valid score submission and returns a rank', async () => {
    const { app } = buildApp();
    const res = await request(app).post('/api/scores').send(validPayload());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ rank: 1 });
    expect(res.body.entries).toHaveLength(1);
  });

  it('rejects an invalid score submission', async () => {
    const { app } = buildApp();
    const res = await request(app)
      .post('/api/scores')
      .send({ ...validPayload(), score: -1 });
    expect(res.status).toBe(400);
  });

  it('requires the submit token when SUBMIT_TOKEN is configured', async () => {
    const { app } = buildApp({ SUBMIT_TOKEN: 'secret' });
    const res = await request(app).post('/api/scores').send(validPayload());
    expect(res.status).toBe(401);
  });

  it('accepts the submit token via x-api-key', async () => {
    const { app } = buildApp({ SUBMIT_TOKEN: 'secret' });
    const res = await request(app)
      .post('/api/scores')
      .set('x-api-key', 'secret')
      .send(validPayload());
    expect(res.status).toBe(201);
  });

  it('rejects payloads over the body size limit', async () => {
    const { app } = buildApp();
    const res = await request(app)
      .post('/api/scores')
      .send({ ...validPayload(), name: 'a'.repeat(20000) });
    expect(res.status).toBe(413);
  });

  it('rejects malformed JSON bodies', async () => {
    const { app } = buildApp();
    const res = await request(app)
      .post('/api/scores')
      .set('Content-Type', 'application/json')
      .send('{not-json');
    expect(res.status).toBe(400);
  });

  it('rejects disallowed origins when an allowlist is configured', async () => {
    const { app } = buildApp({ ALLOWED_ORIGINS: 'https://deploy-rush.example.com' });
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
    expect(res.status).toBe(403);
  });

  it('allows a listed origin', async () => {
    const { app } = buildApp({ ALLOWED_ORIGINS: 'https://deploy-rush.example.com' });
    const res = await request(app).get('/api/health').set('Origin', 'https://deploy-rush.example.com');
    expect(res.status).toBe(200);
  });

  it('returns 404 for unknown API routes', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('returns 500 without leaking internals when the store fails to persist', async () => {
    const { app } = buildApp(
      {},
      {
        add: () => {
          throw new Error('disk full');
        }
      }
    );
    const res = await request(app).post('/api/scores').send(validPayload());
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'failed to save score' });
  });
});
