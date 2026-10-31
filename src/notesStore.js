'use strict';

const { randomUUID } = require('node:crypto');

/**
 * Minimal in-memory store for notes.
 * Data is lost when the process restarts, which is fine for this demo:
 * the focus of the project is the secure GitHub workflow around the app.
 */
class NotesStore {
  constructor() {
    this.notes = new Map();
  }

  list() {
    return [...this.notes.values()];
  }

  get(id) {
    return this.notes.get(id);
  }

  create({ title, content }) {
    const note = {
      id: randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    this.notes.set(note.id, note);
    return note;
  }

  remove(id) {
    return this.notes.delete(id);
  }

  clear() {
    this.notes.clear();
  }
}

module.exports = { NotesStore };
