import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllStores } from '@/lib/supabase';

export const revalidate = 60;

// Own OG metadata (this page used to inherit the HOMEPAGE og:title/og:url
// from the root layout) + live store count instead of a hardcoded "98+".
export async function generateMetadata(): Promise<Metadata> {
  const stores = await getAllStores();
  const title = 'Toutes les Boutiques avec Codes Promo';
  const description = `${stores.length} boutiques avec codes promo vérifiés : mode, tech, sport, beauté, voyage. Codes testés chaque jour. Trouvez votre boutique.`;
  const canonical = 'https://www.lockcoupon.com/boutiques';
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BoutiquesPage() {
  const stores = await getAllStores();

  // Group stores by first letter
  const grouped: Record<string, typeof stores> = {};
  stores.forEach((store) => {
    const letter = store.name[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(store);
  });
  const sortedLetters = Object.keys(grouped).sort();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Boutiques', item: 'https://www.lockcoupon.com/boutiques' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <main>
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12 text-center">
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-3">
              Toutes nos <span className="text-primary">boutiques</span>
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px]">
              {stores.length} boutiques avec codes promo vérifiés
            </p>
          </div>
        </section>

        {/* Breadcrumb nav */}
        <nav aria-label="Fil d'Ariane" className="max-w-[1200px] mx-auto px-4 pt-4">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">Boutiques</li>
          </ol>
        </nav>

        {/* Letter navigation */}
        <nav aria-label="Navigation alphabétique" className="bg-white border-b border-border sticky top-[64px] z-40">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
              {sortedLetters.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold text-muted hover:bg-primary hover:text-white transition-colors shrink-0"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <section className="max-w-[1200px] mx-auto px-4 py-6">
          {sortedLetters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="mb-8">
              <h2 className="text-primary text-[24px] font-extrabold mb-4 border-b border-border pb-2">{letter}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {grouped[letter].map((store) => (
                  <Link
                    key={store.id}
                    href={`/codes-promo/${store.slug}`}
                    className="bg-white border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                  >
                    {store.logo_url ? (
                      <Image
                        src={store.logo_url}
                        alt={`Logo ${store.name}`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-xl object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[20px] font-bold group-hover:scale-105 transition-transform shadow-sm"
                        style={{ backgroundColor: store.logo_color || '#C0392B' }}
                      >
                        {store.logo_letter || store.name[0]}
                      </div>
                    )}
                    <span className="text-text-main text-[12px] font-semibold text-center leading-tight">
                      {store.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* SEO text content to improve text-to-HTML ratio (issue 7) */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Toutes les boutiques avec codes promo vérifiés
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                LockCoupon référence plus de {stores.length} boutiques en ligne avec des codes promo vérifiés quotidiennement.
                De la mode à la tech, en passant par le sport, la beauté et les voyages, trouvez des réductions pour toutes vos enseignes préférées.
                Chaque code est testé par notre équipe pour garantir son fonctionnement.
              </p>
              <p>
                Utilisez la navigation alphabétique ci-dessus pour trouver rapidement votre boutique, ou consultez notre{' '}
                <Link href="/top-codes-promo" className="text-primary hover:underline">Top 20 des meilleurs codes promo</Link>{' '}
                pour découvrir les offres les plus populaires du moment. Vous pouvez également parcourir notre{' '}
                <Link href="/guide-achat" className="text-primary hover:underline">guide d&apos;achat par catégorie</Link>{' '}
                pour des conseils personnalisés.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-links for SEO (issue 8) */}
        <nav aria-label="Pages utiles" className="max-w-[1200px] mx-auto px-4 pb-8">
          <div className="flex flex-wrap gap-3 text-[13px]">
            <Link href="/top-codes-promo" className="text-primary hover:underline font-semibold">→ Top codes promo</Link>
            <Link href="/guide-achat" className="text-primary hover:underline font-semibold">→ Guide d&apos;achat</Link>
            <Link href="/blog" className="text-primary hover:underline font-semibold">→ Blog & astuces</Link>
            <Link href="/ajouter-code" className="text-primary hover:underline font-semibold">→ Ajouter un code</Link>
          </div>
        </nav>
      </main>

      <Footer />
    </>
  );
}
