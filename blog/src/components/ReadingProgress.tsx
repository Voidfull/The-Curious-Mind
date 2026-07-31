import { useEffect, useState } from 'react';

export default function ReadingProgress({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [active]);

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] h-[2px] pointer-events-none">
      <div
        className="h-full bg-accent dark:bg-dark-accent transition-[width] duration-150"
        style={{ width: active ? `${progress}%` : '0%' }}
      />
    </div>
  );
}