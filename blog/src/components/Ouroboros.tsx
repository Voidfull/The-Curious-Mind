import { useTheme } from '../context/ThemeContext';

interface OuroborosProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export default function Ouroboros({ className = '', size = 200, opacity = 1 }: OuroborosProps) {
  const { isDark } = useTheme();

  const bodyStroke = isDark ? '#e8845a' : '#c0532b';
  const accentGold = isDark ? '#d4b56e' : '#a68a4b';
  const opacityHigh = isDark ? 0.5 : 0.3;
  const opacityMid = isDark ? 0.3 : 0.18;
  const opacityLow = isDark ? 0.15 : 0.08;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${isDark ? 'rgba(232,132,90,0.12)' : 'rgba(192,83,43,0.05)'}, transparent 70%)`,
          animation: 'pulse-glow 8s ease-in-out infinite',
        }}
      />
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        style={{ animation: 'ouroboros-rotate 40s linear infinite' }}
      >
        <defs>
          <linearGradient id="ouro-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bodyStroke} stopOpacity={opacityHigh} />
            <stop offset="50%" stopColor={bodyStroke} stopOpacity={opacityMid} />
            <stop offset="100%" stopColor={bodyStroke} stopOpacity={opacityHigh} />
          </linearGradient>
          <pattern id="ouro-scales" patternUnits="userSpaceOnUse" width="10" height="8" patternTransform="rotate(25)">
            <path d="M0,4 Q2.5,1 5,4 Q2.5,7 0,4" fill="none" stroke={bodyStroke} strokeWidth="0.6" opacity="0.2" />
          </pattern>
        </defs>

        {/* Main circle body */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="url(#ouro-body-grad)" strokeWidth="26" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="url(#ouro-scales)" strokeWidth="20" />
        <circle cx="200" cy="200" r="150" fill="none" stroke={bodyStroke} strokeWidth="10" opacity={opacityLow} />

        {/* Vertebrae dots */}
        <g opacity={opacityLow}>
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 200 + 150 * Math.cos(rad);
            const y = 200 + 150 * Math.sin(rad);
            return <circle key={i} cx={x} cy={y} r="3" fill={accentGold} />;
          })}
        </g>

        {/* Snake head */}
        <g transform="translate(200, 50)">
          <circle cx="0" cy="0" r="35" fill="url(#ouro-body-grad)" opacity={opacityMid} />
          <path
            d="M-22,-12 C-30,-3 -30,8 -20,14 L-4,18 C4,20 14,18 22,14 C30,8 30,-3 22,-12 C16,-22 8,-24 -8,-24 C-16,-24 -18,-18 -22,-12Z"
            fill={bodyStroke} fillOpacity={opacityHigh}
            stroke={bodyStroke} strokeWidth="1" strokeLinejoin="round"
          />
          {/* Eyes */}
          <ellipse cx="-10" cy="-4" rx="3.5" ry="2.5" fill={isDark ? '#0a0a0f' : '#1c1917'} />
          <ellipse cx="-10" cy="-4" rx="1.8" ry="1.3" fill={accentGold} />
          <ellipse cx="10" cy="-4" rx="3.5" ry="2.5" fill={isDark ? '#0a0a0f' : '#1c1917'} />
          <ellipse cx="10" cy="-4" rx="1.8" ry="1.3" fill={accentGold} />
          {/* Mouth / tail bite */}
          <path d="M-18,10 Q0,18 18,10" stroke={bodyStroke} strokeWidth="1.5" fill="none" opacity={opacityMid} />
          {/* Fangs */}
          <path d="M-8,10 L-10,19 L-6,12" fill={isDark ? '#e8e6e3' : '#4a3530'} opacity={opacityHigh} />
          <path d="M6,10 L8,19 L4,12" fill={isDark ? '#e8e6e3' : '#4a3530'} opacity={opacityHigh} />
          {/* Tongue */}
          <path d="M-1,18 L-2,26 M1,18 L2,26" stroke={bodyStroke} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={opacityMid} />
        </g>

        {/* Upper interior — bare branches */}
        <g transform="translate(200,145)" opacity={opacityMid}>
          <path d="M0,50 C0,30 0,10 0,-20" fill="none" stroke={bodyStroke} strokeWidth="2" strokeLinecap="round"/>
          <path d="M0,0 C-20,-5 -40,-12 -55,-5" fill="none" stroke={bodyStroke} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M0,0 C20,-5 40,-12 55,-5" fill="none" stroke={bodyStroke} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M-40,-10 C-48,-22 -52,-28 -60,-30" fill="none" stroke={bodyStroke} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <path d="M40,-10 C48,-22 52,-28 60,-30" fill="none" stroke={bodyStroke} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <circle cx="-60" cy="-30" r="2.5" fill={accentGold} opacity={opacityLow}/>
          <circle cx="60" cy="-30" r="2.5" fill={accentGold} opacity={opacityLow}/>
          <circle cx="0" cy="-20" r="2" fill={accentGold} opacity={opacityLow}/>
        </g>

        {/* Lower interior — bonsai */}
        <g transform="translate(200,255)" opacity={opacityMid}>
          <path d="M-15,40 L15,40 L13,52 L-13,52 Z" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="1"/>
          <path d="M0,40 C0,25 2,10 0,-10 C-2,-25 2,-35 0,-50" fill="none" stroke={bodyStroke} strokeWidth="4" strokeLinecap="round"/>
          <path d="M-2,-15 C-18,-18 -35,-12 -50,-20" fill="none" stroke={bodyStroke} strokeWidth="3" strokeLinecap="round"/>
          <path d="M-2,-15 C18,-18 35,-12 50,-20" fill="none" stroke={bodyStroke} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="-45" cy="-22" r="12" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8"/>
          <circle cx="45" cy="-22" r="12" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8"/>
          <circle cx="0" cy="-58" r="10" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8"/>
        </g>

        {/* Center infinity symbol */}
        <text x="200" y="208" textAnchor="middle" fontSize="14" fill={accentGold} fontFamily="serif" fontStyle="italic" opacity={opacityLow}>∞</text>
      </svg>
    </div>
  );
}
