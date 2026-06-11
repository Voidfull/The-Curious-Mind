import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      radius: number; color: string;
      alpha: number; pulse: number; pulseSpeed: number;
      wanderAngle: number;
    }

    const colors = {
      dark: [[232,132,90],[144,112,192],[74,136,168]],
      light: [[192,83,43],[144,112,192],[74,136,168]],
    };

    // Reduced from 60 to 25 particles
    const particles: Particle[] = Array.from({ length: 25 }, () => {
      const colorSet = isDarkRef.current ? colors.dark : colors.light;
      const c = colorSet[Math.floor(Math.random() * colorSet.length)];
      return {
        x: Math.random() * (w || 800),
        y: Math.random() * (h || 600),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.8,
        color: `${c[0]},${c[1]},${c[2]}`,
        alpha: Math.random() * 0.35 + 0.08,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        wanderAngle: Math.random() * Math.PI * 2,
      };
    });

    const connectionDist = 120;
    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      const dark = isDarkRef.current;
      const baseAlpha = dark ? 1.1 : 0.6;

      for (const p of particles) {
        p.wanderAngle += (Math.random() - 0.5) * 0.08;
        p.vx += Math.cos(p.wanderAngle) * 0.015;
        p.vy += Math.sin(p.wanderAngle) * 0.015;
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;
        p.pulse += p.pulseSpeed;
        const a = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4) * baseAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${a})`;
        ctx.fill();
      }

      // Only draw connections every 2 frames
      if (frame % 2 === 0) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDist) {
              const alpha = (1 - dist / connectionDist) * 0.07 * baseAlpha;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${particles[i].color},${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}

export default function AnimatedBackground() {
  const { isDark } = useTheme();
  const accent = isDark ? 'rgba(232,132,90,' : 'rgba(192,83,43,';
  const lavender = isDark ? 'rgba(144,112,192,' : 'rgba(120,90,170,';
  const strokeColor = isDark ? `${accent}0.25)` : `${accent}0.12)`;
  const glyphOpacity = isDark ? 0.08 : 0.04;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <ParticleCanvas />

      {/* Single subtle aurora */}
      <div
        className="absolute left-0 w-[200%] pointer-events-none"
        style={{
          top: '20%', height: '250px',
          background: `linear-gradient(90deg, transparent, ${accent}0.03), transparent, ${accent}0.03), transparent)`,
          filter: 'blur(80px)',
          animation: 'aurora-slide 35s linear infinite',
          opacity: 0.4,
        }}
      />

      {/* Two sacred rings instead of four */}
      <svg className="absolute pointer-events-none" style={{ left: '10%', top: '20%', width: 180, height: 180, animation: 'spin-slow 45s linear infinite' }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="0.4" strokeDasharray="8 4 2 4" />
        <circle cx="50" cy="50" r="30" fill="none" stroke={strokeColor} strokeWidth="0.25" strokeDasharray="4 8" opacity="0.6" />
      </svg>
      <svg className="absolute pointer-events-none" style={{ left: '75%', top: '65%', width: 200, height: 200, animation: 'spin-slow 55s linear infinite reverse' }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="0.4" strokeDasharray="8 4 2 4" />
        <circle cx="50" cy="50" r="30" fill="none" stroke={strokeColor} strokeWidth="0.25" strokeDasharray="4 8" opacity="0.6" />
      </svg>

      {/* Two floating glyphs instead of five */}
      <div className="absolute font-serif select-none pointer-events-none italic" style={{ left: '8%', top: '10%', fontSize: '8rem', color: `${accent}${glyphOpacity})`, animation: 'float 16s ease-in-out infinite' }}>
        &amp;
      </div>
      <div className="absolute font-serif select-none pointer-events-none italic" style={{ left: '85%', top: '20%', fontSize: '6rem', color: `${lavender}${glyphOpacity})`, animation: 'float 20s ease-in-out infinite 4s' }}>
        ∞
      </div>

      {isDark && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.025 }}>
          <defs>
            <pattern id="bg-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid)" />
        </svg>
      )}
    </div>
  );
}
