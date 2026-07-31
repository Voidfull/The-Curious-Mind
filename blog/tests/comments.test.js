import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_COMMENT_LIMIT,
  MAX_CONTENT_LENGTH,
  RATE_LIMIT_MAX_REQUESTS,
  checkRateLimit,
  parseCommentLimit,
  resetRateLimitsForTest,
  validateCommentBody,
  validatePostId,
} from '../api/comments.js';

const validPostId = 'the-statistical-silence';

function reqFromIp(ip) {
  return {
    headers: {
      'x-forwarded-for': ip,
    },
  };
}

test('validatePostId accepts known posts', () => {
  assert.deepEqual(validatePostId(validPostId), { value: validPostId });
});

test('validatePostId rejects unknown posts', () => {
  assert.equal(validatePostId('unknown-post').error, 'Unknown postId');
});

test('validateCommentBody normalizes a valid anonymous comment', () => {
  assert.deepEqual(validateCommentBody({
    post_id: validPostId,
    username: '   ',
    content: '  hello world  ',
  }), {
    value: {
      post_id: validPostId,
      username: 'anonymous',
      content: 'hello world',
    },
  });
});

test('validateCommentBody rejects non-string content', () => {
  assert.equal(validateCommentBody({
    post_id: validPostId,
    content: { text: 'hello' },
  }).error, 'content must be a string');
});

test('validateCommentBody rejects oversized content', () => {
  assert.equal(validateCommentBody({
    post_id: validPostId,
    content: 'x'.repeat(MAX_CONTENT_LENGTH + 1),
  }).error, `content must be ${MAX_CONTENT_LENGTH} characters or fewer`);
});

test('parseCommentLimit defaults and enforces the hard limit', () => {
  assert.equal(parseCommentLimit(undefined).value, MAX_COMMENT_LIMIT);
  assert.equal(parseCommentLimit('25').value, 25);
  assert.equal(parseCommentLimit(String(MAX_COMMENT_LIMIT + 1)).error, `limit must be an integer from 1 to ${MAX_COMMENT_LIMIT}`);
  assert.equal(parseCommentLimit('abc').error, `limit must be an integer from 1 to ${MAX_COMMENT_LIMIT}`);
});

test('checkRateLimit blocks after the allowed number of requests', () => {
  resetRateLimitsForTest();
  const req = reqFromIp('203.0.113.10');
  const now = 1_000_000;

  for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i += 1) {
    assert.equal(checkRateLimit(req, now + i).limited, false);
  }

  const blocked = checkRateLimit(req, now + RATE_LIMIT_MAX_REQUESTS);
  assert.equal(blocked.limited, true);
  assert.equal(blocked.retryAfterSeconds > 0, true);
});
