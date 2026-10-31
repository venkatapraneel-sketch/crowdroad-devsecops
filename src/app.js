'use strict';

const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { NotesStore } = require('./notesStore');
const { validateNote } = require('./validate');

/**
 * Builds the Express app. Taking options here (instead of reading globals)
 * keeps the app easy to test.
 */
function createApp({ rateLimitMax = 100, store = new NotesStore() } = {}) {
  const app = express();

  // Security headers (CSP, nosniff, frameguard, ...) and no "X-Powered-By".
  app.disable('x-powered-by');
  app.use(helmet());

  // Reject oversized request bodies early.
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const api = express.Router();

  // Basic abuse protection for the API routes.
  api.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  api.get('/notes', (_req, res) => {
    res.json(store.list());
  });

  api.get('/notes/:id', (req, res) => {
    const note = store.get(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.json(note);
  });

  api.post('/notes', (req, res) => {
    const result = validateNote(req.body);
    if (!result.valid) {
      return res.status(400).json({ error: 'Validation failed', details: result.errors });
    }
    const note = store.create(result.value);
    return res.status(201).json(note);
  });

  api.delete('/notes/:id', (req, res) => {
    const removed = store.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.status(204).end();
  });

  app.use('/api', api);

  // Unknown route.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler: never leak stack traces or internals to clients.
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    if (err && err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ error: 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
