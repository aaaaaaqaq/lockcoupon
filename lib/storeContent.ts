/**
 * Per-store unique editorial content generator.
 *
 * Problem this solves (GSC "Explorée/Détectée, actuellement non indexée"):
 * the FAQ, "comment utiliser" and "À propos" blocks used to be word-for-word
 * identical across all 98 store pages → Google classified them as thin/
 * boilerplate and refused to index most of them.
 *
 * Every text block below is derived from THIS store's real data (category,
 * live offer count, best current discount, usage stats) plus deterministic
 * phrasing variants seeded by the store slug, so no two stores emit the
 * same paragraphs — and the output is stable across renders (no hydration
 * mismatch, no content flicker between ISR revalidations).
 *
 * Pure TypeScript, safe to import from both server and client components.
 */

import { getCategoriesForStore, type Category } from './categories';
import { bestDiscountLabel } from './discount';
import type { Store, Coupon } from './supabase';
import { getEditorial } from './storeEditorial';

/* ── deterministic seed from slug ──────────────────────────────── */
export function hashSlug(slug: string): number {
  let h = 7;
  for (let i = 0; i < slug.length; i++) h = ((h * 31) + slug.charCodeAt(i)) >>> 0;
  return h;
}
export function pick<T>(arr: readonly T[], seed: number, salt: number): T {
  return arr[(seed + salt * 13) % arr.length];
}

/* ── category flavor: real editorial angle per vertical ────────── */
interface CategoryFlavor {
  produits: string;       // what people buy there
  conseil: string;        // category-specific saving advice
  periode: string;        // best shopping periods for this vertical
  faqProduits: string;    // answer for the category question
}

const FLAVORS: Record<string, CategoryFlavor> = {
  mode: {
    produits: 'vêtements, chaussures et accessoires',
    conseil: 'les nouvelles collections sont rarement remisées : visez les fins de série et les ventes flash mi-saison, où les codes promo se cumulent souvent avec des remises déjà affichées',
    periode: 'les soldes d\u2019hiver (janvier), les soldes d\u2019été (fin juin) et les ventes privées d\u2019avant-soldes',
    faqProduits: 'Les réductions portent le plus souvent sur les collections précédentes, les fins de série et les capsules saisonnières. Les pièces basiques (jeans, t-shirts, baskets) bénéficient des remises les plus fréquentes.',
  },
  'high-tech': {
    produits: 'smartphones, ordinateurs, TV et petit électroménager high-tech',
    conseil: 'comparez toujours le prix remisé avec les reconditionnés : sur l\u2019électronique, un code de 10% sur du neuf bat rarement une bonne offre de reconditionné garanti',
    periode: 'le Black Friday (fin novembre), les French Days (printemps et automne) et la rentrée de septembre',
    faqProduits: 'Les codes s\u2019appliquent surtout aux accessoires, au petit électroménager et aux produits de générations précédentes. Les tout derniers modèles sont plutôt concernés par des offres de remboursement (ODR) que par des codes.',
  },
  maison: {
    produits: 'meubles, décoration, linge de maison et électroménager',
    conseil: 'le mobilier suit un calendrier précis : les remises les plus fortes tombent lors des changements de collection (janvier et septembre), et la livraison offerte fait souvent gagner plus qu\u2019un petit pourcentage de remise',
    periode: 'les soldes de janvier, la rentrée de septembre et le Black Friday pour l\u2019électroménager',
    faqProduits: 'Les remises les plus intéressantes concernent généralement les grosses pièces (canapés, literie, armoires) où même un petit pourcentage représente des dizaines d\u2019euros, ainsi que les fins de collection déco.',
  },
  beaute: {
    produits: 'maquillage, soins, parfums et coffrets',
    conseil: 'les parfums et coffrets sont les produits les plus remisés : gardez vos achats de fêtes pour les ventes privées, et cumulez code promo + programme de fidélité, presque toujours autorisé en parfumerie',
    periode: 'les ventes privées de printemps, la fête des mères et les coffrets de fin d\u2019année',
    faqProduits: 'Les parfums, coffrets cadeaux et soins visage concentrent l\u2019essentiel des remises. Le maquillage est plus souvent concerné par des offres du type "2 achetés = 1 offert" que par des codes en pourcentage.',
  },
  voyage: {
    produits: 'vols, hôtels, locations et séjours',
    conseil: 'sur le voyage, la flexibilité vaut plus qu\u2019un code : combinez un code promo avec des dates décalées en semaine et vous économiserez sur les deux tableaux',
    periode: 'janvier (réservations d\u2019été anticipées), septembre et les ventes flash de dernière minute',
    faqProduits: 'Les codes portent le plus souvent sur les hébergements et les packs vol + hôtel. Les vols secs sont rarement remisés par code, mais les ventes flash sur les séjours peuvent dépasser -40%.',
  },
  sport: {
    produits: 'équipement, textile et chaussures de sport',
    conseil: 'les gammes running et fitness changent chaque saison : les modèles de l\u2019année précédente perdent 30 à 50% avec un code, pour des performances quasi identiques',
    periode: 'la rentrée de septembre, les soldes de janvier et les destockages de fin de saison sportive',
    faqProduits: 'Les chaussures et le textile des collections précédentes affichent les plus grosses remises. Le matériel (haltères, vélos, raquettes) est davantage remisé lors des grands événements type Black Friday.',
  },
  alimentation: {
    produits: 'courses du quotidien, produits frais et livraison de repas',
    conseil: 'sur les courses et la livraison de repas, les codes "première commande" sont les plus généreux : ils dépassent souvent 10€ de remise immédiate là où les promos classiques plafonnent à 5%',
    periode: 'les périodes de fêtes, la rentrée et les opérations anti-inflation',
    faqProduits: 'Les remises portent surtout sur la première commande en ligne, le drive et la livraison. Les produits frais sont rarement remisés par code, contrairement à l\u2019épicerie et aux produits d\u2019entretien.',
  },
  marketplace: {
    produits: 'high-tech, maison, mode et petits prix du quotidien',
    conseil: 'sur les marketplaces, vérifiez le vendeur avant d\u2019appliquer votre code : certains codes ne fonctionnent que sur les articles expédiés par la plateforme elle-même',
    periode: 'le Black Friday, le 11.11, les anniversaires de plateforme et les ventes flash quotidiennes',
    faqProduits: 'Presque toutes les catégories sont couvertes, mais les remises les plus agressives concernent l\u2019électronique d\u2019accessoires, la maison et les articles à petits prix où les vendeurs se livrent une forte concurrence.',
  },
};

