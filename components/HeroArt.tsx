// Pure-SVG hero illustration in 3D-render style: trapezoid shopping bag
// with rope handles, extruded perforated coupon tickets with crowns, a
// two-tier podium with neon ring, and light rays. Decorative (aria-hidden).

const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

function Crown({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 20 L4 5 L11 13 L17 0 L23 13 L30 5 L34 20 Z" fill="url(#ha-gold)" />
      <rect x="1" y="20" width="32" height="6" rx="2.5" fill="#d97706" />
      <circle cx="17" cy="9" r="2" fill="#fef3c7" opacity="0.9" />
    </g>
  );
}

function Ticket({
  transform,
  w,
  h,
  grad,
  dark,
  value,
  valueSize,
  maskId,
  crownScale = 1,
}: {
  transform: string;
  w: number;
  h: number;
  grad: string;
  dark: string;
  value: string;
  valueSize: number;
  maskId: string;
  crownScale?: number;
}) {
  const midY = h * 0.62;
  return (
    <g transform={transform} filter="url(#ha-shadow)">
      {/* extruded thickness */}
      <g transform="translate(3 7)">
        <g mask={`url(#${maskId})`}>
          <rect x="0" y="0" width={w} height={h} rx="15" fill={dark} />
        </g>
      </g>
      {/* face */}
      <g mask={`url(#${maskId})`}>
        <rect x="0" y="0" width={w} height={h} rx="15" fill={`url(#${grad})`} />
        {/* top sheen */}
        <rect x="0" y="0" width={w} height={h * 0.42} rx="15" fill="#ffffff" opacity="0.16" />
        {/* dashed divider */}
        <line
          x1={w * 0.12}
          y1={midY + 6}
          x2={w * 0.88}
          y2={midY + 6}
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
        {/* value with 3D offset */}
        <text x={w / 2 + 1.5} y={midY - 8 + 3} textAnchor="middle" fontFamily={FONT} fontSize={valueSize} fontWeight="800" fill="#000" opacity="0.3">
          {value}
        </text>
        <text x={w / 2} y={midY - 8} textAnchor="middle" fontFamily={FONT} fontSize={valueSize} fontWeight="800" fill="#fff">
          {value}
        </text>
        <text
          x={w / 2}
          y={h - 10}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={Math.max(10, h * 0.13)}
          fontWeight="700"
          letterSpacing="3"
          fill="#ffffff"
          fillOpacity="0.9"
        >
          CODE PROMO
        </text>
      </g>
      {/* crown */}
      <Crown x={w / 2 - 17 * crownScale} y={-22 * crownScale} scale={crownScale} />
    </g>
  );
}

export default function HeroArt() {
  return (
    <svg viewBox="0 0 520 490" width="100%" height="100%" aria-hidden role="presentation" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="ha-bag" x1="0" y1="0" x2="0.18" y2="1">
          <stop offset="0%" stopColor="#f2604a" />
          <stop offset="55%" stopColor="#d0402c" />
          <stop offset="100%" stopColor="#96271a" />
        </linearGradient>
        <linearGradient id="ha-t50" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5f47" />
          <stop offset="100%" stopColor="#d0301b" />
        </linearGradient>
        <linearGradient id="ha-t30" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a56bff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="ha-t20" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc63d" />
          <stop offset="100%" stopColor="#e08a06" />
        </linearGradient>
        <linearGradient id="ha-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#e79009" />
        </linearGradient>
        <linearGradient id="ha-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2d1a" stopOpacity="0" />
          <stop offset="30%" stopColor="#ff4a2e" />
          <stop offset="70%" stopColor="#ff4a2e" />
          <stop offset="100%" stopColor="#ff2d1a" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ha-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e2503c" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#c0392b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
        </radialGradient>

        <filter id="ha-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="ha-blur3" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="ha-blur7" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        {/* ticket masks: rounded rect minus perforation bites on short edges */}
        <mask id="ha-tm-l">
          <rect x="0" y="0" width="160" height="94" rx="15" fill="#fff" />
          <circle cx="0" cy="24" r="6" fill="#000" />
          <circle cx="0" cy="47" r="6" fill="#000" />
          <circle cx="0" cy="70" r="6" fill="#000" />
          <circle cx="160" cy="24" r="6" fill="#000" />
          <circle cx="160" cy="47" r="6" fill="#000" />
          <circle cx="160" cy="70" r="6" fill="#000" />
        </mask>
        <mask id="ha-tm-m">
          <rect x="0" y="0" width="132" height="80" rx="14" fill="#fff" />
          <circle cx="0" cy="20" r="5.5" fill="#000" />
          <circle cx="0" cy="40" r="5.5" fill="#000" />
          <circle cx="0" cy="60" r="5.5" fill="#000" />
          <circle cx="132" cy="20" r="5.5" fill="#000" />
          <circle cx="132" cy="40" r="5.5" fill="#000" />
          <circle cx="132" cy="60" r="5.5" fill="#000" />
        </mask>
        <mask id="ha-tm-s">
          <rect x="0" y="0" width="126" height="76" rx="14" fill="#fff" />
          <circle cx="0" cy="19" r="5.5" fill="#000" />
          <circle cx="0" cy="38" r="5.5" fill="#000" />
          <circle cx="0" cy="57" r="5.5" fill="#000" />
          <circle cx="126" cy="19" r="5.5" fill="#000" />
          <circle cx="126" cy="38" r="5.5" fill="#000" />
          <circle cx="126" cy="57" r="5.5" fill="#000" />
        </mask>
      </defs>

      {/* ambient glow */}
      <ellipse cx="260" cy="260" rx="255" ry="215" fill="url(#ha-glow)" />

      {/* light rays */}
      <g filter="url(#ha-blur3)">
        <rect x="60" y="120" width="95" height="5" rx="2.5" fill="#ff7a45" opacity="0.4" transform="rotate(36 60 120)" />
        <rect x="390" y="90" width="110" height="5" rx="2.5" fill="#ff5f3a" opacity="0.45" transform="rotate(-28 390 90)" />
        <rect x="430" y="250" width="80" height="4" rx="2" fill="#ffb03a" opacity="0.4" transform="rotate(18 430 250)" />
        <rect x="30" y="280" width="85" height="4" rx="2" fill="#ff5f3a" opacity="0.35" transform="rotate(-20 30 280)" />
        <rect x="120" y="30" width="70" height="4" rx="2" fill="#ffd23a" opacity="0.3" transform="rotate(24 120 30)" />
        <rect x="330" y="380" width="90" height="4" rx="2" fill="#ff5f3a" opacity="0.3" transform="rotate(-14 330 380)" />
      </g>
      {/* flare dots */}
      <circle cx="410" cy="60" r="3.5" fill="#ffe1d6" opacity="0.8" />
      <circle cx="88" cy="98" r="2.5" fill="#ffb03a" opacity="0.7" />
      <circle cx="472" cy="205" r="2.5" fill="#ff8a6a" opacity="0.7" />
      <circle cx="52" cy="345" r="3" fill="#ff6a4a" opacity="0.6" />
      <circle cx="452" cy="352" r="2" fill="#ffd23a" opacity="0.7" />

      {/* ── two-tier podium ───────────────────────────── */}
      {/* lower disc */}
      <path d="M 75 420 L 75 442 A 185 32 0 0 0 445 442 L 445 420" fill="#0c0506" />
      <ellipse cx="260" cy="420" rx="185" ry="32" fill="#160a0b" />
      <ellipse cx="260" cy="442" rx="185" ry="32" fill="none" stroke="url(#ha-ring)" strokeWidth="3" opacity="0.8" filter="url(#ha-blur3)" />
      <ellipse cx="260" cy="442" rx="185" ry="32" fill="none" stroke="#ff4a2e" strokeWidth="1.2" opacity="0.6" />
      {/* upper disc */}
      <path d="M 125 396 L 125 416 A 135 24 0 0 0 395 416 L 395 396" fill="#0e0607" />
      <ellipse cx="260" cy="396" rx="135" ry="24" fill="#1d0e0f" />
      <ellipse cx="260" cy="396" rx="135" ry="24" fill="none" stroke="url(#ha-ring)" strokeWidth="5" opacity="1" filter="url(#ha-blur3)" />
      <ellipse cx="260" cy="396" rx="135" ry="24" fill="none" stroke="#ff5b40" strokeWidth="1.6" opacity="0.95" />
      <ellipse cx="260" cy="416" rx="150" ry="26" fill="#ff3a1e" opacity="0.12" filter="url(#ha-blur7)" />
      {/* reflection under bag */}
      <ellipse cx="260" cy="396" rx="86" ry="14" fill="#7e1f14" opacity="0.5" filter="url(#ha-blur7)" />

      {/* ── shopping bag ─────────────────────────────── */}
      {/* handles */}
      <path d="M 224 220 C 220 158 268 158 264 220" fill="none" stroke="#241110" strokeWidth="10" strokeLinecap="round" />
      <path d="M 256 220 C 252 158 300 158 296 220" fill="none" stroke="#2e1614" strokeWidth="10" strokeLinecap="round" />
      <path d="M 226 214 C 224 166 264 166 262 214" fill="none" stroke="#4a2620" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

      {/* body (trapezoid, 3D facets) */}
      <g filter="url(#ha-shadow)">
        <path
          d="M 208 212
             Q 208 204 216 204
             L 304 204
             Q 312 204 312 212
             L 336 380
             Q 338 398 320 398
             L 200 398
             Q 182 398 184 380
             Z"
          fill="url(#ha-bag)"
        />
      </g>
      {/* left facet shading */}
      <path d="M 208 212 Q 208 204 216 204 L 232 204 L 214 398 L 200 398 Q 182 398 184 380 Z" fill="#6d1a10" opacity="0.35" />
      {/* right edge highlight */}
      <path d="M 296 204 L 304 204 Q 312 204 312 212 L 336 380 Q 338 398 320 398 L 312 398 Z" fill="#ff8b6f" opacity="0.28" filter="url(#ha-blur3)" />
      {/* top rim */}
      <path d="M 208 212 Q 208 204 216 204 L 304 204 Q 312 204 312 212 L 313 222 L 207 222 Z" fill="#7a1d12" opacity="0.85" />
      {/* glossy sweep */}
      <path d="M 238 204 L 274 204 Q 250 300 226 390 L 208 390 Q 224 296 238 204 Z" fill="#ffffff" opacity="0.14" filter="url(#ha-blur7)" />

      {/* grommets */}
      <circle cx="225" cy="222" r="6" fill="#3a1c14" stroke="#f5d9c8" strokeWidth="2.5" />
      <circle cx="263" cy="222" r="6" fill="#3a1c14" stroke="#f5d9c8" strokeWidth="2.5" />
      <circle cx="295" cy="222" r="6" fill="#3a1c14" stroke="#e8bfae" strokeWidth="2.5" />

      {/* % symbol with 3D extrude */}
      <text x="262" y="342" textAnchor="middle" fontFamily={FONT} fontSize="104" fontWeight="800" fill="#7e1f14">%</text>
      <text x="260" y="336" textAnchor="middle" fontFamily={FONT} fontSize="104" fontWeight="800" fill="#ffffff">%</text>

      {/* ── tickets ──────────────────────────────────── */}
      <Ticket transform="translate(310 40) rotate(12)" w={160} h={94} grad="ha-t50" dark="#8e1508" value="-50%" valueSize={42} maskId="ha-tm-l" crownScale={1} />
      <Ticket transform="translate(22 190) rotate(-14)" w={132} h={80} grad="ha-t30" dark="#4c1a99" value="-30%" valueSize={34} maskId="ha-tm-m" crownScale={0.8} />
      <Ticket transform="translate(374 252) rotate(9)" w={126} h={76} grad="ha-t20" dark="#9c5f04" value="-20%" valueSize={32} maskId="ha-tm-s" crownScale={0.75} />

      {/* confetti */}
      <rect x="150" y="86" width="10" height="10" rx="2" fill="#fbbf24" transform="rotate(45 155 91)" opacity="0.9" />
      <rect x="96" y="330" width="8" height="8" rx="2" fill="#e2503c" transform="rotate(20 100 334)" opacity="0.85" />
      <path d="M 476 148 l 4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4 Z" fill="#fcd34d" opacity="0.85" />
      <path d="M 116 28 l 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="#f4f4f5" opacity="0.5" />
    </svg>
  );
}
