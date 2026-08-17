/**
 * lib/intentContent.ts — programmatic intent-page generator.
 *
 * Strategy (Bing/AI-search fast-ranking play): Bing Webmaster query data shows
 * LockCoupon already ranks top-10 for long-tail INTENT queries ("massimo dutti
 * première commande", "temu soldes 2026", "code réduction temu valide") days
 * after indexing. This module powers /codes-promo/[store]/[intent] pages that
 * own those micro-queries: one unique, dated, answer-first page per
 * store × intent, generated from live coupon data + deterministic phrasing
 * variants (same anti-thin-content approach as lib/storeContent.ts).
 *
 * Pure TypeScript — safe to import from server components AND the sitemap.
 */

import { hashSlug, pick, storeFlavor, storeStats, type FaqItem, type StoreStats } from './storeContent';
import { getEditorial } from './storeEditorial';
import { bestDiscountLabel } from './discount';
import type { Store, Coupon } from './supabase';

/* ── intent registry ───────────────────────────────────────────── */

export interface IntentDef {
  slug: string;
  /** Human label, capitalized: "Première commande" */
  label: string;
  /** Keyword form used in <title>: "Première Commande" */
  titleKeyword: string;
  icon: string;
  /** Coupons matching this regex are surfaced first on the intent page */
  matcher: RegExp;
  /** Short hub-card description */
  cardDesc: (storeName: string) => string;
}

export const INTENTS: Record<string, IntentDef> = {
  'premiere-commande': {
    slug: 'premiere-commande',
    label: 'Première commande',
    titleKeyword: 'Première Commande',
    icon: '🎁',
    matcher: /premi[eè]re commande|nouveau client|nouveaux clients|bienvenue|new user|1[eè]re commande|inscription/i,
    cardDesc: (n) => `Codes de bienvenue ${n} : les remises réservées à votre première commande.`,
  },
  'deja-client': {
    slug: 'deja-client',
    label: 'Déjà client',
    titleKeyword: 'Déjà Client',
    icon: '🔁',
    matcher: /d[ée]j[àa] client|fid[ée]l|client existant|compte existant/i,
    cardDesc: (n) => `Déjà inscrit chez ${n} ? Les codes qui fonctionnent sur les comptes existants.`,
  },
  'livraison-gratuite': {
    slug: 'livraison-gratuite',
    label: 'Livraison gratuite',
    titleKeyword: 'Livraison Gratuite',
    icon: '📦',
    matcher: /livraison|frais de port|port offert|exp[ée]dition|shipping/i,
    cardDesc: (n) => `Codes et astuces pour ne pas payer les frais de port chez ${n}.`,
  },
  soldes: {
    slug: 'soldes',
    label: 'Soldes',
    titleKeyword: 'Soldes',
    icon: '🏷️',
    matcher: /solde|destock|d[ée]stock|vente flash|vente priv|black friday|french days/i,
    cardDesc: (n) => `Soldes et ventes flash ${n} : cumulez démarques et codes promo.`,
  },
};

export const INTENT_SLUGS = Object.keys(INTENTS);

/** store×intent combos suppressed because a hand-written static page already
 *  covers the same query (static routes shadow the dynamic one anyway — this
 *  keeps them out of hub links & the sitemap too). */
export const SUPPRESSED_INTENTS: Record<string, string[]> = {
  temu: ['premiere-commande', 'livraison-gratuite'], // nouveau-client + livraison-gratuite exist as static pages
  shein: ['livraison-gratuite'], // hand-written static page (Aug 2026) shadows the dynamic intent route
};

export function isSuppressed(storeSlug: string, intentSlug: string): boolean {
  return (SUPPRESSED_INTENTS[storeSlug] ?? []).includes(intentSlug);
}

/** Sub-page gating (thin-content policy): an intent page only EXISTS
 *  (renders + appears in hub links + sitemap) when the store has at least
 *  INTENT_MIN_MATCHED offers actually matching that intent's filter.
 *  A page about "livraison gratuite X" with zero shipping offers is thin —
 *  it now 404s instead of rendering a noindexed shell. */
export const INTENT_MIN_MATCHED = 2;

