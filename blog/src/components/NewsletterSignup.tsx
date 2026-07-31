import { useState } from 'react';
import { Mail } from 'lucide-react';
import { addNewsletterSignup } from '../utils/newsletter';
import { trackEvent } from '../utils/analytics';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email.trim())) {
      setStatus('error');
      return;
    }

    addNewsletterSignup(email);
    trackEvent('newsletter_signup');
    setEmail('');
    setStatus('saved');
  };

  return (
    <div className="relative p-5 art-border rounded-sm">
      <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/50 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
        Notes
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2 text-ink-muted/60 dark:text-dark-text-muted/60">
          <Mail size={14} />
          <span className="text-[10px] font-mono tracking-[0.18em] uppercase">Newsletter</span>
        </div>
        <input
          type="email"
          value={email}
          onChange={event => {
            setEmail(event.target.value);
            setStatus('idle');
          }}
          placeholder="you@example.com"
          className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/25 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/30 dark:focus:border-dark-accent/40 text-xs font-mono tracking-wide transition-all"
        />
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[10px] font-mono tracking-wider ${status === 'error' ? 'text-rose dark:text-rose-light' : 'text-ink-muted/35 dark:text-dark-text-muted/40'}`}>
            {status === 'saved' ? 'Saved locally' : status === 'error' ? 'Invalid email' : 'Occasional updates'}
          </span>
          <button
            type="submit"
            className="text-[10px] font-mono tracking-[0.15em] uppercase text-ink-muted/60 dark:text-dark-text-muted/60 hover:text-accent dark:hover:text-dark-accent transition-colors"
          >
            Join
          </button>
        </div>
      </form>
    </div>
  );
}