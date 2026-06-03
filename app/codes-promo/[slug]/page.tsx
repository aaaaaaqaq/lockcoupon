import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreBySlug, getCouponsByStoreId, getAllStores } from '@/lib/supabase';
import StorePageClient from './StorePageClient';
import CouponSchema from '@/components/CouponSchema';
import RelatedStores from '@/components/RelatedStores';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

/* ── SEO helper: build title ≤ 60 chars ─────────────── */
function buildTitle(storeName: string): string {
  const now = new Date();
  const monthNames = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  // Try: "Code Promo StoreName — Mai 2026" (ideal)
  const full = `Code Promo ${storeName} — ${month} ${year}`;
  if (full.length <= 60) return full;

  // Fallback: "Code Promo StoreName — 2026"
  const withYear = `Code Promo ${storeName} — ${year}`;
  if (withYear.length <= 60) return withYear;

  // Ultra-long store names: "Code Promo StoreName"
  const minimal = `Code Promo ${storeName}`;
  if (minimal.length <= 60) return minimal;

  // Truncate store name as last resort
  const maxName = 60 - 'Code Promo  …'.length;
  return `Code Promo ${storeName.slice(0, maxName)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const now = new Date();
  const month = now.toLocaleString('fr-FR', { month: 'long' });
  const year = now.getFullYear();

  const title = buildTitle(store.name);
  const description = `${store.name} : codes promo vérifiés en ${month} ${year}. Économisez avec des réductions exclusives mises à jour chaque jour.`;

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
          alt: `Code promo ${store.name}`,
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

// No generateStaticParams — pages render on-demand with ISR

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
