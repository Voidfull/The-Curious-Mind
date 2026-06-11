import { Sun, Moon, ArrowLeft, Feather } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNavigateHome: () => void;
  showBack?: boolean;
}

export default function Header({ onNavigateHome, showBack }: HeaderProps) {
  const { isDark, toggle } = useTheme();
  const socialLinks = [
    { href: 'https://github.com/Voidfull', label: 'Github' },
    { href: 'https://www.linkedin.com/in/aziz-sbai-338026248/', label: 'LinkedIn' },
    { href: 'https://x.com/RMidlaner', label: 'Twitter' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-paper/70 dark:bg-dark-bg/80">
      {/* Accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/40 dark:via-dark-accent/40 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onNavigateHome}
              className="group flex items-center gap-1.5 text-sm text-ink-muted dark:text-dark-text-muted hover:text-accent dark:hover:text-dark-accent transition-colors mr-2"
              aria-label="Go back"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline font-mono text-xs tracking-wider uppercase">Back</span>
            </button>
          )}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <Feather size={20} className="text-accent dark:text-dark-accent group-hover:rotate-[-12deg] transition-transform duration-500" />
            </div>
            <div className="text-left">
              <h1 className="font-serif text-xl font-semibold text-ink dark:text-dark-text tracking-tight italic">
                The Curious Mind
              </h1>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/40 tracking-[0.25em] uppercase">
            {socialLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-2">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent dark:hover:text-dark-accent transition-colors duration-300"
                >
                  {link.label}
                </a>
                {index < socialLinks.length - 1 && <span className="pointer-events-none">·</span>}
              </span>
            ))}
          </div>
          <span className="hidden sm:block text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/40 tracking-widest uppercase">
            Sbai M. Aziz
          </span>
          <div className="w-px h-4 bg-paper-dark dark:bg-dark-border hidden sm:block" />
          <button
            onClick={toggle}
            className="relative p-2.5 rounded-full hover:bg-paper-dark/50 dark:hover:bg-dark-surface-2/60 text-ink-muted dark:text-dark-text-muted transition-all group"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={16} className="text-dark-accent group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <Moon size={16} className="group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-ink/5 dark:via-dark-border/50 to-transparent" />
    </header>
  );
}
