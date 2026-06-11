import { format } from 'date-fns';
import { Clock, MessageCircle, ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '../data/posts-new';
import { getCommentCount } from '../data/comments';
import { IssueNumber, CornerDecoration } from './Decorations';

interface PostCardProps {
  post: BlogPost;
  onClick: () => void;
  index: number;
}

const categoryStyles: Record<string, { border: string; accent: string; label: string }> = {
  essay: {
    border: 'border-l-lavender/40 dark:border-l-lavender/50',
    accent: 'text-lavender dark:text-lavender-light',
    label: 'Essay',
  },
  article: {
    border: 'border-l-ocean/40 dark:border-l-ocean/50',
    accent: 'text-ocean dark:text-ocean-light',
    label: 'Article',
  },
  'interesting-find': {
    border: 'border-l-sage/40 dark:border-l-sage/50',
    accent: 'text-sage dark:text-sage-light',
    label: 'Find',
  },
  note: {
    border: 'border-l-gold/40 dark:border-l-gold/50',
    accent: 'text-gold dark:text-gold-light',
    label: 'Note',
  },
};

export default function PostCard({ post, onClick, index }: PostCardProps) {
  const commentCount = getCommentCount(post.id);
  const style = categoryStyles[post.category];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open post ${post.title}`}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
      <div className={`relative p-6 sm:p-8 border-l-[3px] ${style.border} hover:bg-paper-warm/40 dark:hover:bg-dark-surface/50 transition-all duration-500 rounded-r-lg`}>
        {/* Corner decoration on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <CornerDecoration position="top-right" />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <IssueNumber number={index + 1} />
          <span className={`text-[11px] font-mono uppercase tracking-[0.15em] ${style.accent}`}>
            {style.label}
          </span>
          <span className="text-ink-muted/30 dark:text-dark-border">·</span>
          <time className="text-[11px] font-mono text-ink-muted dark:text-dark-text-muted tracking-wider">
            {format(new Date(post.date), 'MMM dd, yyyy')}
          </time>
        </div>

        {/* Title + emoji */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-2xl sm:text-[1.75rem] font-semibold text-ink dark:text-dark-text leading-snug tracking-tight group-hover:text-accent dark:group-hover:text-dark-accent transition-colors duration-300">
              {post.title}
              <ArrowUpRight
                size={18}
                className="inline-block ml-2 opacity-0 -translate-x-2 translate-y-1 group-hover:opacity-60 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
              />
            </h2>
            {post.subtitle && (
              <p className="mt-2 text-sm italic text-ink-muted dark:text-dark-text-muted font-serif text-[1.05rem]">
                — {post.subtitle}
              </p>
            )}
            <p className="mt-3 text-[0.95rem] text-ink-light/80 dark:text-dark-text-muted/80 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>

            {/* Footer */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-muted/60 dark:text-dark-text-muted/60">
                <Clock size={12} />
                {post.readTime}
              </div>
              {commentCount > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-muted/60 dark:text-dark-text-muted/60">
                  <MessageCircle size={12} />
                  {commentCount}
                </div>
              )}
              <div className="flex-1" />
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-sm border border-ink/5 dark:border-dark-border/50 text-ink-muted/70 dark:text-dark-text-muted/60 tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Emoji card */}
          {post.coverEmoji && (
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-paper-warm/60 dark:bg-dark-surface-2/50 border border-ink/[0.03] dark:border-dark-border/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 flex-shrink-0">
              <span className="text-2xl">{post.coverEmoji}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
