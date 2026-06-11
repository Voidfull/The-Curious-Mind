import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  trail: { x: number; y: number }[];
  trailLength: number;
  angle: number;
  orbitSpeed: number;
  wanderAngle: number;
}

function createParticle(w: number, h: number, colorSet: number[], reducedMotion: boolean) {
  const speedFactor = reducedMotion ? 0.18 : 0.28;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * speedFactor,
    vy: (Math.random() - 0.5) * speedFactor,
    radius: Math.random() * 2.2 + 0.9,
    color: `${colorSet[0]},${colorSet[1]},${colorSet[2]}`,
    alpha: Math.random() * 0.35 + 0.08,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.012 + 0.004,
    trail: [],
    trailLength: reducedMotion ? 10 : 18,
    angle: Math.random() * Math.PI * 2,
    orbitSpeed: (Math.random() - 0.5) * 0.003,
    wanderAngle: Math.random() * Math.PI * 2,
  };
}

function ParticleCanvas({ compactMode, reducedMotion }: { compactMode: boolean; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const darkRef = useRef(isDark);
  darkRef.current = isDark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = {
      dark: [
        [232, 132, 90],
        [144, 112, 192],
        [74, 136, 168],
        [107, 153, 112],
        [184, 152, 64],
      ],
      light: [
        [192, 83, 43],
        [144, 112, 192],
        [74, 136, 168],
        [107, 153, 112],
        [184, 152, 64],
      ],
    };

    const count = reducedMotion ? 26 : compactMode ? 40 : 60;
    const connectionDist = compactMode ? 90 : 150;
    const particles: Particle[] = Array.from({ length: count }).map(() => {
      const palette = darkRef.current ? colors.dark : colors.light;
      const colorSet = palette[Math.floor(Math.random() * palette.length)];
      return createParticle(w, h, colorSet, reducedMotion);
    });

    let animId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const dark = darkRef.current;
      const baseAlpha = dark ? 1.05 : 0.75;

      for (const p of particles) {
        p.wanderAngle += (Math.random() - 0.5) * 0.08;
        p.vx += Math.cos(p.wanderAngle) * 0.01;
        p.vy += Math.sin(p.wanderAngle) * 0.01;
        p.angle += p.orbitSpeed;
        p.vx += Math.cos(p.angle) * 0.003;
        p.vy += Math.sin(p.angle) * 0.003;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;

        p.pulse += p.pulseSpeed;
        const pulseAlpha = p.alpha * (0.55 + Math.sin(p.pulse) * 0.4) * baseAlpha;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLength) p.trail.shift();

        if (p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            const point = p.trail[i];
            const prev = p.trail[i - 1];
            ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + point.x) / 2, (prev.y + point.y) / 2);
          }
          const grad = ctx.createLinearGradient(p.trail[0].x, p.trail[0].y, p.x, p.y);
          grad.addColorStop(0, `rgba(${p.color},0)`);
          grad.addColorStop(1, `rgba(${p.color},${pulseAlpha * 0.28})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.radius * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${pulseAlpha})`;
        ctx.fill();

        if (dark && p.radius > 1.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
          glow.addColorStop(0, `rgba(${p.color},${pulseAlpha * 0.18})`);
          glow.addColorStop(1, `rgba(${p.color},0)`);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particles[i].color},${(1 - dist / connectionDist) * 0.07 * baseAlpha})`;
            ctx.lineWidth = 0.35;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [compactMode, reducedMotion, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: compactMode ? 0.7 : 0.9 }}
    />
  );
}

function AuroraWave({ color, delay, duration, y, opacity = 0.45 }: { color: string; delay: number; duration: number; y: string; opacity?: number }) {
  return (
    <div
      className="absolute left-0 w-[200%] pointer-events-none"
      style={{
        top: y,
        height: '260px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent, ${color}, transparent)`,
        filter: 'blur(60px)',
        animation: `aurora-slide ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        opacity,
      }}
    />
  );
}

function PulsingHalo({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        border: `1px solid ${color}`,
        animation: `halo-expand 6s ease-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.2,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

