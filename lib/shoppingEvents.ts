// ─────────────────────────────────────────────────────────────────────────────
// lib/shoppingEvents.ts — French shopping-event calendar (2026-08-11)
//
// Feeds /api/cron/events: for every major FR retail moment (Black Friday,
// AliExpress 11.11, soldes, Prime Day, French Days, rentrée, Noël…) we know
// WHEN it happens (computed per year — movable feasts included) and WHICH
// stores participate, so the cron can publish SEO articles weeks ahead and
// rotate event-specific codes when the date approaches.
//
// `approximate: true` = dates announced yearly by retailers (French Days,
// Prime Day…); article prompts must web_search-verify before stating dates.
// ─────────────────────────────────────────────────────────────────────────────

export interface ShoppingEventDef {
  slug: string;            // stable id, used in blog slugs → NEVER change
  name: string;            // display name used in titles ("Black Friday")
  emoji: string;
  approximate?: boolean;   // exact dates announced yearly → verify via search
  /** Participating store slugs, priority order (must exist in `stores`). */
  stores: string[];
  /** Extra FR search keywords for code hunting + SEO. */
  keywords: string[];
  /** Compute the event window for a given year. */
  compute: (year: number) => { start: Date; end: Date };
}

export interface ShoppingEventInstance {
  def: ShoppingEventDef;
  year: number;
  start: Date;
  end: Date;
  /** Whole days until start (negative = already started). */
  daysUntilStart: number;
  /** Whole days until end (negative = over). */
  daysUntilEnd: number;
  active: boolean;
}

// ─── date helpers (all UTC-midnight to keep day math stable) ────────────────

const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m, day));

/** nth <weekday> (0=Sun…6=Sat) of month m (0-based) in year y. n is 1-based. */
function nthWeekday(y: number, m: number, weekday: number, n: number): Date {
  const first = d(y, m, 1);
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return d(y, m, 1 + offset + (n - 1) * 7);
}

/** last <weekday> of month m in year y. */
function lastWeekday(y: number, m: number, weekday: number): Date {
  const last = d(y, m + 1, 0);
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return d(y, m, last.getUTCDate() - offset);
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86400000);
}

// ─── store pools ────────────────────────────────────────────────────────────

const GENERALISTES = ['amazon', 'cdiscount', 'temu', 'aliexpress', 'rakuten', 'ebay', 'auchan', 'carrefour'];
const TECH = ['fnac', 'darty', 'boulanger', 'samsung', 'apple', 'xiaomi', 'back-market', 'ldlc'];
const MODE = ['shein', 'zalando', 'asos', 'hm', 'zara', 'la-redoute', 'kiabi', 'nike', 'adidas', 'sarenza'];
const BEAUTE = ['sephora', 'nocibe-fr', 'marionnaud', 'yves-rocher', 'aroma-zone'];
const MAISON = ['ikea', 'leroy-merlin', 'conforama', 'but', 'maisons-du-monde'];

// ─── the calendar ───────────────────────────────────────────────────────────

