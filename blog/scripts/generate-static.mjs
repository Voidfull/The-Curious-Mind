import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const siteUrl = process.env.SITE_URL || 'https://the-curious-mind.vercel.app';
const postsDir = join(process.cwd(), 'src', 'data', 'posts');
const publicDir = join(process.cwd(), 'public');

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;

  const block = raw.slice(3, end).trim();
  const meta = {};
  for (const line of block.split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return meta;
}

const posts = readdirSync(postsDir)
  .filter(file => file.endsWith('.md'))
  .map(file => parseFrontmatter(readFileSync(join(postsDir, file), 'utf8')))
  .filter(post => post && post.status !== 'draft')
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const siteLastmod = posts[0]?.date || new Date().toISOString().slice(0, 10);
const lastBuildDate = new Date(siteLastmod).toUTCString();

mkdirSync(publicDir, { recursive: true });

const rssItems = posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/#post/${escapeXml(post.id)}</link>
      <guid>${siteUrl}/#post/${escapeXml(post.id)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`).join('');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Curious Mind</title>
    <link>${siteUrl}</link>
    <description>Essays, articles, and notes from The Curious Mind.</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>${rssItems}
  </channel>
</rss>
`;

const urls = [
  { loc: siteUrl, lastmod: siteLastmod },
  { loc: `${siteUrl}/#contact`, lastmod: siteLastmod },
  ...posts.map(post => ({ loc: `${siteUrl}/#post/${post.id}`, lastmod: post.date })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(join(publicDir, 'rss.xml'), rss);
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap);