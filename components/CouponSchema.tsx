import { Store, Coupon } from '@/lib/supabase';
import { storeFaqItems } from '@/lib/storeContent';
import { SITE_URL } from '@/lib/site';

interface CouponSchemaProps {
  store: Store;
  coupons: Coupon[];
}

export default function CouponSchema({ store, coupons }: CouponSchemaProps) {
  const baseUrl = SITE_URL;
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

  // ── 3. FAQPage — generated from the SAME source as the visible on-page FAQ
  // (lib/storeContent.ts) so structured data always matches rendered content,
  // as required by Google's FAQ rich-result guidelines. ──────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: storeFaqItems(store, coupons).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
