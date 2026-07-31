import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_CONTENT_LENGTH,
  slugify,
  validatePostPayload,
} from '../api/posts.js';

const validPost = {
  id: 'new-admin-post',
  title: 'New Admin Post',
  subtitle: 'A subtitle',
  date: '2026-07-31',
  readTime: '4 min read',
  tags: ['security', 'writing'],
  category: 'note',
  excerpt: 'A short excerpt.',
  content: '## Body\n\nPost body.',
  coverEmoji: '*',
  status: 'draft',
};

test('slugify creates lowercase slugs', () => {
  assert.equal(slugify(' Hello, Admin Post! '), 'hello-admin-post');
});

test('validatePostPayload accepts a valid draft', () => {
  assert.deepEqual(validatePostPayload(validPost).value, validPost);
});

test('validatePostPayload can derive an id from the title', () => {
  const result = validatePostPayload({ ...validPost, id: '' });
  assert.equal(result.value.id, 'new-admin-post');
});

test('validatePostPayload rejects reserved static ids', () => {
  assert.equal(validatePostPayload({ ...validPost, id: 'the-statistical-silence' }).error, 'id is reserved by a static post');
});

test('validatePostPayload rejects invalid categories and statuses', () => {
  assert.equal(validatePostPayload({ ...validPost, category: 'bad' }).error, 'category is invalid');
  assert.equal(validatePostPayload({ ...validPost, status: 'live' }).error, 'status is invalid');
});

test('validatePostPayload rejects invalid dates and oversized content', () => {
  assert.equal(validatePostPayload({ ...validPost, date: '07/31/2026' }).error, 'date must use YYYY-MM-DD format');
  assert.equal(validatePostPayload({ ...validPost, content: 'x'.repeat(MAX_CONTENT_LENGTH + 1) }).error, `content must be ${MAX_CONTENT_LENGTH} characters or fewer`);
});