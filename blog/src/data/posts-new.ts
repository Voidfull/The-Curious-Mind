import moralRiskRaw from './posts/the-necessity-of-moral-risk.md?raw';
import statisticalSilenceRaw from './posts/the-statistical-silence.md?raw';

export type BlogPostCategory = 'essay' | 'article' | 'interesting-find' | 'note';
export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  readTime: string;
  tags: string[];
  category: BlogPostCategory;
  excerpt: string;
  content: string;
  coverEmoji?: string;
  status: BlogPostStatus;
}

type FrontmatterValue = string | string[];
type Frontmatter = Record<string, FrontmatterValue>;

interface ParsedMarkdown {
  frontmatter: Frontmatter;
  content: string;
}

const rawPosts = [statisticalSilenceRaw, moralRiskRaw];

const categorySet = new Set<BlogPostCategory>(['essay', 'article', 'interesting-find', 'note']);

function parseFrontmatter(raw: string): ParsedMarkdown {
  if (!raw.startsWith('---')) {
    return { frontmatter: {}, content: raw.trim() };
  }

  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {}, content: raw.trim() };

  const block = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trim();
  const frontmatter: Frontmatter = {};

  for (const line of block.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === 'tags') {
      frontmatter[key] = value.split(',').map(tag => tag.trim()).filter(Boolean);
    } else {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content };
}

function stringValue(frontmatter: Frontmatter, key: string, fallback = ''): string {
  const value = frontmatter[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function listValue(frontmatter: Frontmatter, key: string): string[] {
  const value = frontmatter[key];
  return Array.isArray(value) ? value : [];
}

function categoryValue(frontmatter: Frontmatter): BlogPostCategory {
  const category = stringValue(frontmatter, 'category', 'note') as BlogPostCategory;
  return categorySet.has(category) ? category : 'note';
}

function statusValue(frontmatter: Frontmatter): BlogPostStatus {
  return stringValue(frontmatter, 'status', 'published') === 'draft' ? 'draft' : 'published';
}

function postFromMarkdown(raw: string): BlogPost {
  const { frontmatter, content } = parseFrontmatter(raw);
  const id = stringValue(frontmatter, 'id');

  if (!id) {
    throw new Error('Post frontmatter must include an id');
  }

  return {
    id,
    title: stringValue(frontmatter, 'title', id),
    subtitle: stringValue(frontmatter, 'subtitle') || undefined,
    date: stringValue(frontmatter, 'date'),
    readTime: stringValue(frontmatter, 'readTime'),
    tags: listValue(frontmatter, 'tags'),
    category: categoryValue(frontmatter),
    excerpt: stringValue(frontmatter, 'excerpt'),
    content,
    coverEmoji: stringValue(frontmatter, 'coverEmoji') || undefined,
    status: statusValue(frontmatter),
  };
}

export const allPosts: BlogPost[] = rawPosts
  .map(postFromMarkdown)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const posts: BlogPost[] = allPosts.filter(post => post.status === 'published');

export const categories = [
  { id: 'all', label: 'All Posts', emoji: '✨' },
  { id: 'essay', label: 'Essays', emoji: '✍️' },
  { id: 'article', label: 'Articles', emoji: '📄' },
  { id: 'interesting-find', label: 'Interesting Finds', emoji: '🔍' },
  { id: 'note', label: 'Notes', emoji: '📝' },
];

export const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();
export const validPostIds = new Set(posts.map(post => post.id));

export function getPost(id: string, includeDrafts = false): BlogPost | undefined {
  const source = includeDrafts ? allPosts : posts;
  return source.find(post => post.id === id);
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === 'all') return posts;
  return posts.filter(post => post.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return posts.filter(post => post.tags.includes(tag));
}

export function getAdjacentPosts(id: string) {
  const index = posts.findIndex(post => post.id === id);
  return {
    previous: index > 0 ? posts[index - 1] : undefined,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return posts
    .filter(candidate => candidate.id !== post.id)
    .map(candidate => ({
      post: candidate,
      score: candidate.tags.filter(tag => post.tags.includes(tag)).length,
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
    .slice(0, limit)
    .map(candidate => candidate.post);
}