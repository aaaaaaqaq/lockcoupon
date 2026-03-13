import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreBySlug, getCouponsByStoreId, getAllStores } from '@/lib/supabase';
import StorePageClient from './StorePageClient';
import CouponSchema from '@/components/CouponSchema';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const title = `Code promo ${store.name} — ${month} | LockCoupon`;
  const description = `${store.name} : trouvez les meilleurs codes promo vérifiés. Réductions exclusives et bons plans mis à jour quotidiennement sur LockCoupon.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/codes-promo/${params.slug}`,
      siteName: 'LockCoupon',
      locale: 'fr_FR',
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

  return (
    <>
      <CouponSchema store={store} coupons={coupons} />
      <StorePageClient store={store} coupons={coupons} />
    </>
  );
}
