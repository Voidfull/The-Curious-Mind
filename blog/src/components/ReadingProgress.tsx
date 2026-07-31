import { useEffect, useRef } from 'react';

export default function ReadingProgress({ active }: { active: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;

    const setScale = (scale: number) => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${scale})`;
      }
    };

    if (!active) {
      setScale(0);
      return () => cancelAnimationFrame(frameId);
    }

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      setScale(progress);
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = 0;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [active]);

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] h-[2px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-accent dark:bg-dark-accent transform-gpu transition-transform duration-75 will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}