const GENERIC_FLAVOR: CategoryFlavor = {
  produits: 'les produits phares de la boutique',
  conseil: 'comparez le panier avec et sans code avant de valider : certaines remises automatiques du site ne se cumulent pas avec les codes, et la meilleure combinaison n\u2019est pas toujours celle qu\u2019on croit',
  periode: 'les soldes d\u2019hiver et d\u2019été, le Black Friday et les ventes privées',
  faqProduits: 'Les conditions varient selon les offres : certaines s\u2019appliquent à tout le catalogue, d\u2019autres à une sélection. Le détail est précisé sur chaque code affiché sur cette page.',
};

export function storeFlavor(slug: string): { flavor: CategoryFlavor; category: Category | null } {
  const cats = getCategoriesForStore(slug);
  const category = cats[0] ?? null;
  return { flavor: category ? FLAVORS[category.slug] ?? GENERIC_FLAVOR : GENERIC_FLAVOR, category };
}

/* ── shared live stats ─────────────────────────────────────────── */
export interface StoreStats {
  offerCount: number;
  codeCount: number;
  bonCount: number;
  bestDiscount: string | null;
  totalUsage: number;
  month: string;
}

export function storeStats(coupons: Coupon[]): StoreStats {
  return {
    offerCount: coupons.length,
    codeCount: coupons.filter((c) => c.type === 'code').length,
    bonCount: coupons.filter((c) => c.type === 'bon').length,
    bestDiscount: bestDiscountLabel(coupons),
    totalUsage: coupons.reduce((s, c) => s + (c.usage_count || 0), 0),
    month: new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
  };
}

