import { Store, Coupon } from '@/lib/supabase';

interface CouponSchemaProps {
  store: Store;
  coupons: Coupon[];
}

export default function CouponSchema({ store, coupons }: CouponSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com';
  const pageUrl = `${baseUrl}/codes-promo/${store.slug}`;
  const now = new Date().toISOString();
  const nowDate = new Date();

  // ── 1. BreadcrumbList ────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Boutiques',
        item: `${baseUrl}/boutiques`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: store.name,
        item: pageUrl,
      },
    ],
  };

  // ── 2. ItemList of Offers (Google Rich Snippets compliant) ───────
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Codes promo ${store.name}`,
    url: pageUrl,
    numberOfItems: coupons.length,
    itemListElement: coupons.slice(0, 20).map((coupon, index) => {
      const offer: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Offer',
          name: coupon.title,
          description: coupon.title,
          url: pageUrl,
          // price + priceCurrency are required for Offer Rich Snippet eligibility
          price: '0',
          priceCurrency: 'EUR',
          category: 'Coupon',
          availability: 'https://schema.org/InStock',
          validFrom: coupon.created_at || now,
          ...(coupon.expiry_date && new Date(coupon.expiry_date) > nowDate ? { validThrough: coupon.expiry_date } : {}),
          offeredBy: {
            '@type': 'Organization',
            name: store.name,
            url: `https://www.lockcoupon.com/codes-promo/${store.slug}`,
          },
          seller: {
            '@type': 'Organization',
            name: 'LockCoupon',
            url: 'https://www.lockcoupon.com',
          },
        },
      };
      return offer;
    }),
  };

  // ── 3. FAQPage (clean, no duplicates) ────────────────
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const codeCoupons = coupons.filter((c) => c.type === 'code');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Comment utiliser un code promo ${store.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Copiez le code sur LockCoupon, rendez-vous sur ${store.name}, ajoutez vos articles au panier et collez le code dans le champ prévu lors du paiement.`,
        },
      },
      {
        '@type': 'Question',
        name: `Combien de codes promo ${store.name} sont disponibles en ${month} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `En ${month}, ${coupons.length} offres ${store.name} sont disponibles sur LockCoupon, dont ${codeCoupons.length} codes promo actifs vérifiés.`,
        },
      },
      {
        '@type': 'Question',
        name: `Les codes promo ${store.name} sont-ils fiables ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Oui, tous les codes promo ${store.name} sur LockCoupon sont vérifiés par notre équipe. Nous affichons le nombre d'utilisations pour chaque code.`,
        },
      },
      {
        '@type': 'Question',
        name: `Est-ce que ${store.name} offre la livraison gratuite ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Les offres de livraison gratuite ${store.name} varient selon les périodes. Consultez notre page ${store.name} sur LockCoupon pour voir les codes promo livraison gratuite actuellement disponibles.`,
        },
      },
      {
        '@type': 'Question',
        name: `Que faire si mon code promo ${store.name} ne fonctionne pas ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Vérifiez les conditions du code (montant minimum, catégories éligibles, date d'expiration). Si le code est expiré, essayez un autre code disponible sur LockCoupon. Nos offres sont mises à jour quotidiennement.`,
        },
      },
    ],
  };

  // ── 4. WebPage with Speakable (no fake AggregateRating) ──────────────
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    name: `Codes promo ${store.name}`,
    url: pageUrl,
    description: `Tous les codes promo ${store.name} vérifiés sur LockCoupon. ${coupons.length} offres actives.`,
    dateModified: now,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://www.lockcoupon.com/#website',
      name: 'LockCoupon',
      url: 'https://www.lockcoupon.com',
    },
    publisher: {
      '@id': 'https://www.lockcoupon.com/#organization',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '[aria-label]'],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
