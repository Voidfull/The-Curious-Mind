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

export const categories = [
  { id: 'all', label: 'All Posts', emoji: 'spark' },
  { id: 'essay', label: 'Essays', emoji: 'essay' },
  { id: 'article', label: 'Articles', emoji: 'article' },
  { id: 'interesting-find', label: 'Interesting Finds', emoji: 'find' },
  { id: 'note', label: 'Notes', emoji: 'note' },
];

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

function sortByDateDesc(source: BlogPost[]) {
  return [...source].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

export const allPosts: BlogPost[] = sortByDateDesc(rawPosts.map(postFromMarkdown));
export const posts: BlogPost[] = allPosts.filter(post => post.status === 'published');
export const validPostIds = new Set(posts.map(post => post.id));
export const allTags = getAllTags(posts);

export function getAllTags(source: BlogPost[] = posts): string[] {
  return Array.from(new Set(source.flatMap(post => post.tags))).sort();
}

export function mergePosts(staticSource: BlogPost[], managedSource: BlogPost[]): BlogPost[] {
  const merged = new Map<string, BlogPost>();
  for (const post of staticSource) merged.set(post.id, post);
  for (const post of managedSource) merged.set(post.id, post);
  return sortByDateDesc(Array.from(merged.values()).filter(post => post.status === 'published'));
}

export function getPostFrom(source: BlogPost[], id: string, includeDrafts = false): BlogPost | undefined {
  return source.find(post => post.id === id && (includeDrafts || post.status === 'published'));
}

export function getPostsByCategoryFrom(source: BlogPost[], category: string): BlogPost[] {
  if (category === 'all') return source;
  return source.filter(post => post.category === category);
}

export function getPostsByTagFrom(source: BlogPost[], tag: string): BlogPost[] {
  return source.filter(post => post.tags.includes(tag));
}

export function getAdjacentPostsFrom(source: BlogPost[], id: string) {
  const index = source.findIndex(post => post.id === id);
  return {
    previous: index > 0 ? source[index - 1] : undefined,
    next: index >= 0 && index < source.length - 1 ? source[index + 1] : undefined,
  };
}

export function getRelatedPostsFrom(source: BlogPost[], post: BlogPost, limit = 3): BlogPost[] {
  return source
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

export function getPost(id: string, includeDrafts = false): BlogPost | undefined {
  return getPostFrom(includeDrafts ? allPosts : posts, id, includeDrafts);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getPostsByCategoryFrom(posts, category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getPostsByTagFrom(posts, tag);
}

export function getAdjacentPosts(id: string) {
  return getAdjacentPostsFrom(posts, id);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return getRelatedPostsFrom(posts, post, limit);
}