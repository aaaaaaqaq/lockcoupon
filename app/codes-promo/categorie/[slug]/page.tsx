import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllStores, getCouponsByStoreId, Store, Coupon } from '@/lib/supabase';
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories';


export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return {};
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  return {
    title: `${cat.title} — ${month}`,
    description: cat.description,
    alternates: { canonical: `/codes-promo/categorie/${params.slug}` },
    openGraph: {
      title: cat.title,
      description: cat.description,
      url: `/codes-promo/categorie/${params.slug}`,
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
    },
  };
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const allStores = await getAllStores();
  const categoryStores = allStores.filter((s) => cat.storeSlugs.includes(s.slug));

  // Fetch coupon counts for each store
  const storesWithCounts: { store: Store; couponCount: number; bestDiscount: string }[] = [];
  for (const store of categoryStores) {
    const coupons = await getCouponsByStoreId(store.id);
    const best = coupons.reduce((max, c) => {
      const val = c.discount_value ? parseInt(c.discount_value) : 0;
      return val > max ? val : max;
    }, 0);
    storesWithCounts.push({
      store,
      couponCount: coupons.length,
      bestDiscount: best > 0 ? `${best}%` : '',
    });
  }

  storesWithCounts.sort((a, b) => b.couponCount - a.couponCount);

  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const totalCodes = storesWithCounts.reduce((s, sc) => s + sc.couponCount, 0);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Catégories', item: 'https://www.lockcoupon.com/boutiques' },
      { '@type': 'ListItem', position: 3, name: cat.name, item: `https://www.lockcoupon.com/codes-promo/categorie/${cat.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main>
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-14 text-center">
            <nav className="text-white/40 text-[13px] mb-4">
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/boutiques" className="hover:text-white/60">Boutiques</Link> → {cat.name}
            </nav>
            <div className="text-[48px] mb-3">{cat.emoji}</div>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              Codes promo <span className="text-primary">{cat.name}</span> — {month}
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto mb-6">
              {totalCodes} codes promo vérifiés dans {storesWithCounts.length} boutiques {cat.name.toLowerCase()}.
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
            {storesWithCounts.length} boutiques {cat.name.toLowerCase()} avec codes promo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {storesWithCounts.map(({ store, couponCount, bestDiscount }) => (
              <Link
                key={store.id}
                href={`/codes-promo/${store.slug}`}
                className="bg-white border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center gap-4"
              >
                {store.logo_url ? (
                  <img src={store.logo_url} alt={`Logo ${store.name}`} className="w-14 h-14 rounded-xl object-contain shrink-0" loading="lazy" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[24px] font-bold shrink-0"
                    style={{ backgroundColor: store.logo_color || '#C0392B' }}
                  >
                    {store.logo_letter || store.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-main text-[16px] font-bold group-hover:text-primary transition-colors">{store.name}</h3>
                  <p className="text-muted text-[13px]">
                    {couponCount} codes promo
                    {bestDiscount && <span className="text-primary font-semibold ml-1">jusqu&apos;à {bestDiscount}</span>}
                  </p>
                </div>
                <span className="text-primary text-[18px] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ))}
          </div>

          {storesWithCounts.length === 0 && (
            <p className="text-center text-muted py-12">Aucune boutique trouvée dans cette catégorie.</p>
          )}
        </section>

        {/* Category navigation */}
        <section className="bg-bg border-t border-border">
          <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">
              Toutes les catégories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/codes-promo/categorie/${c.slug}`}
                  className={`bg-white border rounded-xl p-4 text-center hover:shadow-md transition-all ${c.slug === cat.slug ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="text-[28px] mb-2">{c.emoji}</div>
                  <span className="text-text-main text-[14px] font-semibold">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO content */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Comment économiser sur vos achats {cat.name.toLowerCase()}
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                LockCoupon réunit les meilleurs codes promo {cat.name.toLowerCase()} en France. Notre équipe vérifie chaque offre quotidiennement pour vous garantir des réductions qui fonctionnent réellement. Que vous cherchiez une promotion sur{' '}
                {storesWithCounts.slice(0, 3).map((sc, i) => (
                  <span key={sc.store.id}>
                    {i > 0 && (i === storesWithCounts.slice(0, 3).length - 1 ? ' ou ' : ', ')}
                    <Link href={`/codes-promo/${sc.store.slug}`} className="text-primary hover:underline">{sc.store.name}</Link>
                  </span>
                ))}, vous trouverez des offres vérifiées et mises à jour chaque jour.
              </p>
              <p>
                Pour profiter d&apos;un code promo, il vous suffit de choisir une boutique ci-dessus, copier le code en un clic et l&apos;appliquer lors de votre paiement. Consultez aussi notre{' '}
                <Link href="/guide-achat" className="text-primary hover:underline">guide d&apos;achat</Link> et notre{' '}
                <Link href="/top-codes-promo" className="text-primary hover:underline">top codes promo</Link> pour encore plus d&apos;économies.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
