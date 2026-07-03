// Category icons — gradient outline style (colored line-art, no background tile).

interface Theme {
  from: string;
  to: string;
}

export const CATEGORY_THEMES: Record<string, Theme> = {
  mode: { from: '#f43f5e', to: '#d61f69' },
  'high-tech': { from: '#3b82f6', to: '#1d4ed8' },
  maison: { from: '#fb923c', to: '#ea580c' },
  beaute: { from: '#c084fc', to: '#9333ea' },
  voyage: { from: '#22d3ee', to: '#0891b2' },
  sport: { from: '#4ade80', to: '#16a34a' },
  alimentation: { from: '#fb7185', to: '#ea580c' },
  marketplace: { from: '#a78bfa', to: '#7c3aed' },
};

const PATHS: Record<string, React.ReactNode> = {
  // Price tag
  mode: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
    </>
  ),
  // Monitor
  'high-tech': (
    <>
      <rect x="3" y="3.5" width="18" height="13" rx="2.5" />
      <path d="M12 16.5v3" />
      <path d="M8 20.5h8" />
    </>
  ),
  // Armchair + floor lamp
  maison: (
    <>
      <path d="M17 10V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 14a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1h8v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M5.5 19v1.5" />
      <path d="M16.5 19v1.5" />
    </>
  ),
  // Lotus + plus
  beaute: (
    <>
      <path d="M12 19c-2.3-1.4-3.7-3.8-3.7-6.2C8.3 10.4 9.7 8.1 12 6c2.3 2.1 3.7 4.4 3.7 6.8 0 2.4-1.4 4.8-3.7 6.2z" />
      <path d="M12 19c-3 .8-5.8-.1-7.7-2.2 1.5-1.2 3.3-1.7 5-1.4" />
      <path d="M12 19c3 .8 5.8-.1 7.7-2.2-1.5-1.2-3.3-1.7-5-1.4" />
      <path d="M19.5 4v3" />
      <path d="M21 5.5h-3" />
    </>
  ),
  // Plane + dotted trail
  voyage: (
    <>
      <path d="M18.8 18.2 17 11l3.2-3.2C21.5 6.5 22 4.8 21.6 4c-.8-.4-2.5.1-3.8 1.4L14.6 8.6 7.4 7c-.4-.1-.8.1-1 .4l-.2.4c-.2.4-.1.9.3 1.2L10.6 12l-1.8 2.6H6.2l-.9.9 2.6 1.7 1.7 2.6.9-.9v-2.6l2.6-1.8 3.1 4.6c.3.4.7.5 1.1.3l.4-.2c.4-.2.5-.6.4-1z" />
      <path d="M4.5 17.5c-1 .8-1.6 1.7-1.9 2.7" strokeDasharray="1.5 2.5" />
    </>
  ),
  // Dumbbell (horizontal)
  sport: (
    <>
      <path d="M9 12h6" />
      <rect x="5" y="7.5" width="2.6" height="9" rx="1.3" />
      <rect x="16.4" y="7.5" width="2.6" height="9" rx="1.3" />
      <path d="M2.5 10v4" />
      <path d="M21.5 10v4" />
    </>
  ),
  // Shopping cart
  alimentation: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3.5h2l2.5 11.6a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6l1.6-7.1H5.6" />
      <path d="M9.5 7.5h7" />
      <path d="M10 11h6" />
    </>
  ),
  // Shopping bag
  marketplace: (
    <>
      <path d="M6.5 8.5h11l-.9 11a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z" />
      <path d="M9 10.5v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
};

export default function CategoryIcon({ slug }: { slug: string }) {
  const theme = CATEGORY_THEMES[slug] || { from: '#C0392B', to: '#96281B' };
  const icon = PATHS[slug] || PATHS.marketplace;
  const gradId = `catg-${slug}`;

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradId})`}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ color: theme.to }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
      </defs>
      {icon}
    </svg>
  );
}
