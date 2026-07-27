/**
 * lib/couponSimilarity.ts — duplicate-offer detection, shared by:
 *   • the offer-import cron (app/api/cron/update-coupons) as an insert guard
 *   • scripts/dedupe-coupons.ts (one-shot table cleanup)
 *
 * Duplicate definition (2026-07-27 dedupe):
 *   same store + same discount (type+value) + title similarity ≥ 0.85
 *   — OR — same store + identical non-null code.
 *
 * Title similarity = Sørensen–Dice coefficient on character bigrams of the
 * accent-stripped, punctuation-stripped, lowercased title. Catches the
 * live Shein cases: "Livraison gratuite dès 39€" ×2, near-identical
 * "30% premier achat dès 29€" variants, "20% dès 69€" variants.
 *
 * Pure TypeScript, zero deps — importable from Next routes AND node scripts.
 */

export interface OfferLike {
  title: string;
  code?: string | null;
  discount_value?: string | null;
  discount_type?: string | null;
}

/** Lowercase, strip accents/punctuation, collapse whitespace. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9€%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Sørensen–Dice coefficient on character bigrams (0..1). */
export function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return na === nb ? 1 : 0;

  const bigrams = (s: string): Map<string, number> => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      m.set(bg, (m.get(bg) || 0) + 1);
    }
    return m;
  };

  const ma = bigrams(na);
  const mb = bigrams(nb);
  let overlap = 0;
  ma.forEach((countA, bg) => {
    const countB = mb.get(bg) || 0;
    overlap += Math.min(countA, countB);
  });
  return (2 * overlap) / (na.length - 1 + nb.length - 1);
}

/** Same discount: normalized type + numeric value. Missing values compare
 *  loosely (null == null) so "untyped" scraper rows still dedupe. */
export function sameDiscount(a: OfferLike, b: OfferLike): boolean {
  const val = (o: OfferLike) => {
    const n = o.discount_value ? parseInt(String(o.discount_value), 10) : 0;
    return Number.isFinite(n) ? n : 0;
  };
  const type = (o: OfferLike) => o.discount_type || '';
  return val(a) === val(b) && type(a) === type(b);
}

export const DUPLICATE_SIMILARITY_THRESHOLD = 0.85;

/** Audience/segment tokens: two otherwise-similar titles targeting different
 *  segments ("-50% sélection femme" vs "-50% sélection homme") are DISTINCT
 *  offers even at ≥0.85 similarity — a one-word diff in a long title scores
 *  ~0.93 on bigram Dice. */
const SEGMENT_TOKENS = ['femme', 'homme', 'enfant', 'fille', 'garcon', 'bebe', 'junior'];

function segmentsOf(title: string): Set<string> {
  const words = new Set(normalizeTitle(title).split(' '));
  return new Set(SEGMENT_TOKENS.filter((t) => words.has(t) || words.has(`${t}s`)));
}

function conflictingSegments(a: string, b: string): boolean {
  const sa = segmentsOf(a);
  const sb = segmentsOf(b);
  if (sa.size === 0 && sb.size === 0) return false;
  if (sa.size !== sb.size) return true;
  return Array.from(sa).some((t) => !sb.has(t));
}

/** Boilerplate coupon vocabulary — words that never distinguish two offers.
 *  (Normalized form: lowercase, accents stripped.) */
const GENERIC_WORDS = new Set([
  'achat', 'achats', 'commande', 'commandes', 'offre', 'offres', 'code', 'codes',
  'promo', 'promos', 'reduction', 'reductions', 'remise', 'remises', 'cashback',
  'livraison', 'gratuite', 'gratuit', 'offert', 'offerts', 'offerte', 'offertes',
  'site', 'boutique', 'officielle', 'officiel', 'exclusif', 'exclusive',
  'verifie', 'verifiee', 'supplementaire', 'permanent', 'permanente', 'minimum',
  'votre', 'notre', 'premiere', 'premier', 'prochaine', 'prochain',
  'nouveaux', 'nouveau', 'nouvelle', 'clients', 'client', 'membres', 'membre',
  'inscription', 'newsletter', 'selection', 'articles', 'article', 'produits', 'produit',
  'prix', 'normal', 'france', 'uniquement', 'seulement', 'partir',
  'lorsque', 'utilisez', 'cette', 'jusqu', 'expire', 'envoye', 'email', 'mois',
  'anniversaire', 'application', 'mobile', 'toute', 'tout', 'sans', 'avec', 'pour', 'des', 'les', 'vous',
]);

/** Words that meaningfully identify WHAT the offer is about: alphabetic,
 *  ≥4 chars, not boilerplate, not the store's own name. */
function distinctiveWords(title: string, storeName?: string): Set<string> {
  const storeWords = new Set(storeName ? normalizeTitle(storeName).split(' ') : []);
  return new Set(
    normalizeTitle(title)
      .split(' ')
      .filter((w) => /^[a-z]{4,}$/.test(w) && !GENERIC_WORDS.has(w) && !storeWords.has(w))
  );
}

/** Veto: when EACH title contains a distinctive word the other lacks
 *  ("Jeans" vs "Tops et bodies"), the offers target different products —
 *  not duplicates even at ≥0.85 bigram similarity. */
function conflictingProducts(a: string, b: string, storeName?: string): boolean {
  const wa = distinctiveWords(a, storeName);
  const wb = distinctiveWords(b, storeName);
  const onlyA = Array.from(wa).some((w) => !wb.has(w));
  const onlyB = Array.from(wb).some((w) => !wa.has(w));
  return onlyA && onlyB;
}

/** True when `candidate` duplicates `existing` (same-store context assumed). */
export function isDuplicateOffer(candidate: OfferLike, existing: OfferLike, storeName?: string): boolean {
  // Identical non-null code = same offer, whatever the wording.
  if (candidate.code && existing.code && candidate.code.trim().toUpperCase() === existing.code.trim().toUpperCase()) {
    return true;
  }
  if (conflictingSegments(candidate.title, existing.title)) return false;
  if (conflictingProducts(candidate.title, existing.title, storeName)) return false;
  return (
    sameDiscount(candidate, existing) &&
    titleSimilarity(candidate.title, existing.title) >= DUPLICATE_SIMILARITY_THRESHOLD
  );
}
