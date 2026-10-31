'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');

describe('health check', () => {
  it('returns ok', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('notes API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  it('starts with no notes', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a note and returns it', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: '  First note  ', content: 'Hello GitHub' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'First note', content: 'Hello GitHub' });
    expect(typeof res.body.id).toBe('string');
    expect(typeof res.body.createdAt).toBe('string');
  });

  it('fetches a note by id', async () => {
    const created = await request(app)
      .post('/api/notes')
      .send({ title: 'Find me', content: 'Body' });

    const res = await request(app).get(`/api/notes/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Find me');
  });

  it('returns 404 for an unknown note', async () => {
    const res = await request(app).get('/api/notes/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('deletes a note', async () => {
    const created = await request(app)
      .post('/api/notes')
      .send({ title: 'Delete me', content: 'Body' });

    const del = await request(app).delete(`/api/notes/${created.body.id}`);
    expect(del.status).toBe(204);

    const again = await request(app).get(`/api/notes/${created.body.id}`);
    expect(again.status).toBe(404);
  });

  it('returns 404 when deleting a note that does not exist', async () => {
    const res = await request(app).delete('/api/notes/nope');
    expect(res.status).toBe(404);
  });

  it.each([
    ['missing fields', {}],
    ['non-string title', { title: 123, content: 'ok' }],
    ['empty content', { title: 'ok', content: '   ' }],
    ['title too long', { title: 'a'.repeat(101), content: 'ok' }],
    ['content too long', { title: 'ok', content: 'a'.repeat(1001) }],
  ])('rejects invalid input: %s', async (_name, body) => {
    const res = await request(app).post('/api/notes').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('rejects a JSON array body', async () => {
    const res = await request(app).post('/api/notes').send([1, 2, 3]);
    expect(res.status).toBe(400);
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});

describe('security hardening', () => {
  it('sets security headers and hides X-Powered-By', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects oversized request bodies', async () => {
    const res = await request(createApp())
      .post('/api/notes')
      .send({ title: 'big', content: 'a'.repeat(20000) });
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: 'Payload too large' });
  });

  it('does not leak internals on malformed JSON', async () => {
    const res = await request(createApp())
      .post('/api/notes')
      .set('Content-Type', 'application/json')
      .send('{"title": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Bad request' });
    expect(JSON.stringify(res.body)).not.toMatch(/stack|at .*\.js/i);
  });

  it('rate limits the API', async () => {
    const app = createApp({ rateLimitMax: 2 });
    await request(app).get('/api/notes');
    await request(app).get('/api/notes');
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(429);
  });
});