/* ── intro paragraph (hero/about lead) ─────────────────────────── */
export function storeIntro(store: Store, coupons: Coupon[]): string {
  const s = storeStats(coupons);

  // Priority stores get hand-written, store-specific copy (storeEditorial.ts)
  // — the template variants below are shared across ~20 stores each, which
  // proved too boilerplate-like for competitive queries (temu/shein/hm).
  const editorial = getEditorial(store.slug);
  if (editorial) return editorial.intro(s);

  const seed = hashSlug(store.slug);
  const { flavor, category } = storeFlavor(store.slug);

  const openers = [
    `${store.name} fait partie des boutiques ${category ? category.name.toLowerCase() : 'en ligne'} les plus recherchées de France, et il y a toujours moyen d\u2019y payer moins cher.`,
    `Pas besoin d\u2019attendre les soldes pour économiser chez ${store.name} : de bonnes remises circulent toute l\u2019année sur ${flavor.produits}.`,
    `Avant de valider votre panier ${store.name}, un réflexe s\u2019impose : vérifier s\u2019il existe une remise active sur ${flavor.produits}.`,
    `Chez ${store.name}, le prix affiché n\u2019est presque jamais le prix final possible — encore faut-il avoir le bon code au bon moment.`,
    `Amateurs de ${flavor.produits}, ${store.name} propose régulièrement des remises qui valent le détour, à condition de savoir où les trouver.`,
  ];

  const statsPart = s.offerCount > 0
    ? (s.bestDiscount
        ? ` En ${s.month}, notre équipe a validé ${s.offerCount} offre${s.offerCount > 1 ? 's' : ''}${s.codeCount > 0 ? ` dont ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} à saisir au paiement` : ''}, avec une remise maximale de ${s.bestDiscount}.`
        : ` En ${s.month}, ${s.offerCount} offre${s.offerCount > 1 ? 's' : ''} ${store.name} ${s.offerCount > 1 ? 'sont vérifiées' : 'est vérifiée'} et active${s.offerCount > 1 ? 's' : ''} sur cette page.`)
    : ` Aucune offre n\u2019est active en ${s.month} : cette page est mise à jour plusieurs fois par jour, revenez dès qu\u2019une remise ${store.name} retombe.`;

  const closers = [
    ` Notre conseil pour cette enseigne : ${flavor.conseil}.`,
    ` Bon à savoir : ${flavor.conseil}.`,
    ` Le meilleur moment pour acheter ? ${capitalize(flavor.periode)}.`,
    ` Côté calendrier, privilégiez ${flavor.periode}.`,
  ];

  return pick(openers, seed, 1) + statsPart + pick(closers, seed, 2);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── FAQ: unique per store, mirrored in FAQPage JSON-LD ─────────── */
export interface FaqItem {
  question: string;
  answer: string;
}

