export interface Comment {
  id: string;
  postId: string;
  username: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

const STORAGE_KEY = 'blog_comments';

function getStoredComments(): Comment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return getDefaultComments();
}

function saveComments(comments: Comment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

function getDefaultComments(): Comment[] {
  const defaults: Comment[] = [
    {
      id: 'c1',
      postId: 'the-art-of-slow-thinking',
      username: 'thoughtful_reader',
      content: 'This really resonated with me. I\'ve been trying to implement "thinking time" into my daily routine and it\'s been transformative. The hardest part is resisting the urge to reach for my phone.',
      timestamp: '2026-01-16T10:30:00Z',
    },
    {
      id: 'c2',
      postId: 'the-art-of-slow-thinking',
      username: 'maria_k',
      content: 'The Kahneman reference is spot on. I\'d also recommend "Deep Work" by Cal Newport — it pairs really well with the ideas in this essay.',
      timestamp: '2026-01-16T14:15:00Z',
    },
    {
      id: 'c3',
      postId: 'fascinating-math-of-cicadas',
      username: 'math_nerd_42',
      content: 'This is one of my favorite examples of math in nature! Another great one is the Fibonacci sequence in sunflower seed spirals.',
      timestamp: '2025-12-11T09:00:00Z',
    },
    {
      id: 'c4',
      postId: 'why-libraries-still-matter',
      username: 'bookworm',
      content: 'Took your challenge and spent Saturday afternoon at my local library. You\'re right — it was magical. Found a 1970s book on urban planning that I never would have discovered online.',
      timestamp: '2025-12-30T16:45:00Z',
    },
    {
      id: 'c5',
      postId: 'on-digital-minimalism',
      username: 'recovering_scroller',
      content: 'Currently attempting something similar. Day 3 and the phone-reaching habit is REAL. Thanks for sharing this — knowing others have gone through it helps.',
      timestamp: '2025-11-07T20:00:00Z',
    },
  ];
  saveComments(defaults);
  return defaults;
}

export function getCommentsForPost(postId: string): Comment[] {
  const comments = getStoredComments();
  return comments
    .filter(c => c.postId === postId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addComment(postId: string, username: string, content: string): Comment {
  const comments = getStoredComments();
  const newComment: Comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    postId,
    username: username.trim() || 'anonymous',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };
  comments.push(newComment);
  saveComments(comments);
  return newComment;
}

export function getCommentCount(postId: string): number {
  const comments = getStoredComments();
  return comments.filter(c => c.postId === postId).length;
}
