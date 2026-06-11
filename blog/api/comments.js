import { sql } from '@vercel/postgres';

// Create table if it doesn't exist
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
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await initDB();

    // GET /api/comments?postId=xxx
    if (req.method === 'GET') {
      const { postId } = req.query;
      if (!postId) return res.status(400).json({ error: 'postId required' });

      const { rows } = await sql`
        SELECT * FROM comments
        WHERE post_id = ${postId}
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    // POST /api/comments
    if (req.method === 'POST') {
      const { post_id, username, content } = req.body;

      if (!post_id || !content?.trim()) {
        return res.status(400).json({ error: 'post_id and content are required' });
      }

      const cleanUsername = (username?.trim() || 'anonymous').slice(0, 50);
      const cleanContent = content.trim().slice(0, 2000);

      const { rows } = await sql`
        INSERT INTO comments (post_id, username, content)
        VALUES (${post_id}, ${cleanUsername}, ${cleanContent})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