export function storeFaqItems(store: Store, coupons: Coupon[]): FaqItem[] {
  const seed = hashSlug(store.slug);
  const { flavor, category } = storeFlavor(store.slug);
  const s = storeStats(coupons);
  const n = store.name;

  // Hand-written store-specific FAQ + the two live-stats questions below.
  // Same output feeds the on-page FAQ and the FAQPage JSON-LD (CouponSchema).
  const editorial = getEditorial(store.slug);
  if (editorial) {
    return [
      ...editorial.faq(s),
      {
        question: `Combien d\u2019offres ${n} sont disponibles en ${s.month} ?`,
        answer: s.offerCount > 0
          ? `Cette page recense ${s.offerCount} offre${s.offerCount > 1 ? 's' : ''} ${n} vérifiée${s.offerCount > 1 ? 's' : ''} en ${s.month}${s.codeCount > 0 ? `, dont ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} promo à saisir` : ''}${s.bonCount > 0 ? ` et ${s.bonCount} bon${s.bonCount > 1 ? 's' : ''} plan${s.bonCount > 1 ? 's' : ''} sans code` : ''}. La liste est réactualisée plusieurs fois par jour.`
          : `Aucune offre ${n} n\u2019est active en ${s.month}. Nos robots vérifient cette enseigne plusieurs fois par jour : ajoutez cette page à vos favoris pour être parmi les premiers à profiter de la prochaine remise.`,
      },
      {
        question: `Quelle est la meilleure réduction ${n} en ce moment ?`,
        answer: s.bestDiscount
          ? `La remise ${n} la plus élevée validée en ${s.month} atteint ${s.bestDiscount}. Les offres sont classées par intérêt sur cette page : la meilleure figure en tête de liste, avec ses conditions d\u2019utilisation détaillées.`
          : `Aucune remise chiffrée n\u2019est garantie actuellement chez ${n}. Nous publions les nouvelles offres dès leur validation.`,
      },
    ];
  }

  const howToAnswers = [
    `Choisissez une offre ${n} sur cette page et cliquez sur « Voir le code » : il est copié automatiquement. Sur le site ${n}, remplissez votre panier de ${flavor.produits}, puis collez le code dans le champ dédié à l\u2019étape du paiement — la remise apparaît avant la confirmation de commande.`,
    `Cliquez sur l\u2019offre ${n} qui correspond à votre panier : le code se copie tout seul. Il ne reste qu\u2019à le coller dans la case « code promo » du site ${n} au moment de payer. Si la remise ne s\u2019affiche pas, vérifiez les conditions (montant minimum, sélection de produits).`,
    `Repérez le code ${n} adapté à votre achat, copiez-le en un clic, puis appliquez-le dans le champ prévu sur la page de paiement de ${n}. La réduction se calcule instantanément sur le total — avant de valider, comparez avec les remises automatiques éventuelles.`,
  ];

  const reliabilityAnswers = [
    `Chaque code ${n} publié ici est testé par notre équipe, et les offres expirées sont retirées lors de nos passages de vérification quotidiens. Le compteur d\u2019utilisations affiché sur chaque offre vous indique celles qui fonctionnent le mieux en ce moment.`,
    `Oui : nous vérifions les offres ${n} plusieurs fois par jour et supprimons celles qui n\u2019acceptent plus de commandes. ${s.totalUsage > 0 ? `Les offres de cette page ont déjà été utilisées ${s.totalUsage.toLocaleString('fr-FR')} fois par nos visiteurs.` : `Chaque offre affiche son statut de vérification et sa date de validité.`}`,
    `Tous les codes ${n} de cette page passent par une vérification manuelle ou automatisée avant publication, puis des contrôles quotidiens. Si un code cesse de fonctionner entre deux contrôles, un autre code actif est généralement disponible juste en dessous.`,
  ];

  const items: FaqItem[] = [
    {
      question: `Comment utiliser un code promo ${n} ?`,
      answer: pick(howToAnswers, seed, 3),
    },
    {
      question: `Combien d\u2019offres ${n} sont disponibles en ${s.month} ?`,
      answer: s.offerCount > 0
        ? `Cette page recense ${s.offerCount} offre${s.offerCount > 1 ? 's' : ''} ${n} vérifiée${s.offerCount > 1 ? 's' : ''} en ${s.month}${s.codeCount > 0 ? `, dont ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} promo à saisir` : ''}${s.bonCount > 0 ? ` et ${s.bonCount} bon${s.bonCount > 1 ? 's' : ''} plan${s.bonCount > 1 ? 's' : ''} sans code` : ''}. La liste est réactualisée plusieurs fois par jour.`
        : `Aucune offre ${n} n\u2019est active en ${s.month}. Nos robots vérifient cette enseigne plusieurs fois par jour : ajoutez cette page à vos favoris pour être parmi les premiers à profiter de la prochaine remise.`,
    },
    {
      question: `Quelle est la meilleure réduction ${n} en ce moment ?`,
      answer: s.bestDiscount
        ? `La remise ${n} la plus élevée validée en ${s.month} atteint ${s.bestDiscount}. Les offres sont classées par intérêt sur cette page : la meilleure figure en tête de liste, avec ses conditions d\u2019utilisation détaillées.`
        : `Aucune remise chiffrée n\u2019est garantie actuellement chez ${n}. ${capitalize(flavor.periode)} restent les périodes les plus favorables pour cette enseigne — nous publions les nouvelles offres dès leur validation.`,
    },
    {
      question: category
        ? `Quels produits ${n} profitent le plus des codes promo ?`
        : `Sur quels achats ${n} les codes promo s\u2019appliquent-ils ?`,
      answer: flavor.faqProduits,
    },
    {
      question: `Les codes promo ${n} de LockCoupon sont-ils fiables ?`,
      answer: pick(reliabilityAnswers, seed, 4),
    },
  ];

  return items;
}

/* ── "À propos" body paragraphs ────────────────────────────────── */
export interface AboutSection {
  heading: string | null;
  text: string;
}

