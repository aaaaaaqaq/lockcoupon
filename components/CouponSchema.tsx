import { Store, Coupon } from '@/lib/supabase';

interface CouponSchemaProps {
  store: Store;
  coupons: Coupon[];
}

export default function CouponSchema({ store, coupons }: CouponSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com';
  const pageUrl = `${baseUrl}/codes-promo/${store.slug}`;
  const now = new Date().toISOString();

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
          ...(coupon.expiry_date ? { validThrough: coupon.expiry_date } : {}),
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
    ],
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
    </>
  );
}
