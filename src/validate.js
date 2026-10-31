'use strict';

const TITLE_MAX = 100;
const CONTENT_MAX = 1000;

/**
 * Validates the body of a "create note" request.
 * Returns { valid: true, value } or { valid: false, errors }.
 * Never trusts the shape or type of user input.
 */
function validateNote(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const { title, content } = body;
  const errors = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  } else if (title.trim().length > TITLE_MAX) {
    errors.push(`title must be at most ${TITLE_MAX} characters`);
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    errors.push('content is required and must be a non-empty string');
  } else if (content.trim().length > CONTENT_MAX) {
    errors.push(`content must be at most ${CONTENT_MAX} characters`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: { title: title.trim(), content: content.trim() },
  };
}

module.exports = { validateNote, TITLE_MAX, CONTENT_MAX };
