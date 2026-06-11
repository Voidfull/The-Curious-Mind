import { WavyLine } from './Decorations';
import Ouroboros from './Ouroboros';

export default function Footer() {
  return (
    <footer className="mt-24 relative z-10">
      <WavyLine className="opacity-20 dark:opacity-15" />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div style={{ width: 60, height: 60, opacity: 0.2 }}>
            <Ouroboros />
          </div>
          <p className="font-serif text-sm italic text-ink-muted/40 dark:text-dark-text-muted/50 max-w-md leading-relaxed">
            Made with curiosity and late-night coffee.
            <br />
            All thoughts are my own, all mistakes are mine too.
          </p>
          <p className="text-[9px] font-mono text-ink-muted/20 dark:text-dark-text-muted/30 tracking-[0.3em] uppercase mt-2">
            © {new Date().getFullYear()} The Curious Mind
          </p>
        </div>
      </div>
    </footer>
  );
}
