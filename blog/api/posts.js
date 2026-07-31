import { sql } from '@vercel/postgres';
import { timingSafeEqual } from 'node:crypto';

export const STATIC_POST_IDS = new Set([
  'the-statistical-silence',
  'the-necessity-of-moral-risk',
]);
export const CATEGORY_KEYS = new Set(['essay', 'article', 'interesting-find', 'note']);
export const STATUS_KEYS = new Set(['draft', 'published']);
export const MAX_TITLE_LENGTH = 160;
export const MAX_SUBTITLE_LENGTH = 220;
export const MAX_EXCERPT_LENGTH = 800;
export const MAX_CONTENT_LENGTH = 120_000;
export const MAX_READ_TIME_LENGTH = 40;
export const MAX_TAGS = 12;
export const MAX_TAG_LENGTH = 40;
export const MAX_COVER_EMOJI_LENGTH = 16;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function jsonError(res, status, error) {
  return res.status(status).json({ error });
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function getAdminToken(req) {
  const authorization = firstValue(req.headers?.authorization);
  if (typeof authorization === 'string') {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }

  return firstValue(req.headers?.['x-admin-token']);
}

function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = getAdminToken(req);
  return Boolean(expected && provided && constantTimeEqual(provided, expected));
}

function secureHeaders(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function normalizeString(value, field, maxLength, { required = true } = {}) {
  if (value === undefined || value === null) {
    return required ? { error: `${field} is required` } : { value: undefined };
  }
  if (typeof value !== 'string') return { error: `${field} must be a string` };

  const clean = value.trim();
  if (required && !clean) return { error: `${field} is required` };
  if (clean.length > maxLength) return { error: `${field} must be ${maxLength} characters or fewer` };
  return { value: clean || undefined };
}

function normalizeDate(value) {
  const result = normalizeString(value, 'date', 20);
  if (result.error) return result;

  const date = new Date(`${result.value}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.value) || Number.isNaN(date.getTime())) {
    return { error: 'date must use YYYY-MM-DD format' };
  }
  return result;
}

export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeId(value, title) {
  const id = value === undefined || value === null || value === '' ? slugify(title) : String(value).trim().toLowerCase();
  if (!id) return { error: 'id is required' };
  if (id.length > 100 || !SLUG_PATTERN.test(id)) {
    return { error: 'id must be a lowercase slug' };
  }
  if (STATIC_POST_IDS.has(id)) {
    return { error: 'id is reserved by a static post' };
  }
  return { value: id };
}

function normalizeTags(value) {
  const rawTags = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const tags = Array.from(new Set(rawTags
    .map(tag => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
    .filter(Boolean)));

  if (tags.length > MAX_TAGS) return { error: `tags must contain ${MAX_TAGS} items or fewer` };
  if (tags.some(tag => tag.length > MAX_TAG_LENGTH)) {
    return { error: `tags must be ${MAX_TAG_LENGTH} characters or fewer` };
  }
  return { value: tags };
}

export function validatePostPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'JSON body required' };
  }

  const title = normalizeString(body.title, 'title', MAX_TITLE_LENGTH);
  if (title.error) return title;

  const id = normalizeId(body.id, title.value);
  if (id.error) return id;

  const subtitle = normalizeString(body.subtitle, 'subtitle', MAX_SUBTITLE_LENGTH, { required: false });
  if (subtitle.error) return subtitle;

  const date = normalizeDate(body.date);
  if (date.error) return date;

  const readTime = normalizeString(body.readTime, 'readTime', MAX_READ_TIME_LENGTH);
  if (readTime.error) return readTime;

  const tags = normalizeTags(body.tags);
  if (tags.error) return tags;

  const category = normalizeString(body.category, 'category', 40);
  if (category.error) return category;
  if (!CATEGORY_KEYS.has(category.value)) return { error: 'category is invalid' };

  const excerpt = normalizeString(body.excerpt, 'excerpt', MAX_EXCERPT_LENGTH);
  if (excerpt.error) return excerpt;

  const content = normalizeString(body.content, 'content', MAX_CONTENT_LENGTH);
  if (content.error) return content;

  const coverEmoji = normalizeString(body.coverEmoji, 'coverEmoji', MAX_COVER_EMOJI_LENGTH, { required: false });
  if (coverEmoji.error) return coverEmoji;

  const status = normalizeString(body.status || 'draft', 'status', 20);
  if (status.error) return status;
  if (!STATUS_KEYS.has(status.value)) return { error: 'status is invalid' };

  return {
    value: {
      id: id.value,
      title: title.value,
      subtitle: subtitle.value || null,
      date: date.value,
      readTime: readTime.value,
      tags: tags.value,
      category: category.value,
      excerpt: excerpt.value,
      content: content.value,
      coverEmoji: coverEmoji.value || null,
      status: status.value,
    },
  };
}

function validatePostId(value) {
  const id = firstValue(value);
  if (typeof id !== 'string' || !SLUG_PATTERN.test(id)) return { error: 'id must be a post id' };
  if (STATIC_POST_IDS.has(id)) return { error: 'Static posts cannot be managed here' };
  return { value: id };
}

async function initDB() {
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
    CREATE INDEX IF NOT EXISTS posts_status_date_idx
    ON posts (status, date DESC);
  `;
}

function postFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || undefined,
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10),
    readTime: row.read_time,
    tags: Array.isArray(row.tags) ? row.tags : [],
    category: row.category,
    excerpt: row.excerpt,
    content: row.content,
    coverEmoji: row.cover_emoji || undefined,
    status: row.status,
  };
}