function InkBlot({ path, x, y, size, color, rotateDuration, delay }: { path: string; x: string; y: string; size: number; color: string; rotateDuration: number; delay: number }) {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `float ${18 + delay * 2}s ease-in-out infinite, spin-slow ${rotateDuration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
      viewBox="0 0 200 200"
    >
      <path d={path} fill={color} transform="translate(100 100)" />
    </svg>
  );
}

function SacredRing({ x, y, size, color, duration, reverse }: { x: string; y: string; size: number; color: string; duration: number; reverse?: boolean }) {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `spin-slow ${duration}s linear infinite ${reverse ? 'reverse' : ''}`,
      }}
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="0.4" strokeDasharray="8 4 2 4" />
      <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="0.3" strokeDasharray="4 8" opacity="0.7" />
      <circle cx="50" cy="50" r="25" fill="none" stroke={color} strokeWidth="0.2" strokeDasharray="2 6" opacity="0.5" />
      <line x1="50" y1="3" x2="50" y2="12" stroke={color} strokeWidth="0.15" opacity="0.4" />
      <line x1="50" y1="88" x2="50" y2="97" stroke={color} strokeWidth="0.15" opacity="0.4" />
      <line x1="3" y1="50" x2="12" y2="50" stroke={color} strokeWidth="0.15" opacity="0.4" />
      <line x1="88" y1="50" x2="97" y2="50" stroke={color} strokeWidth="0.15" opacity="0.4" />
    </svg>
  );
}

function FloatingGlyph({ char, x, y, size, color, delay, duration }: { char: string; x: string; y: string; size: string; color: string; delay: number; duration: number }) {
  return (
    <div
      className="absolute font-serif select-none pointer-events-none italic"
      style={{
        left: x,
        top: y,
        fontSize: size,
        color,
        animation: `float ${duration}s ease-in-out infinite, twinkle ${duration * 0.7}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {char}
    </div>
  );
}

