import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStoreBySlug, getCouponsByStoreId, getAllStores } from '@/lib/supabase';
import { bestDiscountLabel } from '@/lib/discount';
import { absoluteUrl } from '@/lib/site';
import { getEditorial } from '@/lib/storeEditorial';
import { storeStats } from '@/lib/storeContent';
import StorePageClient from './StorePageClient';
import CouponSchema from '@/components/CouponSchema';
import HowToSchema from '@/components/HowToSchema';
import RelatedStores from '@/components/RelatedStores';
import RelatedArticles from '@/components/RelatedArticles';
import RecentVerifications from '@/components/RecentVerifications';

export const revalidate = 60;


interface Props {
  params: { slug: string };
}

/* ── SEO helper: build CTR-optimized title ≤ 60 chars ───────────
   Includes real numbers (offer count, best discount) — proven CTR lever. */
function buildTitle(storeName: string, offerCount: number, codeCount: number, discount: string | null): string {
  const now = new Date();
  const monthNames = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  const base = `Code Promo ${storeName} ${month} ${year}`;

  // Top pick: "Code Promo Temu → 65 codes vérifiés (-50%) | Juillet 2026"
  // — live verified-count + best discount, the strongest CTR combination.
  if (codeCount > 1 && discount) {
    const verified = `Code Promo ${storeName} → ${codeCount} codes vérifiés (-${discount}) | ${month} ${year}`;
    if (verified.length <= 62) return verified;
    const verifiedShort = `Code Promo ${storeName} → ${codeCount} codes vérifiés | ${month} ${year}`;
    if (verifiedShort.length <= 62) return verifiedShort;
  }

  // Rich fallback: "Code Promo Temu Juillet 2026 : 35 offres (-200€)"
  if (discount && offerCount > 1) {
    const rich = `${base} : ${offerCount} offres (-${discount})`;
    if (rich.length <= 60) return rich;
  }
  if (offerCount > 1) {
    const withCount = `${base} : ${offerCount} offres vérifiées`;
    if (withCount.length <= 60) return withCount;
    const short = `${base} : ${offerCount} offres`;
    if (short.length <= 60) return short;
  }
  if (base.length <= 60) return base;

  const withYear = `Code Promo ${storeName} — ${year}`;
  if (withYear.length <= 60) return withYear;

  const minimal = `Code Promo ${storeName}`;
  if (minimal.length <= 60) return minimal;

  const maxName = 60 - 'Code Promo  …'.length;
  return `Code Promo ${storeName.slice(0, maxName)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const coupons = await getCouponsByStoreId(store.id).catch(() => []);
  const discount = bestDiscountLabel(coupons);
  const codeCount = coupons.filter((c) => c.type === 'code').length;

  const now = new Date();
  const month = now.toLocaleString('fr-FR', { month: 'long' });
  const year = now.getFullYear();

  const title = buildTitle(store.name, coupons.length, codeCount, discount);

  // Priority stores: hand-written meta description (CTR rescue — temu was at
  // 0.1% CTR with the generic template); everyone else keeps the generated one.
  const editorial = getEditorial(params.slug);
  const description = editorial
    ? editorial.metaDescription(storeStats(coupons))
    : discount
    ? `✅ ${codeCount > 0 ? `${codeCount} codes promo` : `${coupons.length} offres`} ${store.name} testés et vérifiés en ${month} ${year} · Jusqu'à ${discount} de réduction · Mis à jour aujourd'hui. Copiez votre code et économisez !`
    : `✅ Codes promo ${store.name} vérifiés en ${month} ${year} · Offres testées et mises à jour aujourd'hui. Copiez votre code et économisez sur votre commande !`;

  const canonical = absoluteUrl(`/codes-promo/${params.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    // Thin-content strategy (GSC "Explorée/Détectée, actuellement non indexée"):
    // stores with ZERO active offers are noindexed (and excluded from the
    // sitemap) until offers come back. `follow: true` keeps link equity flowing.
    robots: coupons.length === 0
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
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
      images: ['/opengraph-image'],
    },
  };
}

/** Pre-render every store page at build time; ISR (revalidate above) keeps
 *  them fresh. Unknown slugs still render on-demand, then 404 via notFound. */
export async function generateStaticParams() {
  const stores = await getAllStores();
  return stores
    .filter((s) => s.slug)
    .map((s) => ({ slug: s.slug }));
}

export default async function StorePageSSR({ params }: Props) {
  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();

  const coupons = await getCouponsByStoreId(store.id);

  return (
    <>
      <CouponSchema store={store} coupons={coupons} />
      <HowToSchema store={store} />
      <StorePageClient store={store} coupons={coupons} />
      <RecentVerifications store={store} coupons={coupons} />
      <RelatedArticles storeName={store.name} storeSlug={store.slug} />
      <RelatedStores currentSlug={store.slug} />
    </>
  );
}
