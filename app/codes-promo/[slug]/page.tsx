import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreBySlug, getCouponsByStoreId, getAllStores } from '@/lib/supabase';
import StorePageClient from './StorePageClient';
import CouponSchema from '@/components/CouponSchema';
import RelatedStores from '@/components/RelatedStores';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const now = new Date();
  const month = now.toLocaleString('fr-FR', { month: 'long' });
  const year = now.getFullYear();
  // Keep title under 60 chars. Fallback to shorter format for long store names.
  const baseTitle = `Code Promo ${store.name} ${year}`;
  const titleWithMonth = `Code Promo ${store.name} ${month} ${year}`;
  const title = titleWithMonth.length <= 60 ? titleWithMonth : baseTitle;
  const description = `Codes promo ${store.name} vérifiés en ${month} ${year}. Réductions exclusives et bons plans mis à jour chaque jour sur LockCoupon.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/codes-promo/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/codes-promo/${params.slug}`,
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: `Code promo ${store.name} — LockCoupon`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
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

  return (
    <>
      <CouponSchema store={store} coupons={coupons} />
      <StorePageClient store={store} coupons={coupons} />
      <RelatedStores currentSlug={store.slug} />
    </>
  );
}
