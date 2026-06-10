import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';
import { getCommentsForPost, addComment, type Comment } from '../data/comments';

interface CommentSectionProps {
  postId: string;
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

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

function CommentBubble({ comment, index }: { comment: Comment; index: number }) {
  const date = new Date(comment.timestamp);
  const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
  const color = getAvatarColor(comment.username);

  return (
    <div
      className="group animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0 font-serif text-sm font-semibold italic`}>
          {getInitial(comment.username)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-xs tracking-wider text-ink dark:text-dark-text">
              {comment.username}
            </span>
            <span className="text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-wider" title={format(date, 'PPpp')}>
              {isRecent ? formatDistanceToNow(date, { addSuffix: true }) : format(date, 'MMM d, yyyy')}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-light/80 dark:text-dark-text-muted/80 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState(() => getCommentsForPost(postId));
  const [username, setUsername] = useState(() => localStorage.getItem('blog_username') || '');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    if (username.trim()) {
      localStorage.setItem('blog_username', username.trim());
    }

    setTimeout(() => {
      const newComment = addComment(postId, username || 'anonymous', content);
      setComments(prev => [newComment, ...prev]);
      setContent('');
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 300);
  };

  return (
    <section className="mt-16 pt-12">
      {/* Header */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative p-6 art-border rounded-sm">
          <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
            Leave a note
          </div>

          <div className="mb-5">
            <label htmlFor="username" className="block text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/60 mb-2 tracking-[0.15em] uppercase">
              Your name
              <span className="text-ink-muted/30 dark:text-dark-text-muted/40 normal-case tracking-normal ml-1">(or stay anonymous)</span>
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
            <label htmlFor="comment" className="block text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/60 mb-2 tracking-[0.15em] uppercase">
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

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-ink-muted/25 dark:text-dark-text-muted/30 tracking-wider">
              {content.length}/2000
            </span>
            <div className="flex items-center gap-4">
              {showSuccess && (
                <span className="text-[11px] font-mono text-sage dark:text-sage-light tracking-wider animate-fade-in">
                  ✓ Posted
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

      {/* Comments */}
      {comments.length === 0 ? (
        <div className="text-center py-16">
          <div className="font-serif text-4xl text-ink/5 dark:text-dark-text/10 mb-4 italic">"</div>
          <p className="text-ink-muted/40 dark:text-dark-text-muted/50 font-serif italic text-lg">
            No thoughts yet — be the first
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map((comment, index) => (
            <CommentBubble key={comment.id} comment={comment} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
