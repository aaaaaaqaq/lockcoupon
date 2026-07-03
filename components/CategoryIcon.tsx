// Custom SVG category icons — white line-art on vivid gradient orbs.
// Replaces emojis for a premium, consistent look across platforms.

interface Theme {
  from: string;
  to: string;
}

export const CATEGORY_THEMES: Record<string, Theme> = {
  mode: { from: '#f472b6', to: '#db2777' },
  'high-tech': { from: '#38bdf8', to: '#2563eb' },
  maison: { from: '#fbbf24', to: '#ea580c' },
  beaute: { from: '#e879f9', to: '#a21caf' },
  voyage: { from: '#22d3ee', to: '#0284c7' },
  sport: { from: '#34d399', to: '#059669' },
  alimentation: { from: '#fb923c', to: '#dc2626' },
  marketplace: { from: '#a78bfa', to: '#7c3aed' },
};

const PATHS: Record<string, React.ReactNode> = {
  // T-shirt
  mode: (
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  ),
  // Monitor
  'high-tech': (
    <>
      <rect x="3" y="3" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 16v5" />
    </>
  ),
  // House
  maison: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M10 21v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6" />
    </>
  ),
  // Sparkle
  beaute: (
    <>
      <path d="M12 3l1.9 5.6a2 2 0 0 0 1.3 1.3L20.8 12l-5.6 1.9a2 2 0 0 0-1.3 1.3L12 20.8l-1.9-5.6a2 2 0 0 0-1.3-1.3L3.2 12l5.6-1.9a2 2 0 0 0 1.3-1.3z" />
      <path d="M19 3v2" />
      <path d="M20 4h-2" />
    </>
  ),
  // Plane
  voyage: (
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  ),
  // Trophy
  sport: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  // Basket
  alimentation: (
    <>
      <path d="m15 11-1 9" />
      <path d="m19 11-4-7" />
      <path d="M2 11h20" />
      <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
      <path d="m5 11 4-7" />
      <path d="m9 11 1 9" />
    </>
  ),
  // Shopping bag
  marketplace: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
};

export default function CategoryIcon({ slug }: { slug: string }) {
  const theme = CATEGORY_THEMES[slug] || { from: '#C0392B', to: '#96281B' };
  const icon = PATHS[slug] || PATHS.marketplace;

  return (
    <span
      className="relative flex items-center justify-center w-14 h-14 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
      style={{
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
        boxShadow: `0 8px 20px -6px ${theme.to}99, inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.15)`,
      }}
    >
      {/* top glass reflection */}
      <span
        aria-hidden
        className="absolute inset-x-1.5 top-1 h-[45%] rounded-t-xl"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }}
      />
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      >
        {icon}
      </svg>
    </span>
  );
}
