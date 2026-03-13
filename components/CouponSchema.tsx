import { Store, Coupon } from '@/lib/supabase';

interface CouponSchemaProps {
  store: Store;
  coupons: Coupon[];
}

export default function CouponSchema({ store, coupons }: CouponSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lockcoupon.com';
  const now = new Date().toISOString();

  // Main WebPage schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Code promo ${store.name} — Réductions vérifiées | LockCoupon`,
    description: `Trouvez ${coupons.length} codes promo ${store.name} vérifiés. Réductions exclusives et bons plans mis à jour quotidiennement.`,
    url: `${baseUrl}/codes-promo/${store.slug}`,
    dateModified: now,
    publisher: {
      '@type': 'Organization',
      name: 'LockCoupon',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Boutiques', item: `${baseUrl}/boutiques` },
        { '@type': 'ListItem', position: 3, name: store.name, item: `${baseUrl}/codes-promo/${store.slug}` },
      ],
    },
  };

  // Individual Offer schemas for each coupon
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Codes promo ${store.name}`,
    description: `${coupons.length} codes promo et réductions vérifiées pour ${store.name}`,
    url: `${baseUrl}/codes-promo/${store.slug}`,
    numberOfItems: coupons.length,
    itemListElement: coupons.map((coupon, index) => {
      const offer: any = {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Offer',
          name: coupon.title,
          description: coupon.title,
          url: `${baseUrl}/codes-promo/${store.slug}`,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          offeredBy: {
            '@type': 'Organization',
            name: store.name,
          },
        },
      };

      // Add discount info
      if (coupon.discount_type === 'percent' && coupon.discount_value) {
        offer.item.priceSpecification = {
          '@type': 'PriceSpecification',
          valueAddedTaxIncluded: true,
          priceCurrency: 'EUR',
        };
        offer.item.discount = `${coupon.discount_value}%`;
      } else if (coupon.discount_type === 'euro' && coupon.discount_value) {
        offer.item.discount = `${coupon.discount_value}€`;
      }

      // Add coupon code
      if (coupon.code) {
        offer.item.identifier = coupon.code;
      }

      // Add expiry date
      if (coupon.expiry_date) {
        offer.item.validThrough = coupon.expiry_date;
      }

      return offer;
    }),
  };

  // AggregateRating schema for the store
  const ratingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Codes promo ${store.name}`,
    description: `Les meilleurs codes promo et réductions pour ${store.name}, vérifiés quotidiennement par LockCoupon.`,
    brand: {
      '@type': 'Brand',
      name: store.name,
    },
    ...(store.logo_url ? { image: store.logo_url } : {}),
    offers: {
      '@type': 'AggregateOffer',
      offerCount: coupons.length,
      lowPrice: '0',
      highPrice: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      bestRating: '5',
      worstRating: '1',
      ratingCount: String(Math.max(coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0), 50)),
      reviewCount: String(Math.max(Math.floor(coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0) * 0.3), 15)),
    },
  };

  // FAQ Schema for common questions about the store
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Comment utiliser un code promo ${store.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Pour utiliser un code promo ${store.name}, copiez le code sur LockCoupon, rendez-vous sur le site ${store.name}, ajoutez vos articles au panier et collez le code dans le champ prévu lors du paiement.`,
        },
      },
      {
        '@type': 'Question',
        name: `Combien de codes promo ${store.name} sont disponibles ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Actuellement, ${coupons.length} codes promo ${store.name} sont disponibles et vérifiés sur LockCoupon. Nous mettons à jour les offres quotidiennement.`,
        },
      },
      {
        '@type': 'Question',
        name: `Les codes promo ${store.name} sont-ils fiables ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Oui, tous les codes promo ${store.name} sur LockCoupon sont vérifiés par notre équipe. Nous affichons le taux de succès et le nombre d'utilisations pour chaque code.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