export const SHOPPING_EVENTS: ShoppingEventDef[] = [
  {
    slug: 'soldes-hiver',
    name: 'Soldes d\u2019hiver',
    emoji: '❄️',
    stores: [...MODE, ...GENERALISTES.slice(0, 4), ...TECH.slice(0, 3), ...MAISON.slice(0, 3)],
    keywords: ['soldes hiver', 'démarque', 'soldes janvier'],
    // Legal FR start: 2nd Wednesday of January, 4 weeks.
    compute: (y) => { const s = nthWeekday(y, 0, 3, 2); return { start: s, end: addDays(s, 28) }; },
  },
  {
    slug: 'saint-valentin',
    name: 'Saint-Valentin',
    emoji: '💝',
    stores: [...BEAUTE, 'etam', 'amazon', 'temu', 'fnac'],
    keywords: ['saint valentin', 'cadeau saint-valentin', 'idée cadeau couple'],
    compute: (y) => ({ start: d(y, 1, 1), end: d(y, 1, 14) }),
  },
  {
    slug: 'anniversaire-aliexpress',
    name: 'Anniversaire AliExpress',
    emoji: '🎂',
    approximate: true,
    stores: ['aliexpress'],
    keywords: ['anniversaire aliexpress', 'aliexpress anniversary sale'],
    compute: (y) => ({ start: d(y, 2, 23), end: d(y, 2, 31) }),
  },
  {
    slug: 'french-days-printemps',
    name: 'French Days de printemps',
    emoji: '🇫🇷',
    approximate: true,
    stores: ['fnac', 'darty', 'boulanger', 'cdiscount', 'la-redoute', 'back-market', 'rakuten', 'auchan', 'showroomprive'],
    keywords: ['french days', 'french days printemps'],
    compute: (y) => ({ start: d(y, 3, 29), end: d(y, 4, 6) }),
  },
  {
    slug: 'fete-des-meres',
    name: 'Fête des Mères',
    emoji: '💐',
    stores: [...BEAUTE, 'amazon', 'fnac', 'etam', 'galeries-lafayette'],
    keywords: ['fête des mères', 'cadeau maman'],
    // FR: last Sunday of May (Pentecost shifts handled by approximate copy).
    compute: (y) => { const e = lastWeekday(y, 4, 0); return { start: addDays(e, -13), end: e }; },
  },
  {
    slug: 'fete-des-peres',
    name: 'Fête des Pères',
    emoji: '👔',
    stores: ['amazon', 'fnac', 'darty', 'boulanger', 'celio', 'jules', 'timberland', 'ldlc'],
    keywords: ['fête des pères', 'cadeau papa'],
    // FR: 3rd Sunday of June.
    compute: (y) => { const e = nthWeekday(y, 5, 0, 3); return { start: addDays(e, -13), end: e }; },
  },
  {
    slug: 'soldes-ete',
    name: 'Soldes d\u2019été',
    emoji: '☀️',
    stores: [...MODE, ...GENERALISTES.slice(0, 4), ...TECH.slice(0, 3), ...MAISON.slice(0, 3)],
    keywords: ['soldes été', 'démarque', 'soldes juin juillet'],
    // Legal FR start: last Wednesday of June, 4 weeks.
    compute: (y) => { const s = lastWeekday(y, 5, 3); return { start: s, end: addDays(s, 28) }; },
  },
  {
    slug: 'prime-day',
    name: 'Prime Day',
    emoji: '📦',
    approximate: true,
    // Amazon + the FR retailers running counter-offers the same week.
    stores: ['amazon', 'cdiscount', 'fnac', 'darty', 'boulanger'],
    keywords: ['prime day', 'amazon prime day', 'anti prime day'],
    compute: (y) => { const s = nthWeekday(y, 6, 2, 2); return { start: s, end: addDays(s, 3) }; },
  },
  {
    slug: 'rentree-scolaire',
    name: 'Rentrée scolaire',
    emoji: '🎒',
    stores: ['cdiscount', 'amazon', 'fnac', 'boulanger', 'kiabi', 'la-redoute', 'decathlon', 'temu', 'auchan', 'carrefour'],
    keywords: ['rentrée scolaire', 'fournitures scolaires', 'rentrée pas chère'],
    compute: (y) => ({ start: d(y, 7, 20), end: d(y, 8, 5) }),
  },
  {
    slug: 'french-days-automne',
    name: 'French Days d\u2019automne',
    emoji: '🇫🇷',
    approximate: true,
    stores: ['fnac', 'darty', 'boulanger', 'cdiscount', 'la-redoute', 'back-market', 'rakuten', 'auchan', 'showroomprive'],
    keywords: ['french days', 'french days automne', 'french days septembre'],
    compute: (y) => ({ start: d(y, 8, 23), end: d(y, 8, 30) }),
  },
  {
    slug: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    stores: ['temu', 'amazon', 'shein', 'aliexpress', 'cdiscount'],
    keywords: ['halloween', 'déguisement halloween', 'décoration halloween'],
    compute: (y) => ({ start: d(y, 9, 24), end: d(y, 9, 31) }),
  },
  {
    slug: 'singles-day',
    name: '11.11 (Singles\u2019 Day)',
    emoji: '🛍️',
    stores: ['aliexpress', 'temu', 'shein', 'samsung', 'xiaomi'],
    keywords: ['11.11', 'singles day', 'aliexpress 11 novembre', 'double 11'],
    compute: (y) => ({ start: d(y, 10, 4), end: d(y, 10, 12) }),
  },
  {
    slug: 'black-friday',
    name: 'Black Friday',
    emoji: '🖤',
    stores: [
      'amazon', 'cdiscount', 'fnac', 'darty', 'boulanger', 'aliexpress', 'temu', 'shein',
      'zalando', 'nike', 'adidas', 'sephora', 'samsung', 'apple', 'back-market', 'ldlc',
      'asos', 'hm', 'decathlon', 'ikea',
    ],
    keywords: ['black friday', 'black week', 'cyber monday', 'pré black friday'],
    // BF = Friday after the 4th Thursday of November. Window: Black Week → Cyber Monday.
    compute: (y) => { const bf = addDays(nthWeekday(y, 10, 4, 4), 1); return { start: addDays(bf, -7), end: addDays(bf, 3) }; },
  },
  {
    slug: 'noel',
    name: 'Noël',
    emoji: '🎄',
    stores: ['amazon', 'fnac', 'cdiscount', 'temu', 'aliexpress', 'sephora', 'ikea', 'darty', 'boulanger', 'la-redoute'],
    keywords: ['noël', 'cadeaux de noël', 'idées cadeaux'],
    compute: (y) => ({ start: d(y, 11, 1), end: d(y, 11, 24) }),
  },
];

// ─── queries ────────────────────────────────────────────────────────────────

const DAY = 86400000;

/**
 * All event instances that are active now or start within `horizonDays`.
 * Checks current AND next year so December lookups see January soldes.
 */
export function getUpcomingEvents(now: Date, horizonDays = 40): ShoppingEventInstance[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: ShoppingEventInstance[] = [];
  for (const def of SHOPPING_EVENTS) {
    for (const year of [now.getUTCFullYear(), now.getUTCFullYear() + 1]) {
      const { start, end } = def.compute(year);
      const daysUntilStart = Math.round((start.getTime() - today) / DAY);
      const daysUntilEnd = Math.round((end.getTime() - today) / DAY);
      if (daysUntilEnd < 0 || daysUntilStart > horizonDays) continue;
      out.push({ def, year, start, end, daysUntilStart, daysUntilEnd, active: daysUntilStart <= 0 && daysUntilEnd >= 0 });
    }
  }
  return out.sort((a, b) => a.daysUntilStart - b.daysUntilStart);
}

export function formatDateFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
