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
    content: `The universe has a preference. It does not prefer you. It does not prefer your careful arrangements, your clean desk, your tuned instrument, your ordered thoughts. Given enough time, given really any time at all, it will take everything you have built and scatter it. Not out of malice. That is the part that should unsettle you most. It is not malice. It is just math.

## The Headcount

There are more ways for a room to be messy than clean. More ways for a song to be noise than music. The second law of thermodynamics, that entropy always increases, is not really a law at all. It is a headcount. Disorder wins because disorder shows up in greater numbers. It is a democracy, and chaos has all the votes.

And yet. Here you are.

Here you are, a temporary knot of improbable order in the middle of a universe sprinting in the opposite direction. Every cell in your body is a small, exhausting act of defiance against entropy. Every thought you think — structured, sequential, meaningful — is the universe briefly, locally, failing to win. You are not just alive inside entropy. You are, in a very real statistical sense, fighting it.

> Ramanujan said an equation has no meaning to him unless it expresses a thought of God. I think what he meant — what he could only have meant — is that mathematics is not discovered passively. It is wrested.

## The Right Note

When the guitarist finds the right note — when the specific vibration of a string moves air in a specific way that arrives at a specific ear and produces, impossibly, the feeling of grief or joy or longing — that is not an accident. It is a negotiation with probability, conducted by someone who refused to stop at noise. The universe offered ten thousand wrong notes. They played until they found the one that wasn't.

Entropy will have the last word. But it will not have this one.
`,
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
