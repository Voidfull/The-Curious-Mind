import moralRiskContent from './posts/the-necessity-of-moral-risk.md?raw';
import statisticalSilenceContent from './posts/the-statistical-silence.md?raw';

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  readTime: string;
  tags: string[];
  category: 'essay' | 'article' | 'interesting-find' | 'note';
  excerpt: string;
  content: string;
  coverEmoji?: string;
}

export const posts: BlogPost[] = [
  {
    id: 'the-statistical-silence',
    title: 'The Statistical Silence',
    subtitle: 'On entropy, order, and the improbable fact of being here',
    date: '2026-06-10',
    readTime: '10 min read',
    tags: ['philosophy', 'science', 'entropy', 'meaning'],
    category: 'essay',
    coverEmoji: '🌌',
    excerpt: 'The universe has a preference. It does not prefer you. And yet — here you are.',
    content: statisticalSilenceContent,
  },
  {
    id: 'the-necessity-of-moral-risk',
    title: 'The Necessity of Moral Risk',
    subtitle: 'How freedom and institutions shape ethical agency',
    date: '2026-07-30',
    readTime: '9 min read',
    tags: ['ethics', 'agency', 'responsibility', 'morality'],
    category: 'essay',
    coverEmoji: '⚖️',
    excerpt: 'Moral risk is not a flaw in development; it is the structure of development itself.',
    content: moralRiskContent,
  },
];

export const categories = [
  { id: 'all', label: 'All Posts', emoji: '✨' },
  { id: 'essay', label: 'Essays', emoji: '✍️' },
  { id: 'article', label: 'Articles', emoji: '📄' },
  { id: 'interesting-find', label: 'Interesting Finds', emoji: '🔍' },
  { id: 'note', label: 'Notes', emoji: '📝' },
];

export const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

export function getPost(id: string): BlogPost | undefined {
  return posts.find(p => p.id === id);
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === 'all') return posts;
  return posts.filter(p => p.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return posts.filter(p => p.tags.includes(tag));
}
