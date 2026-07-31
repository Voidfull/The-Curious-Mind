import { sql } from '@vercel/postgres';

export const VALID_POST_IDS = new Set([
  'the-statistical-silence',
  'the-necessity-of-moral-risk',
]);

export const MAX_USERNAME_LENGTH = 50;
export const MAX_CONTENT_LENGTH = 2000;
export const DEFAULT_COMMENT_LIMIT = 100;
export const MAX_COMMENT_LIMIT = 100;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 5;

const rateLimitBuckets = new Map();

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function jsonError(res, status, error) {
  return res.status(status).json({ error });
}

function getClientIp(req) {
  const forwardedFor = firstValue(req.headers?.['x-forwarded-for']);
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function cleanupRateLimits(now) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

export function resetRateLimitsForTest() {
  rateLimitBuckets.clear();
}

export function checkRateLimit(req, now = Date.now()) {
  cleanupRateLimits(now);

  const key = getClientIp(req);
  const existing = rateLimitBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    limited: false,
    remaining: RATE_LIMIT_MAX_REQUESTS - existing.count,
  };
}

export function validatePostId(postId) {
  if (typeof postId !== 'string' || !postId.trim()) {
    return { error: 'postId required' };
  }

  if (!VALID_POST_IDS.has(postId)) {
    return { error: 'Unknown postId' };
  }

  return { value: postId };
}

export function parseCommentLimit(limitValue) {
  const rawLimit = firstValue(limitValue);
  if (rawLimit === undefined) return { value: DEFAULT_COMMENT_LIMIT };

  const limit = Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_COMMENT_LIMIT) {
    return { error: `limit must be an integer from 1 to ${MAX_COMMENT_LIMIT}` };
  }

  return { value: limit };
}

export function validateCommentBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'JSON body required' };
  }

  const postValidation = validatePostId(body.post_id);
  if (postValidation.error) {
    return { error: postValidation.error.replace('postId', 'post_id') };
  }

  if (body.username !== undefined && body.username !== null && typeof body.username !== 'string') {
    return { error: 'username must be a string' };
  }

  if (typeof body.content !== 'string') {
    return { error: 'content must be a string' };
  }

  const username = body.username?.trim() || 'anonymous';
  const content = body.content.trim();

  if (!content) {
    return { error: 'content is required' };
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return { error: `username must be ${MAX_USERNAME_LENGTH} characters or fewer` };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return { error: `content must be ${MAX_CONTENT_LENGTH} characters or fewer` };
  }

  return {
    value: {
      post_id: postValidation.value,
      username,
      content,
    },
  };
}

function logServerError(req, err) {
  console.error(JSON.stringify({
    level: 'error',
    message: 'comments_api_error',
    method: req.method,
    url: req.url,
    requestId: req.headers?.['x-vercel-id'] || req.headers?.['x-request-id'] || null,
    error: err instanceof Error ? err.message : String(err),
  }));
}

async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id TEXT NOT NULL,
      username TEXT NOT NULL DEFAULT 'anonymous',
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx
    ON comments (post_id, created_at DESC);
  `;
}

export default async function handler(req, res) {
  // CORS stays permissive because the user explicitly asked not to change it.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await initDB();

    if (req.method === 'GET') {
      const postValidation = validatePostId(firstValue(req.query?.postId));
      if (postValidation.error) return jsonError(res, 400, postValidation.error);

      const limitValidation = parseCommentLimit(req.query?.limit);
      if (limitValidation.error) return jsonError(res, 400, limitValidation.error);

      const { rows } = await sql`
        SELECT * FROM comments
        WHERE post_id = ${postValidation.value}
        ORDER BY created_at DESC
        LIMIT ${limitValidation.value}
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const rateLimit = checkRateLimit(req);
      if (rateLimit.limited) {
        res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
        return jsonError(res, 429, 'Too many comments. Please try again later.');
      }

      const bodyValidation = validateCommentBody(req.body);
      if (bodyValidation.error) return jsonError(res, 400, bodyValidation.error);

      const { rows } = await sql`
        INSERT INTO comments (post_id, username, content)
        VALUES (${bodyValidation.value.post_id}, ${bodyValidation.value.username}, ${bodyValidation.value.content})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return jsonError(res, 405, 'Method not allowed');
  } catch (err) {
    logServerError(req, err);
    return jsonError(res, 500, 'Server error');
  }
}