/** Count of offers matching this intent's filter. */
export function intentMatchCount(coupons: Pick<Coupon, 'title' | 'description'>[], intent: IntentDef): number {
  let n = 0;
  for (const c of coupons) {
    if (intent.matcher.test(`${c.title} ${c.description ?? ''}`)) n++;
  }
  return n;
}

/** True when the store×intent sub-page may exist at all. */
export function intentAvailable(coupons: Pick<Coupon, 'title' | 'description'>[], intent: IntentDef): boolean {
  return intentMatchCount(coupons, intent) >= INTENT_MIN_MATCHED;
}

/** Quality gate for INDEXING (GSC Aug 2026): programmatic intent pages on
 *  template-content stores rank position 60-90 (showroomprive/livraison-
 *  gratuite 67.8, rakuten/premiere-commande 88.3…) — deep enough to never
 *  earn a click while dragging the site-wide average position (29.9).
 *  Rule: intent sub-pages are indexable ONLY for stores with hand-written
 *  editorial content (lib/storeEditorial.ts) — the pages that actually rank
 *  (zara/soldes 11.7, temu & shein sub-pages). Everything else stays
 *  reachable but flips to noindex,follow, leaves the sitemap and loses its
 *  hub links, consolidating signals on the store page. Promoting a store =
 *  write its editorial entry; the intents follow automatically. */
export function intentIndexable(storeSlug: string): boolean {
  return getEditorial(storeSlug) !== null;
}

/** Seasonal exception to the ≥2-matching-offers gate: the /soldes page of an
 *  editorial store is an EVERGREEN seasonal hub. Zara/soldes ranked 11.7 for
 *  « zara promo 2026 soldes » (588 imp) but flipped to noindex the day the
 *  summer soldes copy rotated out of the offer titles — losing the ranking
 *  every off-season, then having to re-earn it in January, is worse than
 *  keeping the page live: its editorial content (legal soldes calendar,
 *  cumul strategy, FAQ) is store-specific and valid year-round, and the page
 *  still lists every active offer. Other intents keep the strict gate. */
export function intentEvergreen(storeSlug: string, intentSlug: string): boolean {
  return intentSlug === 'soldes' && intentIndexable(storeSlug);
}

/* ── date helpers ──────────────────────────────────────────────── */

