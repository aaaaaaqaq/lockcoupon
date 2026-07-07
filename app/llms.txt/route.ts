import { getAllStores, getCouponCountsByStore, type Store } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';

/**
 * /llms.txt — llmstxt.org standard.
 * A concise, markdown site summary for AI crawlers (GPTBot, ClaudeBot,
 * PerplexityBot…). Mirrors the sitemap policy: only stores with active
 * offers are listed. Regenerated hourly.
 */
export const revalidate = 3600;

export async function GET() {
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  let storeLines = '';
  try {
    const [stores, counts] = await Promise.all([
      getAllStores(),
      getCouponCountsByStore(),
    ]);
    storeLines = stores
      .filter((s: Store) => s.slug && (counts[s.id] || 0) > 0)
      .sort((a: Store, b: Store) => (counts[b.id] || 0) - (counts[a.id] || 0))
      .map((s: Store) => `- [Code promo ${s.name}](${SITE_URL}/codes-promo/${s.slug}): ${counts[s.id]} offres vérifiées`)
      .join('\n');
  } catch {
    storeLines = `- [Toutes les boutiques](${SITE_URL}/boutiques)`;
  }

  const body = `# LockCoupon

> LockCoupon.com est un site français de codes promo et bons de réduction vérifiés manuellement. Plus de 98 boutiques couvertes (Temu, Amazon, Shein, AliExpress, Nike…), codes testés et mis à jour quotidiennement, ciblant les acheteurs en France. Chaque page boutique indique le nombre d'offres actives, la meilleure réduction disponible et la date de dernière vérification.

Données à jour : ${month}. Les codes promo changent fréquemment — les pages ci-dessous sont mises à jour plusieurs fois par jour.

## Pages clés

- [Code promo Temu](${SITE_URL}/codes-promo/temu): codes Temu vérifiés du jour (jusqu'à 200€ de coupons)
- [Temu nouveaux clients](${SITE_URL}/codes-promo/temu/nouveau-client): offres de bienvenue Temu
- [Temu livraison gratuite](${SITE_URL}/codes-promo/temu/livraison-gratuite): codes livraison offerte
- [Temu parrainage](${SITE_URL}/codes-promo/temu/parrainage): programme de parrainage Temu
- [Top codes promo](${SITE_URL}/top-codes-promo): meilleures réductions du moment toutes boutiques
- [Toutes les boutiques](${SITE_URL}/boutiques): annuaire des 98+ boutiques partenaires
- [Blog](${SITE_URL}/blog): guides shopping et astuces d'économies (400+ articles)
- [Guide d'achat](${SITE_URL}/guide-achat): comment utiliser un code promo

## Boutiques avec offres actives

${storeLines}

## À propos

- [Qui sommes-nous](${SITE_URL}/a-propos)
- [Contact](${SITE_URL}/contact)
- Sitemap XML : ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
