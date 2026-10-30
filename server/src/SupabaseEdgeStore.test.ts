import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { SupabaseEdgeStore } from './SupabaseEdgeStore.js';

afterEach(() => vi.unstubAllGlobals());

const entry = {
  id: 'score-1', name: 'Tester', score: 100, duration: 60,
  title: 'Chaos Engineer', badges: [], difficulty: 'conference',
  daily: false, seed: 0, date: '2026-10-28T10:00:00.000Z'
};

function app() {
  return createApp({
    store: new SupabaseEdgeStore('https://example.supabase.co/'),
    config: loadConfig({})
  });
}

describe('Supabase Edge store through Express', () => {
  it('awaits the remote health count', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ entries: 12 }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await request(app()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, store: 'supabase', entries: 12 });
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.supabase.co/functions/v1/deploy-rush-api/health');
  });

  it.each(['global', 'daily?seed=20261028'])('awaits the remote %s board', async (board) => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ entries: [entry] }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await request(app()).get(`/api/leaderboard/${board}`);
    expect(response.status).toBe(200);
    expect(response.body.entries).toEqual([entry]);
    if (board.startsWith('daily')) expect(fetchMock.mock.calls[0][0]).toContain('seed=20261028');
  });

  it('awaits submission and board without exposing the internal IP hash', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ id: entry.id, rank: 1, entries: [entry] }))
      .mockResolvedValueOnce(Response.json({ entries: [entry] }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await request(app()).post('/api/scores').send(entry);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: entry.id, rank: 1, entries: [entry] });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('ipHash');
  });

  it('handles a score below the remote top ten', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ id: entry.id, rank: 42, entries: [] })));
    const { id: _id, date: _date, ...submission } = entry;
    const result = await new SupabaseEdgeStore('https://example.supabase.co').add({
      ...submission, difficulty: 'conference', ipHash: null
    });
    expect(result.rank).toBe(42);
    expect(result.entry.id).toBe(entry.id);
  });

  it('forwards remote read failures to the Express error handler', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
    const response = await request(app()).get('/api/leaderboard/global');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'internal error' });
  });

  it('returns a save failure for remote write failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    const response = await request(app()).post('/api/scores').send(entry);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'failed to save score' });
  });

  it('fails explicitly when Supabase was requested without a URL', () => {
    expect(() => new SupabaseEdgeStore('')).toThrow('SUPABASE_URL is required');
  });
});