export default function AnimatedBackground() {
  const { isDark } = useTheme();
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      setCompactMode(mobileQuery.matches);
      setReducedMotion(motionQuery.matches);
    };

    update();
    mobileQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);

    return () => {
      mobileQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  const accent = isDark ? 'rgba(232,132,90,' : 'rgba(192,83,43,';
  const lavender = isDark ? 'rgba(144,112,192,' : 'rgba(120,90,170,';
  const ocean = isDark ? 'rgba(74,136,168,' : 'rgba(60,110,140,';
  const sage = isDark ? 'rgba(107,153,112,' : 'rgba(80,130,85,';
  const strokeColor = isDark ? `${accent}0.3)` : `${accent}0.18)`;
  const glyphOpacity = isDark ? 0.12 : 0.06;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <ParticleCanvas compactMode={compactMode} reducedMotion={reducedMotion} />

      <AuroraWave color={`${accent}0.04)`} delay={0} duration={30} y="5%" opacity={compactMode ? 0.24 : 0.5} />
      <AuroraWave color={`${lavender}0.03)`} delay={8} duration={40} y="35%" opacity={compactMode ? 0.2 : 0.45} />
      {!compactMode && <AuroraWave color={`${ocean}0.03)`} delay={15} duration={35} y="65%" opacity={0.35} />}

      <PulsingHalo x="20%" y="25%" size={200} color={`${accent}0.2)`} delay={0} />
      <PulsingHalo x="80%" y="70%" size={180} color={`${lavender}0.18)`} delay={1} />
      {!compactMode && <PulsingHalo x="50%" y="50%" size={300} color={`${sage}0.1)`} delay={0.5} />}

      {!compactMode && <InkBlot path="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,72.3,40.4C63.2,51.8,50.6,60.2,37.2,67.2C23.8,74.3,9.5,80.1,-4.8,87.2C-19.1,94.4,-33.4,103,-45.5,98.5C-57.5,93.9,-67.4,76.3,-74.3,59.4C-81.2,42.5,-85.1,26.3,-85.8,10.2C-86.5,-5.9,-83.9,-21.8,-76.2,-34.5C-68.4,-47.1,-55.5,-56.4,-42.1,-64C-28.7,-71.7,-14.3,-77.7,0.7,-78.8C15.8,-80,30.5,-83.5,44.7,-76.4Z" x="-3%" y="8%" size={280} color={`${accent}0.06)`} rotateDuration={80} delay={0} />}
      <InkBlot path="M39.9,-67.1C51.5,-61.4,60.5,-49.9,67.9,-37.3C75.3,-24.6,81.1,-10.9,80.4,2.2C79.8,15.4,72.7,28,63.8,38.4C54.9,48.9,44.1,57.2,32,65.4C19.9,73.6,6.4,81.7,-7.9,82.6C-22.3,83.5,-37.5,77.3,-48.1,67C-58.7,56.8,-64.7,42.5,-71.5,27.9C-78.3,13.3,-85.9,-1.5,-83.4,-14.5C-80.9,-27.5,-68.2,-38.5,-55.5,-44.1C-42.9,-49.8,-30.3,-50,-19.2,-56.3C-8.2,-62.6,1.3,-75,12.8,-78C24.3,-81,28.4,-72.8,39.9,-67.1Z" x="72%" y="3%" size={240} color={`${lavender}0.05)`} rotateDuration={65} delay={5} />
      {!compactMode && <InkBlot path="M47.2,-73.7C61.8,-68.6,74.7,-57.2,81.7,-43.2C88.7,-29.1,89.9,-12.4,87.6,3.4C85.3,19.2,79.5,34.1,70.8,46.8C62.1,59.5,50.5,70,37.3,76.6C24.1,83.2,9.3,85.9,-5.2,87.6C-19.7,89.3,-33.9,90,-45.6,83.8C-57.3,77.6,-66.5,64.5,-73.8,50.3C-81.1,36.1,-86.5,20.8,-85.9,5.7C-85.3,-9.4,-78.7,-24.3,-69.6,-37.1C-60.5,-49.9,-48.9,-60.6,-35.9,-66.4C-22.9,-72.2,-8.5,-73.1,6.1,-79.4C20.7,-85.7,32.6,-78.8,47.2,-73.7Z" x="55%" y="55%" size={220} color={`${ocean}0.05)`} rotateDuration={70} delay={10} />}
      {!compactMode && <InkBlot path="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,72.3,40.4C63.2,51.8,50.6,60.2,37.2,67.2C23.8,74.3,9.5,80.1,-4.8,87.2C-19.1,94.4,-33.4,103,-45.5,98.5C-57.5,93.9,-67.4,76.3,-74.3,59.4C-81.2,42.5,-85.1,26.3,-85.8,10.2C-86.5,-5.9,-83.9,-21.8,-76.2,-34.5C-68.4,-47.1,-55.5,-56.4,-42.1,-64C-28.7,-71.7,-14.3,-77.7,0.7,-78.8C15.8,-80,30.5,-83.5,44.7,-76.4Z" x="10%" y="70%" size={200} color={`${sage}0.04)`} rotateDuration={90} delay={15} />}

      <SacredRing x="10%" y="20%" size={200} color={strokeColor} duration={45} />
      <SacredRing x="82%" y="12%" size={160} color={strokeColor} duration={38} reverse />
      {!compactMode && <SacredRing x="70%" y="72%" size={220} color={strokeColor} duration={55} />}
      {!compactMode && <SacredRing x="25%" y="78%" size={130} color={strokeColor} duration={32} reverse />}

      <FloatingGlyph char="&" x="10%" y="12%" size="10rem" color={`${accent}${glyphOpacity})`} delay={0} duration={16} />
      {!compactMode && <FloatingGlyph char="∞" x="86%" y="18%" size="7rem" color={`${lavender}${glyphOpacity})`} delay={4} duration={20} />}
      <FloatingGlyph char="§" x="6%" y="68%" size="8rem" color={`${ocean}${glyphOpacity})`} delay={8} duration={18} />
      {!compactMode && <FloatingGlyph char="✦" x="78%" y="82%" size="6rem" color={`${accent}${glyphOpacity})`} delay={12} duration={22} />}
      <FloatingGlyph char="¶" x="90%" y="55%" size="5rem" color={`${sage}${glyphOpacity})`} delay={6} duration={14} />

      {isDark && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.03 }}>
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
