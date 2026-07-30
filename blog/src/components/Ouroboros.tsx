import { useTheme } from '../context/ThemeContext';



interface OuroborosProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export default function Ouroboros({ className = '', size = 200, opacity = 1 }: OuroborosProps) {
  const { isDark } = useTheme();

  // Colors
  const bodyStroke = isDark ? '#e8845a' : '#c0532b';
  const bodyStrokeDark = isDark ? '#b8654a' : '#8c3a20';
  const accentGold = isDark ? '#d4b56e' : '#a68a4b';
  const accentDeep = isDark ? '#2a2a3a' : '#4a3530';
  const opacityHigh = isDark ? 0.55 : 0.35;
  const opacityMid = isDark ? 0.35 : 0.2;
  const opacityLow = isDark ? 0.18 : 0.1;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        opacity,
        perspective: '1000px',
      }}
    >
      {/* Ambient glow behind the whole thing */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background: `radial-gradient(ellipse at center, ${isDark ? 'rgba(232,132,90,0.15)' : 'rgba(192,83,43,0.06)'}, transparent 70%)`,
        }}
      />

      {/* 3D-breathing container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          animation: 'ouroboros-scale-breathe 8s ease-in-out infinite',
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          viewBox="0 0 400 400"
          width="100%"
          height="100%"
          style={{
            animation: 'ouroboros-rotate 40s linear infinite',
          }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="ouro-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={bodyStroke} stopOpacity={opacityHigh} />
              <stop offset="50%" stopColor={bodyStrokeDark} stopOpacity={opacityMid} />
              <stop offset="100%" stopColor={bodyStroke} stopOpacity={opacityHigh} />
            </linearGradient>

            <linearGradient id="ouro-spine-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={bodyStroke} stopOpacity={opacityLow} />
              <stop offset="100%" stopColor={accentGold} stopOpacity={opacityLow} />
            </linearGradient>

            <radialGradient id="ouro-head-glow">
              <stop offset="0%" stopColor={bodyStroke} stopOpacity={opacityHigh} />
              <stop offset="100%" stopColor={bodyStroke} stopOpacity={0} />
            </radialGradient>

            {/* Scale pattern */}
            <pattern id="ouro-scales" patternUnits="userSpaceOnUse" width="10" height="8" patternTransform="rotate(25)">
              <path d="M0,4 Q2.5,1 5,4 Q2.5,7 0,4" fill="none" stroke={bodyStroke} strokeWidth="0.6" opacity="0.25" />
              <circle cx="2.5" cy="4" r="0.8" fill={bodyStroke} opacity="0.15" />
            </pattern>

            {/* Dotted texture */}
            <pattern id="ouro-dots" patternUnits="userSpaceOnUse" width="6" height="6">
              <circle cx="3" cy="3" r="0.5" fill={accentDeep} opacity="0.2" />
            </pattern>
          </defs>

          {/* ============ OUTER INFINITY LOOP — body ============ */}
          {/* Thicker outer body stroke with gradient */}
          <path
            d="M200,50
               C290,50 350,110 350,175
               C350,240 290,300 200,300
               C110,300 50,240 50,175
               C50,110 110,50 200,50Z
               M200,90
               C270,90 320,135 320,175
               C320,215 270,260 200,260
               C130,260 80,215 80,175
               C80,135 130,90 200,90Z"
            fill="none"
            stroke="url(#ouro-body-grad)"
            strokeWidth="28"
            strokeLinecap="round"
            opacity={opacityHigh}
          />

          {/* Inner thinner body line */}
          <path
            d="M200,60
               C285,60 340,115 340,175
               C340,235 285,290 200,290
               C115,290 60,235 60,175
               C60,115 115,60 200,60Z"
            fill="none"
            stroke={bodyStroke}
            strokeWidth="12"
            strokeLinecap="round"
            opacity={opacityLow}
          />

          {/* Scale-pattern overlay on the body */}
          <path
            d="M200,50
               C290,50 350,110 350,175
               C350,240 290,300 200,300
               C110,300 50,240 50,175
               C50,110 110,50 200,50Z"
            fill="none"
            stroke="url(#ouro-scales)"
            strokeWidth="22"
            strokeLinecap="round"
          />

          {/* Dotted skin texture overlay */}
          <path
            d="M200,50
               C290,50 350,110 350,175
               C350,240 290,300 200,300
               C110,300 50,240 50,175
               C50,110 110,50 200,50Z"
            fill="none"
            stroke="url(#ouro-dots)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* ============ BONY SPINE (vertebrae) on the inside of the loop ============ */}
          {/* Upper loop spine — top half */}
          <g opacity={opacityMid} stroke={bodyStrokeDark} fill="none">
            {/* Vertebrae along top arc */}
            <line x1="75" y1="175" x2="95" y2="175" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="165" x2="72" y2="155" strokeWidth="1.5" />
            <line x1="60" y1="185" x2="72" y2="195" strokeWidth="1.5" />

            <line x1="90" y1="120" x2="110" y2="128" strokeWidth="3" strokeLinecap="round" />
            <line x1="85" y1="108" x2="100" y2="115" strokeWidth="1.5" />
            <line x1="95" y1="132" x2="110" y2="138" strokeWidth="1.5" />

            <line x1="145" y1="90" x2="165" y2="98" strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="78" x2="155" y2="85" strokeWidth="1.5" />
            <line x1="150" y1="100" x2="165" y2="108" strokeWidth="1.5" />

            <line x1="215" y1="85" x2="235" y2="85" strokeWidth="3" strokeLinecap="round" />
            <line x1="220" y1="73" x2="230" y2="73" strokeWidth="1.5" />
            <line x1="220" y1="97" x2="230" y2="97" strokeWidth="1.5" />

            <line x1="290" y1="100" x2="305" y2="108" strokeWidth="3" strokeLinecap="round" />
            <line x1="290" y1="88" x2="300" y2="95" strokeWidth="1.5" />
            <line x1="295" y1="110" x2="310" y2="118" strokeWidth="1.5" />

            <line x1="325" y1="150" x2="335" y2="160" strokeWidth="3" strokeLinecap="round" />
            <line x1="328" y1="138" x2="338" y2="145" strokeWidth="1.5" />

            {/* Right-side spine */}
            <line x1="325" y1="190" x2="335" y2="200" strokeWidth="3" strokeLinecap="round" />
            <line x1="325" y1="195" x2="338" y2="198" strokeWidth="1.5" />

            <line x1="290" y1="245" x2="305" y2="248" strokeWidth="3" strokeLinecap="round" />
            <line x1="290" y1="233" x2="300" y2="238" strokeWidth="1.5" />
            <line x1="295" y1="255" x2="310" y2="258" strokeWidth="1.5" />

            <line x1="220" y1="270" x2="240" y2="270" strokeWidth="3" strokeLinecap="round" />
            <line x1="225" y1="260" x2="235" y2="260" strokeWidth="1.5" />
            <line x1="225" y1="280" x2="235" y2="280" strokeWidth="1.5" />

            <line x1="145" y1="270" x2="165" y2="268" strokeWidth="3" strokeLinecap="round" />
            <line x1="150" y1="260" x2="160" y2="258" strokeWidth="1.5" />

            <line x1="75" y1="245" x2="95" y2="240" strokeWidth="3" strokeLinecap="round" />
            <line x1="75" y1="255" x2="95" y2="250" strokeWidth="1.5" />

            <line x1="45" y1="190" x2="55" y2="200" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Individual vertebrae dots */}
          <g opacity={opacityLow}>
            <circle cx="200" cy="75" r="3" fill={accentGold} />
            <circle cx="260" cy="88" r="3" fill={accentGold} />
            <circle cx="310" cy="130" r="3" fill={accentGold} />
            <circle cx="330" cy="185" r="3" fill={accentGold} />
            <circle cx="310" cy="240" r="3" fill={accentGold} />
            <circle cx="260" cy="280" r="3" fill={accentGold} />
            <circle cx="200" cy="290" r="3" fill={accentGold} />
            <circle cx="140" cy="280" r="3" fill={accentGold} />
            <circle cx="90" cy="240" r="3" fill={accentGold} />
            <circle cx="70" cy="185" r="3" fill={accentGold} />
            <circle cx="90" cy="130" r="3" fill={accentGold} />
            <circle cx="140" cy="88" r="3" fill={accentGold} />
          </g>

          {/* ============ SNAKE HEAD 1 (Biting tail) ============ */}
          <g transform="translate(200, 55)">
            {/* Head glow */}
            <circle cx="0" cy="0" r="40" fill="url(#ouro-head-glow)" />

            {/* Head shape */}
            <path
              d="M-28,-15 
                 C-35,-5 -35,8 -25,15
                 L-5,20
                 C5,22 15,20 25,15
                 C35,8 35,-5 28,-15
                 C22,-25 10,-28 -10,-28
                 C-18,-28 -22,-22 -28,-15Z"
              fill={bodyStroke}
              fillOpacity={opacityHigh}
              stroke={bodyStroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Mouth opening (where it bites its tail) */}
            <path
              d="M-20,12 Q0,22 20,12 L18,18 L10,22 L0,20 L-10,22 L-18,18 Z"
              fill={accentDeep}
              fillOpacity={opacityHigh}
            />

            {/* Fangs */}
            <path d="M-10,12 L-12,22 L-8,14" fill={isDark ? '#e8e6e3' : '#4a3530'} opacity={opacityHigh} />
            <path d="M-4,14 L-5,24 L-2,16" fill={isDark ? '#e8e6e3' : '#4a3530'} opacity={opacityHigh} />
            <path d="M4,14 L5,24 L2,16" fill={isDark ? '#e8e6e3' : '#4a3530'} opacity={opacityHigh} />
            <path d="M10,12 L12,22 L8,14" fill={isDark ? '#e8e6e3' : '#4a3530'} opacity={opacityHigh} />

            {/* Tongue */}
            <path
              d="M-2,20 L-3,28 M0,20 L0,30 L2,28 M2,20 L3,28"
              stroke={bodyStroke}
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              opacity={opacityMid}
            />

            {/* Eyes */}
            <ellipse cx="-12" cy="-5" rx="4" ry="3" fill={isDark ? '#0a0a0f' : '#1c1917'} />
            <ellipse cx="-12" cy="-5" rx="2" ry="1.5" fill={accentGold} />
            <circle cx="-13" cy="-6" r="0.8" fill="white" opacity={opacityHigh} />

            <ellipse cx="12" cy="-5" rx="4" ry="3" fill={isDark ? '#0a0a0f' : '#1c1917'} />
            <ellipse cx="12" cy="-5" rx="2" ry="1.5" fill={accentGold} />
            <circle cx="11" cy="-6" r="0.8" fill="white" opacity={opacityHigh} />

            {/* Scale texture on top of head */}
            <g opacity={opacityLow} stroke={bodyStroke} strokeWidth="0.5" fill="none">
              <path d="M-20,-10 Q-15,-15 -10,-10" />
              <path d="M-10,-12 Q-5,-17 0,-12" />
              <path d="M0,-12 Q5,-17 10,-12" />
              <path d="M10,-12 Q15,-17 20,-10" />
              <path d="M-15,-5 Q-8,-8 0,-5" />
              <path d="M0,-5 Q8,-8 15,-5" />
            </g>

            {/* Tail going INTO the mouth — the part being eaten */}
            <path
              d="M-25,-25 Q-5,-35 15,-30 Q28,-25 22,-10"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="10"
              strokeLinecap="round"
              opacity={opacityMid}
            />
            <path
              d="M-22,-25 Q-5,-32 12,-28 Q22,-24 20,-12"
              fill="none"
              stroke="url(#ouro-scales)"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>

          {/* ============ SNAKE HEAD 2 (Top, looking up) ============ */}
          <g transform="translate(200, 355) rotate(180)">
            {/* Head shape */}
            <path
              d="M-25,-12
                 C-32,-2 -32,10 -22,16
                 L-4,18
                 C4,20 12,18 20,14
                 C30,8 30,-2 22,-12
                 C18,-20 8,-22 -8,-22
                 C-16,-22 -20,-18 -25,-12Z"
              fill={bodyStroke}
              fillOpacity={opacityMid}
              stroke={bodyStroke}
              strokeWidth="1"
              opacity={opacityMid}
            />

            {/* Eyes for second head */}
            <ellipse cx="-10" cy="-4" rx="2.5" ry="1.8" fill={isDark ? '#0a0a0f' : '#1c1917'} opacity={opacityMid} />
            <ellipse cx="-10" cy="-4" rx="1.2" ry="0.9" fill={accentGold} opacity={opacityMid} />
            <ellipse cx="10" cy="-4" rx="2.5" ry="1.8" fill={isDark ? '#0a0a0f' : '#1c1917'} opacity={opacityMid} />
            <ellipse cx="10" cy="-4" rx="1.2" ry="0.9" fill={accentGold} opacity={opacityMid} />

            {/* Mouth */}
            <path d="M-15,10 Q0,16 15,10" stroke={bodyStroke} strokeWidth="1" fill="none" opacity={opacityLow} />
          </g>

          {/* ============ UPPER OPENING: ROOTS/BRANCHES ============ */}
          <g transform="translate(200, 145)" opacity={opacityMid}>
            {/* Central trunk/branch system */}
            <path
              d="M0,50
                 C-2,30 2,20 0,10
                 C-1,0 3,-10 0,-20
                 C-3,-30 2,-40 0,-50"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Branch to left */}
            <path
              d="M0,0
                 C-15,-3 -25,-8 -35,-2
                 C-45,2 -50,8 -58,5"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M-35,-2
                 C-42,-15 -48,-20 -55,-22"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M-45,2
                 C-50,-8 -58,-15 -65,-18"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M-25,-8
                 C-20,-20 -18,-28 -12,-35"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Branch to right */}
            <path
              d="M0,0
                 C15,-3 25,-8 35,-2
                 C45,2 50,8 58,5"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M35,-2
                 C42,-15 48,-20 55,-22"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M45,2
                 C50,-8 58,-15 65,-18"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M25,-8
                 C20,-20 18,-28 12,-35"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Upward secondary branches */}
            <path
              d="M-5,-15
                 C-12,-35 -5,-45 -15,-55"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M5,-15
                 C12,-35 5,-45 15,-55"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Leaf/flower tips */}
            <circle cx="-58" cy="5" r="3" fill={accentGold} opacity={opacityLow} />
            <circle cx="58" cy="5" r="3" fill={accentGold} opacity={opacityLow} />
            <circle cx="-65" cy="-18" r="2.5" fill={accentGold} opacity="0.1" />
            <circle cx="65" cy="-18" r="2.5" fill={accentGold} opacity="0.1" />
            <circle cx="-55" cy="-22" r="2" fill={accentGold} opacity="0.08" />
            <circle cx="55" cy="-22" r="2" fill={accentGold} opacity="0.08" />
            <circle cx="-12" cy="-35" r="2" fill={accentGold} opacity="0.1" />
            <circle cx="12" cy="-35" r="2" fill={accentGold} opacity="0.1" />
            <circle cx="-15" cy="-55" r="2.5" fill={accentGold} opacity="0.08" />
            <circle cx="15" cy="-55" r="2.5" fill={accentGold} opacity="0.08" />

            {/* Root tendrils below — going into the center infinity point */}
            <path d="M-8,45 C-15,60 -5,70 0,80" stroke={bodyStroke} strokeWidth="0.8" fill="none" opacity="0.25" strokeLinecap="round" />
            <path d="M8,45 C15,60 5,70 0,80" stroke={bodyStroke} strokeWidth="0.8" fill="none" opacity="0.25" strokeLinecap="round" />
            <path d="M-5,50 C-18,58 -12,68 -5,78" stroke={bodyStroke} strokeWidth="0.6" fill="none" opacity="0.15" strokeLinecap="round" />
            <path d="M5,50 C18,58 12,68 5,78" stroke={bodyStroke} strokeWidth="0.6" fill="none" opacity="0.15" strokeLinecap="round" />
          </g>

          {/* ============ LOWER OPENING: BONSAI TREE ============ */}
          <g transform="translate(200, 255)" opacity={opacityMid}>
            {/* Pot */}
            <path
              d="M-20,35 L20,35 L18,50 L-18,50 Z"
              fill={bodyStroke}
              fillOpacity={opacityLow}
              stroke={bodyStroke}
              strokeWidth="1"
            />
            <path
              d="M-22,35 L22,35"
              stroke={bodyStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Trunk — thick, curving */}
            <path
              d="M0,35
                 C-2,20 3,12 0,0
                 C-4,-10 4,-18 2,-28
                 C0,-38 -5,-45 -2,-55"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M0,35
                 C-2,20 3,12 0,0
                 C-4,-10 4,-18 2,-28
                 C0,-38 -5,-45 -2,-55"
              fill="none"
              stroke={accentGold}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Branch to left */}
            <path
              d="M-3,-15
                 C-15,-18 -28,-15 -40,-25
                 C-50,-32 -58,-30 -68,-35"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M-40,-25
                 C-45,-40 -35,-45 -45,-55"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M-58,-30
                 C-55,-48 -62,-55 -60,-62"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Branch to right */}
            <path
              d="M3,-15
                 C15,-18 28,-15 40,-25
                 C50,-32 58,-30 68,-35"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M40,-25
                 C45,-40 35,-45 45,-55"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M58,-30
                 C55,-48 62,-55 60,-62"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Upward secondary branch */}
            <path
              d="M0,-30
                 C-8,-50 -3,-65 5,-75"
              fill="none"
              stroke={bodyStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Tree canopy / foliage clusters — circles of different sizes */}
            <g opacity={opacityHigh}>
              {/* Left cluster */}
              <circle cx="-55" cy="-35" r="14" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="-65" cy="-45" r="10" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="-45" cy="-55" r="12" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="-58" cy="-55" r="6" fill={accentGold} fillOpacity={opacityLow} />
              <circle cx="-48" cy="-30" r="7" fill={accentGold} fillOpacity={opacityLow} />
              <circle cx="-65" cy="-25" r="5" fill={accentGold} fillOpacity={opacityLow} />

              {/* Right cluster */}
              <circle cx="55" cy="-35" r="14" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="65" cy="-45" r="10" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="45" cy="-55" r="12" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="58" cy="-55" r="6" fill={accentGold} fillOpacity={opacityLow} />
              <circle cx="48" cy="-30" r="7" fill={accentGold} fillOpacity={opacityLow} />
              <circle cx="65" cy="-25" r="5" fill={accentGold} fillOpacity={opacityLow} />

              {/* Top cluster */}
              <circle cx="0" cy="-72" r="12" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="-12" cy="-80" r="8" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="12" cy="-80" r="8" fill={bodyStroke} fillOpacity={opacityLow} stroke={bodyStroke} strokeWidth="0.8" />
              <circle cx="0" cy="-85" r="5" fill={accentGold} fillOpacity={opacityLow} />
            </g>

            {/* Stylized leaves on branches */}
            <g opacity={opacityMid}>
              <circle cx="-50" cy="-40" r="2" fill={accentGold} />
              <circle cx="-60" cy="-30" r="2" fill={accentGold} />
              <circle cx="-40" cy="-48" r="1.5" fill={accentGold} />
              <circle cx="50" cy="-40" r="2" fill={accentGold} />
              <circle cx="60" cy="-30" r="2" fill={accentGold} />
              <circle cx="40" cy="-48" r="1.5" fill={accentGold} />
              <circle cx="0" cy="-75" r="2" fill={accentGold} />
              <circle cx="-8" cy="-60" r="1.5" fill={accentGold} />
              <circle cx="8" cy="-60" r="1.5" fill={accentGold} />
            </g>

            {/* Small roots sticking out of the pot */}
            <path d="M-8,48 L-12,58" stroke={bodyStroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
            <path d="M-3,48 L-5,60" stroke={bodyStroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
            <path d="M3,48 L5,60" stroke={bodyStroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
            <path d="M8,48 L12,58" stroke={bodyStroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
          </g>

          {/* ============ DECORATIVE ELEMENTS around the circle ============ */}
          {/* Dots around the loop */}
          <g opacity={opacityLow}>
            <circle cx="200" cy="45" r="3" fill={accentGold} />
            <circle cx="140" cy="60" r="2" fill={accentGold} />
            <circle cx="95" cy="95" r="2" fill={accentGold} />
            <circle cx="65" cy="140" r="2" fill={accentGold} />
            <circle cx="55" cy="200" r="3" fill={accentGold} />
            <circle cx="65" cy="260" r="2" fill={accentGold} />
            <circle cx="95" cy="305" r="2" fill={accentGold} />
            <circle cx="140" cy="340" r="2" fill={accentGold} />
            <circle cx="200" cy="355" r="3" fill={accentGold} />
            <circle cx="260" cy="340" r="2" fill={accentGold} />
            <circle cx="305" cy="305" r="2" fill={accentGold} />
            <circle cx="335" cy="260" r="2" fill={accentGold} />
            <circle cx="345" cy="200" r="3" fill={accentGold} />
            <circle cx="335" cy="140" r="2" fill={accentGold} />
            <circle cx="305" cy="95" r="2" fill={accentGold} />
            <circle cx="260" cy="60" r="2" fill={accentGold} />
          </g>

          {/* Mystical symbols at cardinal points */}
          <g opacity={opacityLow}>
            <text x="200" y="190" textAnchor="middle" fontSize="14" fill={accentGold} fontFamily="serif" fontStyle="italic">∞</text>
          </g>
          <g opacity="0.06">
            <text x="75" y="205" textAnchor="middle" fontSize="8" fill={bodyStroke} fontFamily="serif">✦</text>
            <text x="325" y="205" textAnchor="middle" fontSize="8" fill={bodyStroke} fontFamily="serif">✦</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
