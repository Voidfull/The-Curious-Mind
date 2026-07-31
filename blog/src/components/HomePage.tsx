import { Search, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { getPostsByCategory, getPostsByTag } from '../data/posts-new';
import type { BlogPost } from '../data/posts-new';
import PostCard from './PostCard';
import Sidebar from './Sidebar';
import { WavyLine } from './Decorations';
import Ouroboros from './Ouroboros';
import { trackEvent } from '../utils/analytics';

interface HomePageProps {
  onPostClick: (postId: string) => void;
  activeCategory: string;
  activeTag: string | null;
  onCategoryChange: (category: string) => void;
  onTagClick: (tag: string) => void;
}

export default function HomePage({
  onPostClick,
  activeCategory,
  activeTag,
  onCategoryChange,
  onTagClick,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    let result: BlogPost[];

    if (activeTag) {
      result = getPostsByTag(activeTag);
    } else {
      result = getPostsByCategory(activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        post =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.subtitle?.toLowerCase().includes(q) ||
          post.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeCategory, activeTag, searchQuery]);

  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    const timeoutId = window.setTimeout(() => {
      trackEvent('search', { query: cleanQuery, results: filteredPosts.length });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [filteredPosts.length, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16 relative">
      <div className="mb-16 animate-fade-in relative text-center">
        <div className="flex justify-center mb-6">
          <Ouroboros size={280} opacity={0.85} />
        </div>

        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-ink/15 dark:to-dark-accent/30" />
          <span className="text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/50 tracking-[0.25em] uppercase">
            A personal collection
          </span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-ink/15 dark:to-dark-accent/30" />
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink dark:text-dark-text leading-[1.15] tracking-tight">
          <span className="italic">The</span>{' '}
          <span className="relative inline-block">
            Curious
            <svg className="absolute -bottom-2 left-0 w-full h-3 opacity-20 dark:opacity-30" viewBox="0 0 200 12" preserveAspectRatio="none">
              <path
                d="M0,8 C40,2 60,10 100,6 C140,2 160,10 200,4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-accent dark:text-dark-accent"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          Mind
        </h1>

        <p className="mt-5 text-base sm:text-lg text-ink-light/70 dark:text-dark-text-muted/80 max-w-xl mx-auto leading-relaxed font-light">
          Essays, articles, and interesting things I've written with 🧡.
          <span className="block mt-1 text-ink-muted/50 dark:text-dark-text-muted/50 text-sm italic font-serif">
            Thinking out loud.
          </span>
        </p>

        <WavyLine className="mt-10 opacity-40 dark:opacity-30 max-w-md mx-auto" />
      </div>

      <div className="flex flex-col lg:flex-row gap-14">
        <main className="flex-1 min-w-0">
          <div className="relative mb-10 animate-fade-in" style={{ animationDelay: '150ms', opacity: 0 }}>
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/30 dark:text-dark-text-muted/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search essays, articles, finds..."
              className="w-full pl-11 pr-10 py-3 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/25 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/30 dark:focus:border-dark-accent/40 text-sm font-mono tracking-wide transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted/30 hover:text-ink-muted dark:text-dark-text-muted/40 dark:hover:text-dark-text-muted transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {activeTag && (
            <div className="mb-8 flex items-center justify-center gap-3 text-sm animate-fade-in">
              <span className="text-ink-muted/60 dark:text-dark-text-muted/60 font-mono text-xs tracking-wider">Filtered by</span>
              <span className="px-3 py-1 border border-accent/30 dark:border-dark-accent/40 text-accent dark:text-dark-accent text-xs font-mono rounded-sm tracking-wider">
                {activeTag}
              </span>
              <button
                onClick={() => onTagClick('')}
                className="text-ink-muted/40 hover:text-accent dark:hover:text-dark-accent text-xs font-mono tracking-wider hover:underline underline-offset-4"
              >
                clear
              </button>
            </div>
          )}

          {filteredPosts.length > 0 ? (
            <div className="space-y-1">
              {filteredPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  onClick={() => onPostClick(post.id)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="font-serif text-6xl text-ink/10 dark:text-dark-text/15 mb-4 italic">?</div>
              <p className="text-ink-muted dark:text-dark-text-muted font-serif text-xl italic">
                Nothing found here
              </p>
              <p className="text-ink-muted/40 dark:text-dark-text-muted/50 text-sm mt-2 font-mono tracking-wider">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </main>

        <div className="lg:w-60 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <Sidebar
              activeCategory={activeCategory}
              activeTag={activeTag}
              onCategoryChange={onCategoryChange}
              onTagClick={onTagClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}