import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Heart, Lightbulb, MessageCircle, Reply, Send, Sparkles } from 'lucide-react';
import { readString, writeString } from '../utils/storage';
import { trackEvent } from '../utils/analytics';

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  username: string;
  content: string;
  created_at: string;
  reactions?: Record<string, number>;
}

interface ThreadedComment extends Comment {
  replies: Comment[];
}

const reactionOptions = [
  { key: 'heart', label: 'Like', icon: Heart },
  { key: 'thought', label: 'Thoughtful', icon: Lightbulb },
  { key: 'spark', label: 'Spark', icon: Sparkles },
];

function getClientKey() {
  const existing = readString('blog_comment_client_key');
  if (existing) return existing;

  const key = `client_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  writeString('blog_comment_client_key', key);
  return key;
}

function normalizeComment(comment: Comment): Comment {
  return {
    ...comment,
    parent_id: comment.parent_id || null,
    reactions: comment.reactions || {},
  };
}

async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(normalizeComment);
  } catch {
    return [];
  }
}

async function postComment(
  postId: string,
  username: string,
  content: string,
  parentId: string | null
): Promise<Comment | null> {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, username, content, parent_id: parentId }),
    });
    if (!res.ok) return null;
    return normalizeComment(await res.json());
  } catch {
    return null;
  }
}

async function toggleReaction(commentId: string, reactionKey: string): Promise<boolean> {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'react',
        comment_id: commentId,
        reaction_key: reactionKey,
        client_key: getClientKey(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const avatarColors = [
  'bg-accent/10 text-accent dark:bg-dark-accent/15 dark:text-dark-accent',
  'bg-lavender/10 text-lavender dark:bg-lavender/15 dark:text-lavender-light',
  'bg-sage/10 text-sage dark:bg-sage/15 dark:text-sage-light',
  'bg-ocean/10 text-ocean dark:bg-ocean/15 dark:text-ocean-light',
  'bg-rose/10 text-rose dark:bg-rose/15 dark:text-rose-light',
  'bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold-light',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function buildThreads(comments: Comment[]): ThreadedComment[] {
  const roots: ThreadedComment[] = [];
  const repliesByParent = new Map<string, Comment[]>();

  for (const comment of comments) {
    if (comment.parent_id) {
      repliesByParent.set(comment.parent_id, [...(repliesByParent.get(comment.parent_id) || []), comment]);
    } else {
      roots.push({ ...comment, replies: [] });
    }
  }

  return roots.map(root => ({
    ...root,
    replies: (repliesByParent.get(root.id) || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  }));
}

function CommentBubble({
  comment,
  index,
  isReply = false,
  onReply,
  onReact,
}: {
  comment: Comment;
  index: number;
  isReply?: boolean;
  onReply: (comment: Comment) => void;
  onReact: (commentId: string, reactionKey: string) => void;
}) {
  const date = new Date(comment.created_at);
  const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
  const color = getAvatarColor(comment.username);

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className={`flex items-start gap-3.5 ${isReply ? 'ml-8 sm:ml-12 pt-5 border-l border-ink/5 dark:border-dark-border/30 pl-4' : ''}`}>
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0 font-serif text-sm font-semibold italic`}>
          {comment.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-xs tracking-wider text-ink dark:text-dark-text">
              {comment.username}
            </span>
            <span
              className="text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-wider"
              title={format(date, 'PPpp')}
            >
              {isRecent
                ? formatDistanceToNow(date, { addSuffix: true })
                : format(date, 'MMM d, yyyy')}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-light/80 dark:text-dark-text-muted/80 whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {!isReply && (
              <button
                onClick={() => onReply(comment)}
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-accent dark:hover:text-dark-accent transition-colors"
              >
                <Reply size={12} /> Reply
              </button>
            )}
            {reactionOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onReact(comment.id, key)}
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-accent dark:hover:text-dark-accent transition-colors"
                aria-label={label}
              >
                <Icon size={12} />
                {comment.reactions?.[key] || 0}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(
    () => readString('blog_username')
  );
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadComments = async () => {
    const data = await fetchComments(postId);
    setComments(data);
  };

  useEffect(() => {
    setLoading(true);
    fetchComments(postId).then(data => {
      setComments(data);
      setLoading(false);
    });
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);

    if (username.trim()) {
      writeString('blog_username', username.trim());
    }

    const newComment = await postComment(
      postId,
      username.trim() || 'anonymous',
      content.trim(),
      replyTarget?.id || null
    );

    if (newComment) {
      setComments(prev => [newComment, ...prev]);
      setContent('');
      setReplyTarget(null);
      setShowSuccess(true);
      trackEvent('comment_submit', { postId, reply: Boolean(newComment.parent_id) });
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError('Something went wrong. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleReact = async (commentId: string, reactionKey: string) => {
    const ok = await toggleReaction(commentId, reactionKey);
    if (ok) {
      trackEvent('comment_reaction', { postId, reactionKey });
      await reloadComments();
    }
  };

  const threads = buildThreads(comments);

  return (
    <section className="mt-16 pt-12">
      <div className="flex items-center gap-3 mb-10">
        <MessageCircle size={18} className="text-accent/60 dark:text-dark-accent/70" />
        <h2 className="font-serif text-2xl font-semibold text-ink dark:text-dark-text italic">
          Thoughts & Replies
        </h2>
        {comments.length > 0 && (
          <span className="text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-widest mt-1">
            ({comments.length})
          </span>
        )}
        <div className="flex-1 h-px bg-gradient-to-r from-ink/5 dark:from-dark-border/30 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative p-6 art-border rounded-sm">
          <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
            {replyTarget ? `Reply to ${replyTarget.username}` : 'Leave a note'}
          </div>

          <div className="mb-5">
            <label
              htmlFor="username"
              className="block text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/60 mb-2 tracking-[0.15em] uppercase"
            >
              Your name
              <span className="text-ink-muted/30 dark:text-dark-text-muted/40 normal-case tracking-normal ml-1">
                (or stay anonymous)
              </span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="anonymous"
              maxLength={30}
              className="w-full sm:w-56 px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/20 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/40 dark:focus:border-dark-accent/50 text-sm font-mono tracking-wider transition-all"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="comment"
              className="block text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/60 mb-2 tracking-[0.15em] uppercase"
            >
              Your thoughts
            </label>
            <textarea
              id="comment"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind..."
              rows={4}
              maxLength={2000}
              required
              className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/20 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/40 dark:focus:border-dark-accent/50 text-sm leading-relaxed resize-y transition-all"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono text-ink-muted/25 dark:text-dark-text-muted/30 tracking-wider">
              {content.length}/2000
            </span>
            <div className="flex items-center gap-4">
              {replyTarget && (
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="text-[11px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-accent dark:hover:text-dark-accent tracking-wider"
                >
                  Cancel reply
                </button>
              )}
              {showSuccess && (
                <span className="text-[11px] font-mono text-sage dark:text-sage-light tracking-wider animate-fade-in">
                  Posted
                </span>
              )}
              {error && (
                <span className="text-[11px] font-mono text-rose dark:text-rose-light tracking-wider">
                  {error}
                </span>
              )}
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="group flex items-center gap-2 px-5 py-2.5 bg-ink dark:bg-dark-text text-paper dark:text-dark-bg font-mono text-xs tracking-[0.1em] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent dark:hover:bg-dark-accent hover:text-white rounded-sm"
              >
                <Send size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-ink-muted/30 dark:text-dark-text-muted/40 font-mono text-xs tracking-widest uppercase animate-pulse">
            Loading...
          </p>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16">
          <div className="font-serif text-4xl text-ink/5 dark:text-dark-text/10 mb-4 italic">&quot;</div>
          <p className="text-ink-muted/40 dark:text-dark-text-muted/50 font-serif italic text-lg">
            No thoughts yet - be the first
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {threads.map((comment, index) => (
            <div key={comment.id} className="space-y-1">
              <CommentBubble comment={comment} index={index} onReply={setReplyTarget} onReact={handleReact} />
              {comment.replies.map((reply, replyIndex) => (
                <CommentBubble
                  key={reply.id}
                  comment={reply}
                  index={replyIndex}
                  isReply
                  onReply={setReplyTarget}
                  onReact={handleReact}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}