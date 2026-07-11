// Store-specific subpages (SEO silo hub links)
// Rendered on the main store page to interlink long-tail landing pages.

import { INTENTS, isSuppressed, intentIndexable } from './intentContent';

export interface StoreSubpage {
  href: string;
  title: string;
  desc: string;
  icon: string;
}

/**
 * Hub links for a store: hand-written subpages (below) merged with the
 * programmatic intent pages (/codes-promo/[slug]/[intent]) — intent links
 * only appear when the store has enough offers for the pages to be indexable.
 */
export function allSubpagesFor(slug: string, storeName: string, offerCount: number): StoreSubpage[] {
  const manual = STORE_SUBPAGES[slug] ?? [];
  if (!intentIndexable(offerCount)) return manual;

  const auto: StoreSubpage[] = Object.values(INTENTS)
    .filter((intent) => !isSuppressed(slug, intent.slug))
    .map((intent) => ({
      href: `/codes-promo/${slug}/${intent.slug}`,
      title: `${intent.label} ${storeName}`,
      desc: intent.cardDesc(storeName),
      icon: intent.icon,
    }));

  const seen = new Set(manual.map((s) => s.href));
  return [...manual, ...auto.filter((s) => !seen.has(s.href))];
}

export const STORE_SUBPAGES: Record<string, StoreSubpage[]> = {
  amazon: [
    {
      href: '/codes-promo/amazon/prime-day',
      title: 'Amazon Prime Day 2026',
      desc: 'Dates, meilleures offres et astuces pour profiter du plus gros événement promo Amazon.',
      icon: '⚡',
    },
  ],
  temu: [
    {
      href: '/codes-promo/temu/nouveau-client',
      title: 'Code promo Temu nouveau client',
      desc: "Jusqu'à 90% de réduction sur votre première commande + pack de coupons de bienvenue.",
      icon: '🎁',
    },
    {
      href: '/codes-promo/temu/livraison-gratuite',
      title: 'Livraison gratuite Temu',
      desc: "Codes et astuces pour obtenir la livraison gratuite sans minimum d'achat.",
      icon: '📦',
    },
    {
      href: '/codes-promo/temu/parrainage',
      title: 'Code parrainage Temu',
      desc: 'Parrainez vos proches et cumulez crédits, cadeaux et réductions exclusives.',
      icon: '🤝',
    },
  ],
};