async function getPosts(includeDrafts) {
  const { rows } = includeDrafts
    ? await sql`SELECT * FROM posts ORDER BY date DESC, updated_at DESC`
    : await sql`SELECT * FROM posts WHERE status = 'published' ORDER BY date DESC, updated_at DESC`;
  return rows.map(postFromRow);
}

async function getPostById(id) {
  const { rows } = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  return rows[0] ? postFromRow(rows[0]) : null;
}

async function createPost(post) {
  const { rows } = await sql`
    INSERT INTO posts (id, title, subtitle, date, read_time, tags, category, excerpt, content, cover_emoji, status)
    VALUES (${post.id}, ${post.title}, ${post.subtitle}, ${post.date}, ${post.readTime}, ${JSON.stringify(post.tags)}::jsonb, ${post.category}, ${post.excerpt}, ${post.content}, ${post.coverEmoji}, ${post.status})
    RETURNING *
  `;
  return postFromRow(rows[0]);
}

async function updatePost(id, post) {
  const { rows } = await sql`
    UPDATE posts
    SET title = ${post.title},
        subtitle = ${post.subtitle},
        date = ${post.date},
        read_time = ${post.readTime},
        tags = ${JSON.stringify(post.tags)}::jsonb,
        category = ${post.category},
        excerpt = ${post.excerpt},
        content = ${post.content},
        cover_emoji = ${post.coverEmoji},
        status = ${post.status},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? postFromRow(rows[0]) : null;
}

function logServerError(req, err) {
  console.error(JSON.stringify({
    level: 'error',
    message: 'posts_api_error',
    method: req.method,
    url: req.url,
    requestId: req.headers?.['x-vercel-id'] || req.headers?.['x-request-id'] || null,
    error: err instanceof Error ? err.message : String(err),
  }));
}

export default async function handler(req, res) {
  secureHeaders(res);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await initDB();

    if (req.method === 'GET') {
      const admin = Boolean(getAdminToken(req));
      if (admin && !isAdmin(req)) return jsonError(res, 401, 'Unauthorized');

      const id = firstValue(req.query?.id);
      if (id) {
        const idValidation = validatePostId(id);
        if (idValidation.error) return jsonError(res, 400, idValidation.error);
        const post = await getPostById(idValidation.value);
        if (!post || (!admin && post.status !== 'published')) return jsonError(res, 404, 'Post not found');
        return res.status(200).json(post);
      }

      return res.status(200).json(await getPosts(admin));
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) return jsonError(res, 401, 'Unauthorized');
      const validation = validatePostPayload(req.body);
      if (validation.error) return jsonError(res, 400, validation.error);

      if (await getPostById(validation.value.id)) {
        return jsonError(res, 409, 'Post id already exists');
      }

      return res.status(201).json(await createPost(validation.value));
    }

    if (req.method === 'PUT') {
      if (!isAdmin(req)) return jsonError(res, 401, 'Unauthorized');
      const idValidation = validatePostId(req.query?.id);
      if (idValidation.error) return jsonError(res, 400, idValidation.error);

      const validation = validatePostPayload({ ...req.body, id: idValidation.value });
      if (validation.error) return jsonError(res, 400, validation.error);

      const updated = await updatePost(idValidation.value, validation.value);
      if (!updated) return jsonError(res, 404, 'Post not found');
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return jsonError(res, 401, 'Unauthorized');
      const idValidation = validatePostId(req.query?.id);
      if (idValidation.error) return jsonError(res, 400, idValidation.error);

      await sql`DELETE FROM posts WHERE id = ${idValidation.value}`;
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    return jsonError(res, 405, 'Method not allowed');
  } catch (err) {
    logServerError(req, err);
    return jsonError(res, 500, 'Server error');
  }
}