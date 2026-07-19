// Pure-SVG hero illustration — glossy shopping bag + perforated coupon
// tickets on a glowing podium. Decorative only (aria-hidden), zero image
// weight, matches the brand mockup.

export default function HeroArt() {
  return (
    <svg
      viewBox="0 0 520 470"
      width="100%"
      height="100%"
      aria-hidden
      role="presentation"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="ha-bag" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#f4705a" />
          <stop offset="45%" stopColor="#cf4633" />
          <stop offset="100%" stopColor="#8e2418" />
        </linearGradient>
        <linearGradient id="ha-t50" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6a52" />
          <stop offset="100%" stopColor="#c22412" />
        </linearGradient>
        <linearGradient id="ha-t30" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b06ef7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="ha-t20" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcc33c" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="ha-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="ha-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c0392b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
        </radialGradient>

        <filter id="ha-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id="ha-blur6" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        {/* Ticket masks — rounded rect minus side perforation notches */}
        <mask id="ha-notch-l">
          <rect x="0" y="0" width="150" height="86" rx="16" fill="#fff" />
          <circle cx="0" cy="57" r="7.5" fill="#000" />
          <circle cx="150" cy="57" r="7.5" fill="#000" />
        </mask>
        <mask id="ha-notch-m">
          <rect x="0" y="0" width="130" height="78" rx="15" fill="#fff" />
          <circle cx="0" cy="52" r="7" fill="#000" />
          <circle cx="130" cy="52" r="7" fill="#000" />
        </mask>
        <mask id="ha-notch-s">
          <rect x="0" y="0" width="126" height="76" rx="15" fill="#fff" />
          <circle cx="0" cy="50" r="7" fill="#000" />
          <circle cx="126" cy="50" r="7" fill="#000" />
        </mask>
      </defs>

      {/* ambient glow */}
      <ellipse cx="260" cy="250" rx="250" ry="200" fill="url(#ha-glow)" opacity="0.6" />

      {/* podium */}
      <ellipse cx="260" cy="420" rx="165" ry="30" fill="#0c0607" />
      <ellipse cx="260" cy="418" rx="150" ry="25" fill="none" stroke="#e2503c" strokeWidth="3" opacity="0.45" filter="url(#ha-blur6)" />
      <ellipse cx="260" cy="424" rx="120" ry="18" fill="#c0392b" opacity="0.12" filter="url(#ha-blur6)" />

      {/* bag handle */}
      <path d="M 208 180 A 55 55 0 0 1 312 180" fill="none" stroke="#7e1f14" strokeWidth="18" strokeLinecap="round" />
      <path d="M 214 176 A 48 48 0 0 1 306 176" fill="none" stroke="#b5321f" strokeWidth="6" strokeLinecap="round" opacity="0.7" />

      {/* bag body */}
      <g filter="url(#ha-shadow)">
        <rect x="172" y="158" width="176" height="240" rx="26" fill="url(#ha-bag)" />
      </g>
      {/* glossy highlight */}
      <path d="M 186 200 Q 186 172 214 172 L 262 172 Q 240 240 200 300 Q 186 260 186 200 Z" fill="#ffffff" opacity="0.16" filter="url(#ha-blur6)" />
      <rect x="176" y="162" width="168" height="46" rx="22" fill="#ffffff" opacity="0.12" />
      {/* gold clasp */}
      <rect x="246" y="150" width="28" height="15" rx="4" fill="url(#ha-gold)" />

      {/* % symbol */}
      <text
        x="260"
        y="322"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        fontSize="118"
        fontWeight="800"
        fill="#ffffff"
        style={{ paintOrder: 'stroke' }}
      >
        %
      </text>

      {/* ticket -50% (top right) */}
      <g transform="translate(330 42) rotate(14)" filter="url(#ha-shadow)">
        <g mask="url(#ha-notch-l)">
          <rect x="0" y="0" width="150" height="86" rx="16" fill="url(#ha-t50)" />
          <rect x="0" y="0" width="150" height="30" rx="16" fill="#ffffff" opacity="0.14" />
          <line x1="14" y1="57" x2="136" y2="57" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
          <text x="75" y="44" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="38" fontWeight="800" fill="#fff">-50%</text>
          <text x="75" y="76" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12" fontWeight="700" letterSpacing="3.5" fill="#ffffff" fillOpacity="0.85">CODE PROMO</text>
        </g>
      </g>

      {/* ticket -30% (left) */}
      <g transform="translate(18 178) rotate(-14)" filter="url(#ha-shadow)">
        <g mask="url(#ha-notch-m)">
          <rect x="0" y="0" width="130" height="78" rx="15" fill="url(#ha-t30)" />
          <rect x="0" y="0" width="130" height="27" rx="15" fill="#ffffff" opacity="0.14" />
          <line x1="12" y1="52" x2="118" y2="52" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
          <text x="65" y="40" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="32" fontWeight="800" fill="#fff">-30%</text>
          <text x="65" y="69" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="3" fill="#ffffff" fillOpacity="0.85">CODE PROMO</text>
        </g>
      </g>

      {/* ticket -20% (right) */}
      <g transform="translate(372 250) rotate(9)" filter="url(#ha-shadow)">
        <g mask="url(#ha-notch-s)">
          <rect x="0" y="0" width="126" height="76" rx="15" fill="url(#ha-t20)" />
          <rect x="0" y="0" width="126" height="26" rx="15" fill="#ffffff" opacity="0.16" />
          <line x1="12" y1="50" x2="114" y2="50" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
          <text x="63" y="39" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="30" fontWeight="800" fill="#fff">-20%</text>
          <text x="63" y="67" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="3" fill="#ffffff" fillOpacity="0.9">CODE PROMO</text>
        </g>
      </g>

      {/* sparkles & confetti */}
      <rect x="146" y="84" width="10" height="10" rx="2" fill="#fbbf24" transform="rotate(45 151 89)" opacity="0.9" />
      <circle cx="396" cy="34" r="4" fill="#e5e7eb" opacity="0.75" />
      <rect x="96" y="330" width="8" height="8" rx="2" fill="#e2503c" transform="rotate(20 100 334)" opacity="0.85" />
      <circle cx="452" cy="330" r="4.5" fill="#fbbf24" opacity="0.8" />
      <circle cx="60" cy="120" r="3" fill="#e2503c" opacity="0.6" />
      <path d="M 470 150 l 4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4 Z" fill="#fcd34d" opacity="0.85" />
      <path d="M 118 30 l 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="#f4f4f5" opacity="0.5" />
    </svg>
  );
}
