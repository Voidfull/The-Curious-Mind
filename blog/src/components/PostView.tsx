import { format } from 'date-fns';
import { Clock, Calendar, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import type { BlogPost } from '../data/posts-new';
import { getAdjacentPostsFrom, getRelatedPostsFrom } from '../data/posts-new';
import CommentSection from './CommentSection';
import { ArtisticDivider, WavyLine } from './Decorations';
import Ouroboros from './Ouroboros';
import { getPostViewCount, incrementPostView } from '../utils/viewStats';
import { trackEvent } from '../utils/analytics';

interface PostViewProps {
  post: BlogPost;
  posts: BlogPost[];
  onTagClick: (tag: string) => void;
  onPostNavigate: (postId: string) => void;
}

const categoryAccent: Record<string, string> = {
  essay: 'text-lavender dark:text-lavender-light',
  article: 'text-ocean dark:text-ocean-light',
  'interesting-find': 'text-sage dark:text-sage-light',
  note: 'text-gold dark:text-gold-light',
};

const categoryLabels: Record<string, string> = {
  essay: 'Essay',
  article: 'Article',
  'interesting-find': 'Interesting Find',
  note: 'Note',
};

function RelatedPostLink({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-4 border-l-[3px] border-l-accent/20 dark:border-l-dark-accent/30 rounded-r-lg hover:bg-paper-warm/40 dark:hover:bg-dark-surface/50 transition-all"
    >
      <span className="block text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase mb-2">
        {post.category}
      </span>
      <span className="block font-serif text-xl font-semibold text-ink dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors leading-snug">
        {post.title}
      </span>
      <span className="mt-2 block text-xs text-ink-muted/60 dark:text-dark-text-muted/60 leading-relaxed">
        {post.excerpt}
      </span>
    </button>
  );
}

export default function PostView({ post, posts, onTagClick, onPostNavigate }: PostViewProps) {
  const [viewCount, setViewCount] = useState(() => getPostViewCount(post.id));
  const { previous, next } = getAdjacentPostsFrom(posts, post.id);
  const relatedPosts = getRelatedPostsFrom(posts, post);

  useEffect(() => {
    setViewCount(incrementPostView(post.id));
    trackEvent('post_view', { postId: post.id });
  }, [post.id]);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 sm:py-20 animate-fade-in relative">
      <div className="flex justify-center mb-8">
        <Ouroboros size={140} opacity={0.7} />
      </div>

      <header className="mb-14 relative">
        <div className="flex items-center gap-3 mb-8">
          <span className={`text-[11px] font-mono uppercase tracking-[0.2em] ${categoryAccent[post.category]}`}>
            {categoryLabels[post.category]}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-ink/8 dark:from-dark-border/40 to-transparent" />
        </div>

        {post.coverEmoji && (
          <div className="mb-8 relative inline-block">
            <span className="text-6xl sm:text-7xl block">{post.coverEmoji}</span>
            <div className="absolute inset-0 -m-4 rounded-full bg-accent/5 dark:bg-dark-accent/10 blur-xl -z-10" />
          </div>
        )}

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-ink dark:text-dark-text leading-[1.1] tracking-tight">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="mt-4 text-xl sm:text-2xl text-ink-muted/60 dark:text-dark-text-muted/70 font-serif italic leading-relaxed">
            {post.subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-5 text-[11px] font-mono text-ink-muted/50 dark:text-dark-text-muted/60 tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            {format(new Date(post.date), 'MMMM d, yyyy')}
          </div>
          <span className="text-ink/10 dark:text-dark-border">·</span>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.readTime}
          </div>
          <span className="text-ink/10 dark:text-dark-border">·</span>
          <div className="flex items-center gap-1.5">
            <Eye size={12} />
            {viewCount}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-sm border border-ink/8 dark:border-dark-border/50 text-ink-muted/50 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase hover:border-accent/30 dark:hover:border-dark-accent/40 hover:text-accent dark:hover:text-dark-accent transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      <ArtisticDivider className="mb-12" />

      <div className="prose-blog text-ink-light dark:text-dark-text-muted [&>p:first-child]:first-letter:text-[3.5rem] [&>p:first-child]:first-letter:font-serif [&>p:first-child]:first-letter:font-semibold [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-3 [&>p:first-child]:first-letter:mt-1 [&>p:first-child]:first-letter:leading-[0.8] [&>p:first-child]:first-letter:text-accent dark:[&>p:first-child]:first-letter:text-dark-accent">
        <ReactMarkdown
          components={{
            a: ({ node: _node, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent dark:text-dark-accent hover:underline"
              />
            ),
            img: ({ node: _node, ...props }) => (
              <img
                {...props}
                className="mx-auto block max-w-3xl w-full h-72 sm:h-80 md:h-[28rem] object-cover rounded-3xl"
                alt={props.alt || ''}
                loading="lazy"
              />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-16 mb-4 flex items-center justify-center">
        <div className="flex items-center gap-3 text-ink-muted/20 dark:text-dark-text-muted/25">
          <div className="w-8 h-px bg-current" />
          <span className="text-lg">✦</span>
          <div className="w-8 h-px bg-current" />
        </div>
      </div>

      <WavyLine className="opacity-30 dark:opacity-20 mb-10" />

      {(previous || next) && (
        <nav className="grid sm:grid-cols-2 gap-4 mb-12" aria-label="Post navigation">
          {previous ? (
            <button
              onClick={() => onPostNavigate(previous.id)}
              className="group text-left p-4 border-l-[3px] border-l-ink/10 dark:border-l-dark-border rounded-r-lg hover:bg-paper-warm/40 dark:hover:bg-dark-surface/50 transition-all"
            >
              <span className="flex items-center gap-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase mb-2">
                <ArrowLeft size={12} /> Previous
              </span>
              <span className="font-serif text-lg font-semibold text-ink dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                {previous.title}
              </span>
            </button>
          ) : <div />}
          {next && (
            <button
              onClick={() => onPostNavigate(next.id)}
              className="group text-right p-4 border-r-[3px] border-r-ink/10 dark:border-r-dark-border rounded-l-lg hover:bg-paper-warm/40 dark:hover:bg-dark-surface/50 transition-all"
            >
              <span className="flex items-center justify-end gap-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase mb-2">
                Next <ArrowRight size={12} />
              </span>
              <span className="font-serif text-lg font-semibold text-ink dark:text-dark-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                {next.title}
              </span>
            </button>
          )}
        </nav>
      )}

      {relatedPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-serif text-2xl font-semibold text-ink dark:text-dark-text italic">Related thoughts</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-ink/5 dark:from-dark-border/30 to-transparent" />
          </div>
          <div className="space-y-3">
            {relatedPosts.map(related => (
              <RelatedPostLink key={related.id} post={related} onClick={() => onPostNavigate(related.id)} />
            ))}
          </div>
        </section>
      )}

      <CommentSection postId={post.id} />
    </article>
  );
}