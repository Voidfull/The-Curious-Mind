import { categories } from '../data/posts-new';
import NewsletterSignup from './NewsletterSignup';

interface SidebarProps {
  activeCategory: string;
  activeTag: string | null;
  onCategoryChange: (category: string) => void;
  onTagClick: (tag: string) => void;
  allTags: string[];
}

const catDecorations: Record<string, string> = {
  all: '◈',
  essay: '✦',
  article: '◇',
  'interesting-find': '○',
  note: '·',
};

export default function Sidebar({ activeCategory, activeTag, onCategoryChange, onTagClick, allTags }: SidebarProps) {
  return (
    <aside className="space-y-10">
      {/* About */}
      <div className="relative p-5 art-border rounded-sm">
        <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
          About
        </div>
        <p className="text-sm leading-relaxed text-ink-light/70 dark:text-dark-text-muted/80 font-light">
          A collection of essays, articles, and interesting things I've shared.{' '}
          <span className="font-serif italic">Writing helps me think.</span>{' '}
          Maybe some of it will help you think too.
        </p>
      </div>

      <NewsletterSignup />

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-px bg-ink/20 dark:bg-dark-border" />
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-muted/50 dark:text-dark-text-muted/50">
            Categories
          </h3>
          <div className="flex-1 h-px bg-ink/5 dark:bg-dark-border/30" />
        </div>
        <div className="space-y-0.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-all text-left group rounded-sm ${
                activeCategory === cat.id && !activeTag
                  ? 'text-accent dark:text-dark-accent'
                  : 'text-ink-light/60 dark:text-dark-text-muted/70 hover:text-ink dark:hover:text-dark-text'
              }`}
            >
              <span className={`text-xs transition-transform duration-300 ${activeCategory === cat.id && !activeTag ? 'scale-125' : 'group-hover:scale-110'}`}>
                {catDecorations[cat.id] || '·'}
              </span>
              <span className="font-mono text-xs tracking-wider uppercase">
                {cat.label}
              </span>
              {activeCategory === cat.id && !activeTag && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent dark:bg-dark-accent animate-fade-in" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-px bg-ink/20 dark:bg-dark-border" />
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-muted/50 dark:text-dark-text-muted/50">
            Topics
          </h3>
          <div className="flex-1 h-px bg-ink/5 dark:bg-dark-border/30" />
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, i) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`text-[11px] font-mono px-2.5 py-1 tracking-wider transition-all duration-300 rounded-sm ${
                activeTag === tag
                  ? 'bg-accent dark:bg-dark-accent text-white border border-accent dark:border-dark-accent shadow-sm'
                  : 'border border-ink/8 dark:border-dark-border/50 text-ink-muted/60 dark:text-dark-text-muted/60 hover:border-accent/30 dark:hover:border-dark-accent/40 hover:text-accent dark:hover:text-dark-accent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {activeTag && (
          <button
            onClick={() => onTagClick('')}
            className="mt-3 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-accent dark:hover:text-dark-accent tracking-[0.15em] uppercase transition-colors"
          >
            ✕ Clear filter
          </button>
        )}
      </div>

      {/* Quote */}
      <div className="pt-4">
        <div className="h-px bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5 dark:from-dark-border/20 dark:via-dark-border/50 dark:to-dark-border/20 mb-6" />
        <p className="font-serif text-base italic text-ink-muted/40 dark:text-dark-text-muted/40 leading-relaxed">
          "Power is given only to those who dare to lower themselves and pick it up. Only one thing matters, one thing; to be able to dare!"
        </p>
        <p className="mt-1 text-[10px] font-mono text-ink-muted/25 dark:text-dark-text-muted/30 tracking-widest uppercase">
          — Fyodor Dostoevsky
        </p>
      </div>
    </aside>
  );
}
