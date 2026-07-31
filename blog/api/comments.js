import { sql } from '@vercel/postgres';
import { timingSafeEqual } from 'node:crypto';

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
export const REACTION_KEYS = new Set(['heart', 'thought', 'spark']);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POST_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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

function getAdminToken(req) {
  const authorization = firstValue(req.headers?.authorization);
  if (typeof authorization === 'string') {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }

  return firstValue(req.headers?.['x-admin-token']);
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = getAdminToken(req);
  return Boolean(expected && provided && constantTimeEqual(provided, expected));
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

export function validatePostId(postId, { allowDynamic = false } = {}) {
  if (typeof postId !== 'string' || !postId.trim()) {
    return { error: 'postId required' };
  }

  const cleanPostId = postId.trim();
  if (VALID_POST_IDS.has(cleanPostId)) {
    return { value: cleanPostId };
  }

  if (allowDynamic && POST_ID_PATTERN.test(cleanPostId)) {
    return { value: cleanPostId };
  }

  return { error: 'Unknown postId' };
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

export function validateSpam(content) {
  const lowerContent = content.toLowerCase();
  const urlCount = (content.match(/https?:\/\//gi) || []).length;

  if (urlCount > 2) return { error: 'Comment has too many links' };
  if (/(.)\1{12,}/.test(content)) return { error: 'Comment looks repetitive' };
  if (lowerContent.includes('[url=') || lowerContent.includes('<a href=')) {
    return { error: 'Comment format is not allowed' };
  }

  return { value: content };
}

export function validateCommentBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'JSON body required' };
  }

  const postValidation = validatePostId(body.post_id, { allowDynamic: true });
  if (postValidation.error) {
    return { error: postValidation.error.replace('postId', 'post_id') };
  }

  if (body.username !== undefined && body.username !== null && typeof body.username !== 'string') {
    return { error: 'username must be a string' };
  }

  if (typeof body.content !== 'string') {
    return { error: 'content must be a string' };
  }

  if (body.parent_id !== undefined && body.parent_id !== null && (typeof body.parent_id !== 'string' || !UUID_PATTERN.test(body.parent_id))) {
    return { error: 'parent_id must be a comment id' };
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

  const spamValidation = validateSpam(content);
  if (spamValidation.error) return { error: spamValidation.error };

  return {
    value: {
      post_id: postValidation.value,
      username,
      content,
      parent_id: body.parent_id || null,
    },
  };
}

export function validateReactionBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'JSON body required' };
  }

  if (typeof body.comment_id !== 'string' || !UUID_PATTERN.test(body.comment_id)) {
    return { error: 'comment_id must be a comment id' };
  }

  if (typeof body.reaction_key !== 'string' || !REACTION_KEYS.has(body.reaction_key)) {
    return { error: 'reaction_key is invalid' };
  }

  if (typeof body.client_key !== 'string' || body.client_key.trim().length < 8 || body.client_key.length > 120) {
    return { error: 'client_key is invalid' };
  }

  return {
    value: {
      comment_id: body.comment_id,
      reaction_key: body.reaction_key,
      client_key: body.client_key.trim(),
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

  await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;`;
  await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;`;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      date DATE NOT NULL,
      read_time TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_emoji TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT posts_category_check CHECK (category IN ('essay', 'article', 'interesting-find', 'note')),
      CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published'))
    );
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_category_check') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_category_check CHECK (category IN ('essay', 'article', 'interesting-find', 'note'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_status_check') THEN
        ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published'));
      END IF;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comment_reactions (
      comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      reaction_key TEXT NOT NULL,
      client_key TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (comment_id, reaction_key, client_key)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx
    ON comments (post_id, created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS comments_parent_id_idx
    ON comments (parent_id);
  `;
}

async function assertKnownPostId(postId) {
  if (VALID_POST_IDS.has(postId)) return true;
  const { rows } = await sql`
    SELECT id FROM posts
    WHERE id = ${postId} AND status = 'published'
    LIMIT 1
  `;
  return rows.length === 1;
}

async function getComments({ postId, limit, includeHidden = false }) {
  const { rows } = await sql`
    SELECT
      c.*,
      COALESCE((
        SELECT jsonb_object_agg(reaction_key, reaction_count)
        FROM (
          SELECT reaction_key, COUNT(*)::int AS reaction_count
          FROM comment_reactions
          WHERE comment_id = c.id
          GROUP BY reaction_key
        ) reaction_summary
      ), '{}'::jsonb) AS reactions
    FROM comments c
    WHERE (${postId}::text IS NULL OR c.post_id = ${postId})
      AND (${includeHidden}::boolean OR c.is_hidden = FALSE)
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

async function assertParentBelongsToPost(parentId, postId) {
  if (!parentId) return true;
  const { rows } = await sql`
    SELECT id FROM comments
    WHERE id = ${parentId} AND post_id = ${postId} AND is_hidden = FALSE
    LIMIT 1
  `;
  return rows.length === 1;
}

async function hasDuplicateComment(postId, content) {
  const { rows } = await sql`
    SELECT id FROM comments
    WHERE post_id = ${postId}
      AND content = ${content}
      AND created_at > NOW() - INTERVAL '10 minutes'
    LIMIT 1
  `;
  return rows.length > 0;
}

export default async function handler(req, res) {
  // CORS stays permissive because the user explicitly asked not to change it.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await initDB();

    if (req.method === 'GET') {
      if (getAdminToken(req)) {
        if (!isAdmin(req)) return jsonError(res, 401, 'Unauthorized');
        const limitValidation = parseCommentLimit(req.query?.limit || MAX_COMMENT_LIMIT);
        if (limitValidation.error) return jsonError(res, 400, limitValidation.error);
        return res.status(200).json(await getComments({ postId: null, limit: limitValidation.value, includeHidden: true }));
      }

      const postValidation = validatePostId(firstValue(req.query?.postId), { allowDynamic: true });
      if (postValidation.error) return jsonError(res, 400, postValidation.error);
      if (!(await assertKnownPostId(postValidation.value))) return jsonError(res, 400, 'Unknown postId');

      const limitValidation = parseCommentLimit(req.query?.limit);
      if (limitValidation.error) return jsonError(res, 400, limitValidation.error);

      return res.status(200).json(await getComments({ postId: postValidation.value, limit: limitValidation.value }));
    }

    if (req.method === 'POST') {
      const rateLimit = checkRateLimit(req);
      if (rateLimit.limited) {
        res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
        return jsonError(res, 429, 'Too many requests. Please try again later.');
      }

      if (req.body?.action === 'react') {
        const reactionValidation = validateReactionBody(req.body);
        if (reactionValidation.error) return jsonError(res, 400, reactionValidation.error);
        const { comment_id, reaction_key, client_key } = reactionValidation.value;

        const inserted = await sql`
          INSERT INTO comment_reactions (comment_id, reaction_key, client_key)
          VALUES (${comment_id}, ${reaction_key}, ${client_key})
          ON CONFLICT DO NOTHING
          RETURNING comment_id
        `;

        let selected = true;
        if (inserted.rows.length === 0) {
          await sql`
            DELETE FROM comment_reactions
            WHERE comment_id = ${comment_id}
              AND reaction_key = ${reaction_key}
              AND client_key = ${client_key}
          `;
          selected = false;
        }

        const comments = await getComments({ postId: null, limit: 1, includeHidden: true });
        return res.status(200).json({ selected, comments });
      }

      const bodyValidation = validateCommentBody(req.body);
      if (bodyValidation.error) return jsonError(res, 400, bodyValidation.error);
      if (!(await assertKnownPostId(bodyValidation.value.post_id))) return jsonError(res, 400, 'Unknown postId');

      const parentOk = await assertParentBelongsToPost(bodyValidation.value.parent_id, bodyValidation.value.post_id);
      if (!parentOk) return jsonError(res, 400, 'parent_id does not belong to this post');

      if (await hasDuplicateComment(bodyValidation.value.post_id, bodyValidation.value.content)) {
        return jsonError(res, 409, 'Duplicate comment');
      }

      const { rows } = await sql`
        INSERT INTO comments (post_id, username, content, parent_id)
        VALUES (${bodyValidation.value.post_id}, ${bodyValidation.value.username}, ${bodyValidation.value.content}, ${bodyValidation.value.parent_id})
        RETURNING *, '{}'::jsonb AS reactions
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return jsonError(res, 401, 'Unauthorized');
      const id = firstValue(req.query?.id);
      if (typeof id !== 'string' || !UUID_PATTERN.test(id)) return jsonError(res, 400, 'id must be a comment id');

      await sql`DELETE FROM comments WHERE id = ${id}`;
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');
    return jsonError(res, 405, 'Method not allowed');
  } catch (err) {
    logServerError(req, err);
    return jsonError(res, 500, 'Server error');
  }
}