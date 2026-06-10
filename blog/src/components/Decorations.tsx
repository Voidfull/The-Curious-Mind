export function ArtisticDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`art-divider my-8 ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" className="opacity-30">
        <path
          d="M10 2 L14 10 L10 18 L6 10 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export function WavyLine({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-full h-3 ${className}`}
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
    >
      <path
        d="M0,6 C30,2 60,10 90,6 C120,2 150,10 180,6 C210,2 240,10 270,6 C300,2 330,10 360,6 C380,3 400,6 400,6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-paper-dark dark:text-dark-border"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CornerDecoration({ position = 'top-left' }: { position?: string }) {
  const posClasses: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-[-1]',
  };

  return (
    <svg
      className={`absolute ${posClasses[position] || posClasses['top-left']} w-12 h-12 opacity-20 dark:opacity-30 text-ink-muted dark:text-dark-text-muted`}
      viewBox="0 0 50 50"
    >
      <path
        d="M0,0 L0,20 C0,8 8,0 20,0 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      />
    </svg>
  );
}

export function DotPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={`absolute opacity-[0.04] dark:opacity-[0.08] ${className}`} width="120" height="120" viewBox="0 0 120 120">
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 20}
            cy={10 + row * 20}
            r="1.5"
            fill="currentColor"
            className="text-ink dark:text-dark-text"
          />
        ))
      )}
    </svg>
  );
}

export function IssueNumber({ number }: { number: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-ink/10 dark:border-dark-border text-[10px] font-mono text-ink-muted dark:text-dark-text-muted">
      {String(number).padStart(2, '0')}
    </span>
  );
}