export function storeAboutSections(store: Store, coupons: Coupon[]): AboutSection[] {
  const seed = hashSlug(store.slug);
  const { flavor, category } = storeFlavor(store.slug);
  const s = storeStats(coupons);
  const n = store.name;

  const sections: AboutSection[] = [];

  // Lead: unique stats-driven intro
  sections.push({ heading: null, text: storeIntro(store, coupons) });

  // Store description from DB when available (already unique per store)
  if (store.description) {
    sections.push({ heading: null, text: store.description });
  }

  // Priority stores: hand-written sections replace the generated guidance
  // (the stat-driven offer-type explainer below is kept — it's unique per
  // store because it interpolates this store's live offer mix).
  const editorial = getEditorial(store.slug);
  if (editorial) {
    sections.push(...editorial.about(s));
  } else {

  // Category-specific buying guidance — different heading + body per vertical
  const guidanceHeadings = [
    `Bien acheter chez ${n}${category ? ` (${category.name.toLowerCase()})` : ''}`,
    `Nos conseils pour payer ${n} moins cher`,
    `Comment maximiser vos économies chez ${n}`,
  ];
  sections.push({
    heading: pick(guidanceHeadings, seed, 5),
    text: `${capitalize(flavor.conseil)}. Les périodes les plus intéressantes pour ${flavor.produits} restent ${flavor.periode}. ${
      s.codeCount > 0
        ? `En ce moment, ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} ${n} ${s.codeCount > 1 ? 'sont actifs' : 'est actif'}${s.bestDiscount ? ` — jusqu\u2019à ${s.bestDiscount} de remise` : ''}.`
        : `Dès qu\u2019un nouveau code ${n} est validé, il apparaît en haut de cette page.`
    }`,
  });
  }

  // Offer-type explainer, phrased from this store's actual mix
  const typeText = s.offerCount === 0
    ? `Lorsque des offres ${n} sont actives, vous trouverez ici deux formats : des codes promo à saisir au paiement et des bons plans à activation automatique. Chaque offre précise ses conditions — montant minimum, produits éligibles, date d\u2019expiration.`
    : s.codeCount > 0 && s.bonCount > 0
      ? `Le mix actuel chez ${n} : ${s.codeCount} code${s.codeCount > 1 ? 's' : ''} à saisir au paiement et ${s.bonCount} bon${s.bonCount > 1 ? 's' : ''} plan${s.bonCount > 1 ? 's' : ''} à activation automatique. Les codes offrent en général la remise la plus forte, les bons plans sont sans condition de saisie.`
      : s.codeCount > 0
        ? `Les ${s.offerCount > 1 ? `${s.offerCount} offres actuelles` : 'offres actuelles'} de ${n} sont ${s.codeCount > 1 ? 'des codes' : 'un code'} à saisir dans le champ dédié au moment du paiement. Vérifiez les conditions de chaque code : certaines remises exigent un montant minimum d\u2019achat.`
        : `Les offres ${n} du moment sont des bons plans à activation automatique : cliquez sur l\u2019offre, finalisez votre commande, la remise s\u2019applique sans saisir de code.`;
  sections.push({ heading: `Codes promo ou bons plans ${n} : quelle différence ?`, text: typeText });

  return sections;
}

/* ── practical tips (replaces identical 4-tip block) ───────────── */
export function storeTips(store: Store, coupons: Coupon[]): { icon: string; tip: string }[] {
  const editorial = getEditorial(store.slug);
  if (editorial?.tips) return editorial.tips(storeStats(coupons));

  const seed = hashSlug(store.slug);
  const { flavor } = storeFlavor(store.slug);
  const n = store.name;

  const pools: { icon: string; tip: string }[][] = [
    [
      { icon: '🎯', tip: `${capitalize(flavor.conseil)}.` },
      { icon: '📅', tip: `Notez ${flavor.periode} : ce sont historiquement les meilleures fenêtres pour acheter ${flavor.produits} chez ${n}.` },
    ],
    [
      { icon: '📧', tip: `La newsletter ${n} distribue régulièrement des remises réservées aux abonnés — souvent cumulables avec les prix barrés du site.` },
      { icon: '🛒', tip: `Laissez votre panier ${n} en attente 24 à 48h : beaucoup d\u2019enseignes relancent par e-mail avec une remise pour finaliser la commande.` },
    ],
    [
      { icon: '📱', tip: `Si ${n} a une application mobile, comparez-y les prix : certaines promotions in-app ne sont pas visibles sur le site web.` },
      { icon: '🔁', tip: `Un code ${n} refusé ? Vérifiez le montant minimum et la sélection éligible, puis essayez l\u2019offre suivante de la liste — plusieurs codes actifs coexistent souvent.` },
    ],
    [
      { icon: '🔔', tip: `Cette page ${n} est réactualisée plusieurs fois par jour : les nouveaux codes apparaissent en tête de liste dès leur validation.` },
      { icon: '💳', tip: `Avant de payer chez ${n}, comparez le total avec code et avec les remises automatiques : les deux ne se cumulent pas toujours, gardez la combinaison la plus avantageuse.` },
    ],
  ];

  return pools.map((pool, i) => pick(pool, seed, 6 + i));
}
