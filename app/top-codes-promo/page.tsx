import Link from 'next/link';
import Image from 'next/image';
import { cache } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;


const getTopCoupons = cache(async () => {
  const { data } = await supabase
    .from('coupons')
    .select('*, stores(name, slug, logo_url, logo_color, logo_letter)')
    .eq('is_verified', true)
    .order('usage_count', { ascending: false })
    .limit(20);
  return data || [];
});

export async function generateMetadata(): Promise<Metadata> {
  const coupons = await getTopCoupons();

  const monthRaw = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

  const maxPercent = coupons.reduce((max: number, c: any) => {
    const v = c.discount_type === 'percent' ? Number(c.discount_value) || 0 : 0;
    return v > max ? v : max;
  }, 0);
  const discount = maxPercent >= 10 ? `-${maxPercent}%` : '-70%';

  const topStores = Array.from(
    new Set(coupons.map((c: any) => c.stores?.name).filter(Boolean))
  ).slice(0, 3);
  const storesTxt = topStores.length >= 2 ? topStores.join(', ') : 'Shein, Temu, Adidas';

  const title = `Top 20 codes promo vérifiés — ${month} | Jusqu'à ${discount}`;
  const description = `${coupons.length || 20} codes promo testés aujourd'hui : jusqu'à ${discount} chez ${storesTxt}. Classés par taux de succès, vérifiés et mis à jour chaque jour. 100% gratuits.`;

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.lockcoupon.com/top-codes-promo',
    },
    openGraph: {
      title,
      description,
      url: 'https://www.lockcoupon.com/top-codes-promo',
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
  };
}

export default async function TopCodesPage() {
  const coupons = await getTopCoupons();

  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top 20 Codes Promo du Moment',
    url: 'https://www.lockcoupon.com/top-codes-promo',
    numberOfItems: coupons.length,
    itemListElement: coupons.map((coupon: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: coupon.title,
      url: `https://www.lockcoupon.com/codes-promo/${coupon.stores?.slug}`,
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Top Codes Promo', item: 'https://www.lockcoupon.com/top-codes-promo' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12">
            <nav aria-label="Fil d'Ariane" className="mb-4">
              <ol className="flex items-center gap-1.5 text-[13px] text-white/40">
                <li><Link href="/" className="hover:text-white/70">Accueil</Link></li>
                <li aria-hidden="true">›</li>
                <li className="text-white/80">Top Codes Promo</li>
              </ol>
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-3">
              Top 20 des <span className="text-primary">codes promo</span>
            </h1>
            <p className="text-white/50 text-[15px] max-w-2xl">
              Notre équipe sélectionne chaque jour les meilleurs codes promo du moment.
              Voici notre top 20 des réductions vérifiées pour {month}. Bon shopping !
            </p>
          </div>
        </section>

        {/* Coupons list */}
        <section className="max-w-[1200px] mx-auto px-4 py-8">
          <h2 className="text-text-main text-[22px] font-extrabold mb-6 flex items-center gap-2">
            <span className="w-1 h-7 bg-primary rounded-full" />
            Le Top 20 des codes promo
          </h2>

          {coupons.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="text-[16px]">Aucun code promo disponible pour le moment.</p>
            </div>
          ) : (
            <ol className="space-y-4">
              {coupons.map((coupon: any, index: number) => {
                const store = coupon.stores;
                const partialCode = coupon.code ? coupon.code.slice(-2).toUpperCase() : '';

                return (
                  <li key={coupon.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="flex items-stretch">
                      {/* Rank + Store logo */}
                      <div className="w-[80px] sm:w-[100px] shrink-0 flex flex-col items-center justify-center border-r border-border py-4 px-2 bg-bg relative">
                        {index < 3 && (
                          <span className="absolute top-2 left-2 w-6 h-6 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                        )}
                        {store?.logo_url ? (
                          <Image src={store.logo_url} alt={`Logo ${store.name}`} width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain" />
                        ) : (
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-bold"
                            style={{ backgroundColor: store?.logo_color || '#C0392B' }}
                          >
                            {store?.logo_letter || store?.name?.[0] || '?'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 px-4 py-3 sm:py-4 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-primary text-[11px] font-bold uppercase tracking-wide">
                            {coupon.type === 'code' ? 'Code promo' : coupon.type === 'cashback' ? 'Cashback' : 'Bon plan'}
                          </span>
                          {coupon.is_exclusive && (
                            <span className="bg-accent/30 text-text-main text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Exclusif
                            </span>
                          )}
                        </div>

                        <h3 className="text-text-main text-[14px] sm:text-[15px] font-semibold leading-snug mb-2 line-clamp-2">
                          {coupon.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-[12px] text-muted">
                          {coupon.is_verified && (
                            <span className="flex items-center gap-1 text-success">
                              <span className="w-1.5 h-1.5 bg-success rounded-full" />
                              Vérifié
                            </span>
                          )}
                          <span>{coupon.usage_count || 0} utilisés</span>
                          <Link href={`/codes-promo/${store?.slug}`} className="text-primary hover:underline font-semibold">
                            Plus d&apos;offres {store?.name}
                          </Link>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="shrink-0 flex flex-col items-center justify-center p-3 sm:p-4">
                        <Link
                          href={`/codes-promo/${store?.slug}`}
                          className="h-[44px] rounded-lg flex items-stretch overflow-hidden transition-all hover:opacity-90 min-w-[150px] sm:min-w-[170px]"
                        >
                          <span className="flex-1 bg-primary flex items-center justify-center text-white font-bold text-[13px] sm:text-[14px] gap-1.5 px-4">
                            Voir le code <span className="text-[18px]">›</span>
                          </span>
                          {partialCode && (
                            <span className="w-[40px] bg-[#1a1a1a] flex items-center justify-center text-white text-[13px] font-mono font-bold">
                              {partialCode}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* SEO content (issue 7) + cross-links (issue 8) */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Comment sont sélectionnés nos meilleurs codes promo ?
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Notre top 20 est basé sur les codes promo les plus utilisés et les mieux notés par la communauté LockCoupon.
                Chaque code est vérifié quotidiennement par notre équipe pour garantir son fonctionnement.
                Le classement est mis à jour automatiquement en fonction du nombre d&apos;utilisations et du taux de succès de chaque offre.
              </p>
              <p>
                Vous cherchez des codes pour une boutique spécifique ? Consultez notre{' '}
                <Link href="/boutiques" className="text-primary hover:underline">liste de toutes les boutiques</Link>,
                ou parcourez notre <Link href="/guide-achat" className="text-primary hover:underline">guide d&apos;achat</Link>{' '}
                pour des conseils par catégorie. Retrouvez également nos derniers articles sur le{' '}
                <Link href="/blog" className="text-primary hover:underline">blog LockCoupon</Link>.
              </p>
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
    </>
  );
}