function monthYear(): { month: string; monthCap: string; year: number } {
  const now = new Date();
  const month = now.toLocaleString('fr-FR', { month: 'long' });
  return { month, monthCap: month.charAt(0).toUpperCase() + month.slice(1), year: now.getFullYear() };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── <title> / meta description ────────────────────────────────── */

export function intentTitle(store: Store, intent: IntentDef): string {
  const { monthCap, year } = monthYear();
  const n = store.name;
  // BUDGET: root layout appends " | LockCoupon" (+13) — Bing flags rendered
  // titles > 65 chars ("Title too long"). Raw title must stay ≤ 52.
  const MAX = 65 - ' | LockCoupon'.length; // = 52

  if (intent.slug === 'soldes') {
    const t = `Soldes ${n} ${year} : codes promo ${monthCap} vérifiés`;
    if (t.length <= MAX) return t;
    const short = `Soldes ${n} ${year} : codes promo vérifiés`;
    return short.length <= MAX ? short : `Soldes ${n} ${year}`;
  }

  const full = `Code Promo ${n} ${intent.titleKeyword} ${monthCap} ${year}`;
  if (full.length <= MAX) return full;
  const noMonth = `Code Promo ${n} ${intent.titleKeyword} ${year}`;
  if (noMonth.length <= MAX) return noMonth;
  const noDate = `Code Promo ${n} ${intent.titleKeyword}`;
  if (noDate.length <= MAX) return noDate;
  const minimal = `${intent.titleKeyword} ${n}`;
  return minimal.length <= MAX ? minimal : minimal.slice(0, MAX - 1) + '…';
}

export function intentDescription(store: Store, intent: IntentDef, coupons: Coupon[]): string {
  const { month, year } = monthYear();
  const n = store.name;
  const s = storeStats(coupons);
  const best = s.bestDiscount ? ` Jusqu'à ${s.bestDiscount} de réduction.` : '';

  switch (intent.slug) {
    case 'premiere-commande':
      return `✅ Code promo ${n} première commande en ${month} ${year} : offres de bienvenue testées aujourd'hui.${best} ${s.offerCount} offres vérifiées, mises à jour plusieurs fois par jour.`;
    case 'deja-client':
      return `✅ Code promo ${n} déjà client (${month} ${year}) : les offres valables sur les comptes existants, testées aujourd'hui.${best} ${s.offerCount} offres vérifiées.`;
    case 'livraison-gratuite':
      return `✅ Livraison gratuite ${n} en ${month} ${year} : codes et conditions pour ne pas payer les frais de port.${best} Offres testées et mises à jour aujourd'hui.`;
    case 'soldes':
      return `✅ Soldes ${n} ${year} : démarques en cours et codes promo cumulables en ${month}.${best} ${s.offerCount} offres vérifiées aujourd'hui par LockCoupon.`;
    default:
      return `✅ Codes promo ${n} vérifiés en ${month} ${year}.${best}`;
  }
}

/* ── answer-first sentence (the GEO/AI-quotable line) ──────────── */

export function intentAnswer(store: Store, intent: IntentDef, coupons: Coupon[]): string {
  const s = storeStats(coupons);
  const n = store.name;
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const matched = coupons.filter((c) => intent.matcher.test(`${c.title} ${c.description ?? ''}`));
  const pool = matched.length > 0 ? matched : coupons;
  const best = bestDiscountLabel(pool);

  const base = best
    ? `la meilleure offre vérifiée le ${today} atteint ${best} de réduction`
    : `${s.offerCount} offre${s.offerCount > 1 ? 's ont' : ' a'} été vérifiée${s.offerCount > 1 ? 's' : ''} le ${today}`;

  switch (intent.slug) {
    case 'premiere-commande':
      return `Pour une première commande ${n}, ${base}${matched.length > 0 ? `, avec ${matched.length} offre${matched.length > 1 ? 's' : ''} spécifiquement réservée${matched.length > 1 ? 's' : ''} aux nouveaux clients` : ''}. Les offres de bienvenue sont généralement les plus généreuses de l'année.`;
    case 'deja-client':
      return `Pour les clients ${n} existants, ${base}. Contrairement aux idées reçues, la plupart des codes de cette page fonctionnent sans créer de nouveau compte.`;
    case 'livraison-gratuite':
      return `Pour éviter les frais de port ${n}, ${base}${matched.length > 0 ? `, dont ${matched.length} offre${matched.length > 1 ? 's' : ''} liée${matched.length > 1 ? 's' : ''} à la livraison` : ''}. Vérifiez toujours le montant minimum de commande avant de valider.`;
    case 'soldes':
      return `Pendant les soldes ${n}, ${base}. Les codes promo se cumulent souvent avec les démarques affichées — comparez le total avec et sans code.`;
    default:
      return `${capitalize(base)}.`;
  }
}

/* ── editorial sections (unique per store × intent) ────────────── */

export interface IntentSection {
  heading: string | null;
  paragraphs: string[];
}

export function intentSections(store: Store, intent: IntentDef, coupons: Coupon[]): IntentSection[] {
  const seed = hashSlug(`${store.slug}:${intent.slug}`);
  const { flavor } = storeFlavor(store.slug);
  const s = storeStats(coupons);
  const n = store.name;
  const sections: IntentSection[] = [];

  if (intent.slug === 'premiere-commande') {
    const openers = [
      `Comme la plupart des enseignes, ${n} soigne particulièrement ses nouveaux clients : la première commande est le moment où les remises sont les plus fortes. C'est un investissement d'acquisition pour la marque — et une vraie opportunité pour vous.`,
      `Votre premier achat chez ${n} est celui qu'il ne faut pas rater : les offres de bienvenue y sont presque toujours plus intéressantes que les promotions courantes sur ${flavor.produits}.`,
      `${n} réserve ses meilleures conditions aux nouveaux comptes. Avant de commander ${flavor.produits} pour la première fois, prenez trente secondes pour vérifier les offres de cette page : la différence peut être significative.`,
    ];
    sections.push({ heading: null, paragraphs: [pick(openers, seed, 1), `${capitalize(flavor.conseil)}.`] });
    sections.push({
      heading: `Comment profiter de l'offre de bienvenue ${n}`,
      paragraphs: [
        `1. Copiez le code de votre choix ci-dessus. 2. Créez votre compte ${n} avec une adresse e-mail jamais utilisée chez cette enseigne. 3. Remplissez votre panier, puis collez le code dans le champ dédié à l'étape du paiement — la remise s'affiche avant la confirmation.`,
        s.offerCount > 0
          ? `En ${s.month}, ${s.offerCount} offre${s.offerCount > 1 ? 's sont actives' : ' est active'} chez ${n}${s.bestDiscount ? `, jusqu'à ${s.bestDiscount} de remise` : ''}. Si un code de bienvenue est refusé, vérifiez qu'aucune commande n'a déjà été passée avec cette adresse ou ce moyen de paiement.`
          : `Aucune offre n'est active en ${s.month} — cette page est réactualisée plusieurs fois par jour, revenez avant de finaliser votre commande.`,
      ],
    });
  }

  if (intent.slug === 'deja-client') {
    const openers = [
      `« Les codes promo, c'est seulement pour les nouveaux clients » : c'est faux chez la plupart des enseignes, et ${n} ne fait pas exception. Une grande partie des offres de cette page s'applique aux comptes existants.`,
      `Vous avez déjà un compte ${n} et les offres « nouveaux clients » vous narguent ? Bonne nouvelle : il existe des remises accessibles sans créer de nouveau compte, et elles sont listées ici.`,
      `Client fidèle de ${n} ? Vous n'êtes pas condamné au plein tarif. Les codes ci-dessus sont testés sur des comptes existants, pas seulement à l'inscription.`,
    ];
    sections.push({ heading: null, paragraphs: [pick(openers, seed, 1)] });
    sections.push({
      heading: `Trois leviers pour payer moins cher chez ${n} en étant déjà client`,
      paragraphs: [
        `D'abord, les codes « tout public » : la majorité des remises ${n} ne vérifie pas l'ancienneté du compte — seuls les codes explicitement « première commande » sont restreints. Ensuite, le panier abandonné : laissez vos ${flavor.produits} en attente 24 à 48h, beaucoup d'enseignes relancent par e-mail avec une remise. Enfin, la newsletter et le programme de fidélité, souvent cumulables avec les codes de cette page.`,
        `${capitalize(flavor.periode)} restent les meilleures fenêtres d'achat, y compris pour les clients existants.`,
      ],
    });
  }

  if (intent.slug === 'livraison-gratuite') {
    const openers = [
      `Les frais de port sont le tueur silencieux du panier : une remise de 10% s'évapore vite si la livraison coûte 5,99€. Chez ${n}, plusieurs leviers permettent de les éviter.`,
      `Payer la livraison en 2026, c'est souvent évitable — surtout chez ${n}. Voici les conditions réelles, vérifiées en ${s.month}, pour recevoir ${flavor.produits} sans frais de port.`,
      `Avant d'appliquer un code promo ${n}, regardez la ligne « livraison » de votre panier : c'est parfois là que se cache la vraie économie.`,
    ];
    sections.push({ heading: null, paragraphs: [pick(openers, seed, 1)] });
    sections.push({
      heading: `Comment obtenir la livraison gratuite chez ${n}`,
      paragraphs: [
        `Le levier le plus fiable reste le seuil de gratuité : la plupart des enseignes offrent les frais de port au-delà d'un montant minimum — ajoutez un petit article utile plutôt que de payer la livraison. Vérifiez ensuite les codes de cette page : certains combinent remise et port offert. Enfin, le retrait en point relais ou en boutique est souvent gratuit même sous le seuil.`,
        s.offerCount > 0 && s.bestDiscount
          ? `Cumulée avec la meilleure remise du moment (${s.bestDiscount}), la livraison offerte peut faire baisser la facture ${n} de façon substantielle.`
          : `Les nouvelles offres ${n} apparaissent en haut de cette page dès leur validation.`,
      ],
    });
  }

  if (intent.slug === 'soldes') {
    const { year } = monthYear();
    const openers = [
      `Les soldes ${n} ${year} sont le moment où les prix touchent leur plancher — et contrairement à une idée reçue, les codes promo ne dorment pas pendant les démarques : beaucoup se cumulent avec les prix soldés.`,
      `Pendant les soldes, ${n} démarque ${flavor.produits} par vagues successives. La stratégie gagnante : surveiller les démarques ET garder un code promo actif sous la main — les deux se cumulent plus souvent qu'on ne le croit.`,
      `Soldes ${n} ${year} : les vraies affaires se font en croisant trois choses — les démarques officielles, les ventes flash, et les codes promo de cette page, vérifiés plusieurs fois par jour.`,
    ];
    sections.push({ heading: null, paragraphs: [pick(openers, seed, 1)] });
    sections.push({
      heading: `Calendrier et stratégie pour les soldes ${n}`,
      paragraphs: [
        `${capitalize(flavor.periode)} concentrent l'essentiel des bonnes affaires sur ${flavor.produits}. Première démarque : le choix est maximal mais les remises modérées. Deuxième et troisième démarques : les prix chutent, le stock aussi — si un article vous plaît vraiment, n'attendez pas la démarque suivante.`,
        `${capitalize(flavor.conseil)}.`,
      ],
    });
  }

  // Shared closing block — verification methodology (E-E-A-T + AI-citability)
  sections.push({
    heading: `Des offres ${n} vérifiées, pas des promesses`,
    paragraphs: [
      `Chaque offre de cette page est contrôlée par nos passages de vérification quotidiens : les codes expirés sont retirés, les nouveaux apparaissent en tête de liste avec leur date de validation.${s.totalUsage > 0 ? ` Les offres ${n} listées ici ont déjà été utilisées ${s.totalUsage.toLocaleString('fr-FR')} fois par nos visiteurs.` : ''} En cas de doute sur un code, sa fiche détaille les conditions : montant minimum, produits éligibles, date d'expiration.`,
    ],
  });

  return sections;
}

/* ── FAQ (mirrored in FAQPage JSON-LD) ─────────────────────────── */

export function intentFaqItems(store: Store, intent: IntentDef, coupons: Coupon[]): FaqItem[] {
  const seed = hashSlug(`${store.slug}:${intent.slug}:faq`);
  const s = storeStats(coupons);
  const n = store.name;
  const { flavor } = storeFlavor(store.slug);
  const { month, year } = monthYear();

  const countAnswer = s.offerCount > 0
    ? `${s.offerCount} offre${s.offerCount > 1 ? 's' : ''} ${n} ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} en ${month} ${year}${s.bestDiscount ? `, avec une remise maximale de ${s.bestDiscount}` : ''}. La liste est réactualisée plusieurs fois par jour.`
    : `Aucune offre ${n} n'est active en ${month} ${year}. Cette page est vérifiée plusieurs fois par jour : la prochaine remise validée apparaîtra ici en premier.`;

  if (intent.slug === 'premiere-commande') {
    return [
      { question: `Comment obtenir un code promo ${n} pour une première commande ?`, answer: pick([
        `Copiez l'un des codes vérifiés de cette page, créez votre compte ${n} avec une adresse e-mail neuve, puis collez le code à l'étape du paiement de votre première commande. La remise s'affiche avant la validation.`,
        `Choisissez une offre ci-dessus et cliquez pour copier le code. Lors de votre première commande ${n} — avec un compte fraîchement créé — collez-le dans le champ « code promo » au moment de payer.`,
      ], seed, 1) },
      { question: `Combien d'offres ${n} première commande en ${month} ${year} ?`, answer: countAnswer },
      { question: `Le code première commande ${n} est-il cumulable ?`, answer: `Les codes de bienvenue ne se cumulent généralement pas entre eux, mais ils s'appliquent le plus souvent sur les prix déjà remisés du site. Le détail des conditions figure sur chaque offre de cette page.` },
      { question: `Que faire si mon code de bienvenue ${n} est refusé ?`, answer: `Vérifiez que votre adresse e-mail, votre adresse de livraison et votre moyen de paiement n'ont jamais été utilisés chez ${n} : les enseignes croisent ces trois critères pour identifier les « nouveaux » clients. Sinon, essayez l'un des codes tout public de la liste.` },
    ];
  }

  if (intent.slug === 'deja-client') {
    return [
      { question: `Existe-t-il des codes promo ${n} pour les clients existants ?`, answer: pick([
        `Oui. Seuls les codes explicitement marqués « première commande » sont réservés aux nouveaux comptes : les autres offres de cette page fonctionnent sur un compte ${n} existant.`,
        `Oui — la plupart des remises ${n} ne vérifient pas l'ancienneté du compte. Cette page liste en priorité les offres testées comme valables pour les clients déjà inscrits.`,
      ], seed, 1) },
      { question: `Combien d'offres ${n} déjà client en ${month} ${year} ?`, answer: countAnswer },
      { question: `Comment avoir une remise ${n} sans créer de nouveau compte ?`, answer: `Trois leviers fonctionnent : les codes tout public de cette page, la technique du panier abandonné (laissez vos articles 24-48h, une relance par e-mail avec remise suit souvent), et la newsletter ${n}, qui distribue des offres réservées aux abonnés.` },
      { question: `Les offres fidélité ${n} se cumulent-elles avec un code promo ?`, answer: `Souvent, oui : les points ou avantages fidélité relèvent d'un programme distinct des codes promo. ${capitalize(flavor.conseil)}.` },
    ];
  }

  if (intent.slug === 'livraison-gratuite') {
    return [
      { question: `Comment avoir la livraison gratuite chez ${n} ?`, answer: pick([
        `Trois options : dépasser le seuil de gratuité des frais de port, utiliser un code livraison offerte de cette page quand il y en a un d'actif, ou choisir le retrait en point relais / boutique, souvent gratuit sans minimum.`,
        `Le plus fiable est le montant minimum de commande : au-delà d'un certain panier, ${n} offre les frais de port. Complétez avec les codes de cette page — certains combinent remise et livraison offerte.`,
      ], seed, 1) },
      { question: `Quel est le minimum de commande pour la livraison gratuite ${n} ?`, answer: `Le seuil exact varie selon les périodes et le mode de livraison choisi : il est affiché dans le panier ${n} avant paiement. Astuce : si votre panier est juste sous le seuil, un petit article utile coûte souvent moins cher que les frais de port.` },
      { question: `Combien d'offres ${n} en ${month} ${year} ?`, answer: countAnswer },
      { question: `Un code livraison gratuite ${n} se cumule-t-il avec une remise ?`, answer: `Rarement dans le même champ « code promo » — mais un code de remise se cumule presque toujours avec la gratuité obtenue par seuil de commande. C'est la combinaison la plus avantageuse dans la majorité des cas.` },
    ];
  }

  // soldes
  return [
    { question: `Quand ont lieu les soldes ${n} en ${year} ?`, answer: `Les soldes d'hiver démarrent début janvier et les soldes d'été fin juin (dates officielles fixées par l'État pour la France). ${n} y ajoute ses propres temps forts : ${flavor.periode}.` },
    { question: `Peut-on utiliser un code promo ${n} pendant les soldes ?`, answer: pick([
      `Oui dans la plupart des cas : les codes de cette page s'appliquent souvent sur les prix déjà soldés. Comparez le total du panier avec et sans code — quand le cumul est refusé, l'enseigne garde automatiquement la remise la plus forte.`,
      `Souvent, oui. Sauf mention contraire dans ses conditions, un code ${n} actif s'applique aussi aux articles démarqués. Chaque offre de cette page précise ses restrictions éventuelles.`,
    ], seed, 1) },
    { question: `Combien d'offres ${n} en ${month} ${year} ?`, answer: countAnswer },
    { question: `Quels produits ${n} sont les plus démarqués pendant les soldes ?`, answer: flavor.faqProduits },
  ];
}

/* ── coupon split: intent-matched first ────────────────────────── */

export function splitCouponsByIntent(coupons: Coupon[], intent: IntentDef): { matched: Coupon[]; others: Coupon[] } {
  const matched: Coupon[] = [];
  const others: Coupon[] = [];
  for (const c of coupons) {
    if (intent.matcher.test(`${c.title} ${c.description ?? ''}`)) matched.push(c);
    else others.push(c);
  }
  return { matched, others };
}

/* ── stats re-export for convenience in the page ───────────────── */
export type { StoreStats };
