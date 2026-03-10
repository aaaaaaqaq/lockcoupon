import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreBySlug, getCouponsByStoreId, getAllStores } from '@/lib/supabase';
import StorePageClient from './StorePageClient';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const title = `Code promo ${store.name} — ${new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })} | BonPlan.ma`;
  const description = `Trouvez les meilleurs codes promo ${store.name} vérifiés. Réductions exclusives et bons plans mis à jour quotidiennement.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/codes-promo/${params.slug}`,
      siteName: 'BonPlan.ma',
      locale: 'fr_MA',
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const stores = await getAllStores();
  return stores.map((s) => ({ slug: s.slug }));
}

export default async function StorePageSSR({ params }: Props) {
  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();

  const coupons = await getCouponsByStoreId(store.id);

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Code promo ${store.name}`,
    description: `Codes promo et réductions vérifiées pour ${store.name}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bonplan.ma'}/codes-promo/${store.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: coupons.length,
      itemListElement: coupons.map((c, i) => ({
        '@type': 'Offer',
        position: i + 1,
        name: c.title,
        description: c.title,
        validThrough: c.expiry_date || undefined,
        offeredBy: {
          '@type': 'Organization',
          name: store.name,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorePageClient store={store} coupons={coupons} />
    </>
  );
}
