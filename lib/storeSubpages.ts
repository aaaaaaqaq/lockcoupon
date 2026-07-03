// Store-specific subpages (SEO silo hub links)
// Rendered on the main store page to interlink long-tail landing pages.

export interface StoreSubpage {
  href: string;
  title: string;
  desc: string;
  icon: string;
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
