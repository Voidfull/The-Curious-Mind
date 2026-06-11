import { WavyLine } from './Decorations';
import Ouroboros from './Ouroboros';

export default function Footer() {
  return (
    <footer className="mt-24 relative">
      <WavyLine className="opacity-20 dark:opacity-15" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Small Ouroboros as footer mark */}
          <div style={{ width: 60, height: 60, opacity: 0.2 }}>
            <Ouroboros />
          </div>

          <p className="font-serif text-sm italic text-ink-muted/40 dark:text-dark-text-muted/50 max-w-md leading-relaxed">
            Made with curiosity and late-night coffee.
            <br />
            All thoughts are my own, all mistakes are mine too.
          </p>

          <div className="flex items-center gap-6 text-[10px] font-mono tracking-[0.2em] uppercase text-ink-muted/30 dark:text-dark-text-muted/40">
            <a href="https://www.linkedin.com/in/aziz-sbai-338026248/" className="hover:text-accent dark:hover:text-dark-accent transition-colors duration-300">Linkedin</a>
            <span>·</span>
            <a href="https://github.com/Voidfull" className="hover:text-accent dark:hover:text-dark-accent transition-colors duration-300">GitHub</a>
            <span>·</span>
            <a href="https://x.com/RMidlaner" className="hover:text-accent dark:hover:text-dark-accent transition-colors duration-300">Twitter</a>
          </div>

          <p className="text-[9px] font-mono text-ink-muted/20 dark:text-dark-text-muted/30 tracking-[0.3em] uppercase mt-2">
            © {new Date().getFullYear()} The Curious Mind
          </p>
        </div>
      </div>
    </footer>
  );
}
