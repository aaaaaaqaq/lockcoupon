import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStoreBySlug, getCouponsByStoreId, getAllStores } from '@/lib/supabase';
import { absoluteUrl } from '@/lib/site';
import { getEditorial } from '@/lib/storeEditorial';
import { storeStats, type StoreStats } from '@/lib/storeContent';
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

/* ── SEO helper: build CTR-optimized title ───────────
   Includes real numbers (offer count, best discount) — proven CTR lever.
   BUDGET: the root layout appends " | LockCoupon" (+13 chars) via the title
   template, and Bing Webmaster flags rendered titles > 65 chars ("Title too
   long", Aug 2026). So the RAW title here must stay ≤ 52 chars. */
const TITLE_BUDGET = 65 - ' | LockCoupon'.length; // = 52

function buildTitle(storeName: string, stats: StoreStats): string {
  const now = new Date();
  const monthNames = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const { offerCount, maxDiscount } = stats;

  // Ladder: drop the least valuable segment first (discount → "vérifiées" →
  // count → month). Keyword "Code Promo {store}" + freshness date win.
  // All numbers still come from storeStats(): same source as H1/meta/body.
  const candidates: string[] = [];
  if (offerCount > 1 && maxDiscount) {
    candidates.push(`Code Promo ${storeName} → ${offerCount} offres vérifiées (jusqu'à ${maxDiscount}) | ${month} ${year}`);
    candidates.push(`Code Promo ${storeName} → ${offerCount} offres (${maxDiscount}) | ${month} ${year}`);
  }
  if (offerCount > 1) {
    candidates.push(`Code Promo ${storeName} → ${offerCount} offres vérifiées | ${month} ${year}`);
    candidates.push(`Code Promo ${storeName} → ${offerCount} offres | ${month} ${year}`);
  }
  candidates.push(`Code Promo ${storeName} ${month} ${year}`);
  candidates.push(`Code Promo ${storeName} ${year}`);
  candidates.push(`Code Promo ${storeName}`);

  for (const c of candidates) {
    if (c.length <= TITLE_BUDGET) return c;
  }
  const maxName = TITLE_BUDGET - 'Code Promo …'.length;
  return `Code Promo ${storeName.slice(0, maxName)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return {};

  const coupons = await getCouponsByStoreId(store.id).catch(() => []);
  // Single source of truth for every number on this page (Fix: title said 2,
  // header said 18, verification log said 3 — all blocks now read storeStats).
  const stats = storeStats(coupons);

  const now = new Date();
  const month = now.toLocaleString('fr-FR', { month: 'long' });
  const year = now.getFullYear();

  const title = buildTitle(store.name, stats);

  // Priority stores: hand-written meta description (CTR rescue — temu was at
  // 0.1% CTR with the generic template); everyone else keeps the generated one.
  const editorial = getEditorial(params.slug);
  const description = editorial
    ? editorial.metaDescription(stats)
    : stats.maxDiscount
    ? `✅ ${stats.offerCount} offre${stats.offerCount > 1 ? 's' : ''} ${store.name} testée${stats.offerCount > 1 ? 's' : ''} et vérifiée${stats.offerCount > 1 ? 's' : ''} en ${month} ${year}${stats.codeCount > 0 ? ` dont ${stats.codeCount} code${stats.codeCount > 1 ? 's' : ''} promo` : ''} · Jusqu'à ${stats.maxDiscount} de réduction · Mis à jour aujourd'hui.`
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
    // Per-page robots REPLACES the root-layout robots object (shallow merge),
    // so the Discover/image directives must be repeated here or they are lost.
    robots: coupons.length === 0
      ? { index: false, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' as const, 'max-video-preview': -1 }
      : { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' as const, 'max-video-preview': -1 },
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
  // Editorial how-to steps (Amazon…) feed BOTH the visible section
  // (StorePageClient) and the HowTo JSON-LD — schema always matches the page.
  const editorialSteps = getEditorial(store.slug)?.howToSteps?.(storeStats(coupons));

  return (
    <>
      <CouponSchema store={store} coupons={coupons} />
      <HowToSchema store={store} steps={editorialSteps} />
      <StorePageClient store={store} coupons={coupons} />
      <RecentVerifications store={store} coupons={coupons} />
      <RelatedArticles storeName={store.name} storeSlug={store.slug} />
      <RelatedStores currentSlug={store.slug} />
    </>
  );
}
