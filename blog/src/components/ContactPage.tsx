import { useState } from 'react';
import { Send } from 'lucide-react';
import { addContactMessage } from '../utils/contact';
import { trackEvent } from '../utils/analytics';

interface ContactPageProps {
  onNavigateHome: () => void;
}

export default function ContactPage({ onNavigateHome }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setStatus('error');
      return;
    }

    addContactMessage({ name: cleanName, email: cleanEmail, message: cleanMessage });
    trackEvent('contact_submit');
    setName('');
    setEmail('');
    setMessage('');
    setStatus('saved');
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24 animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent dark:text-dark-accent">Contact</span>
          <div className="flex-1 h-px bg-gradient-to-r from-ink/8 dark:from-dark-border/40 to-transparent" />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink dark:text-dark-text italic leading-tight">
          Send a note
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="relative p-6 art-border rounded-sm">
        <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
          Message
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Name"
            maxLength={80}
            className="px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/25 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/30 dark:focus:border-dark-accent/40 text-sm font-mono tracking-wide transition-all"
          />
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Email"
            maxLength={120}
            className="px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/25 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/30 dark:focus:border-dark-accent/40 text-sm font-mono tracking-wide transition-all"
          />
        </div>
        <textarea
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder="What's on your mind..."
          rows={7}
          maxLength={2000}
          className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/25 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/30 dark:focus:border-dark-accent/40 text-sm leading-relaxed resize-y transition-all"
        />
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className={`text-[11px] font-mono tracking-wider ${status === 'error' ? 'text-rose dark:text-rose-light' : 'text-ink-muted/35 dark:text-dark-text-muted/40'}`}>
            {status === 'saved' ? 'Saved locally' : status === 'error' ? 'All fields are required' : `${message.length}/2000`}
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[11px] font-mono tracking-[0.15em] uppercase text-ink-muted/50 dark:text-dark-text-muted/50 hover:text-accent dark:hover:text-dark-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group flex items-center gap-2 px-5 py-2.5 bg-ink dark:bg-dark-text text-paper dark:text-dark-bg font-mono text-xs tracking-[0.1em] uppercase transition-all hover:bg-accent dark:hover:bg-dark-accent hover:text-white rounded-sm"
            >
              <Send size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Send
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}