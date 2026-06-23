import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ, { FAQ_SCHEMA_JSON } from '@/components/FAQ';
import { getAllStores, getPublishedPosts } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stores = await getAllStores();
  const posts = await getPublishedPosts();
  const displayStores = stores.slice(0, 12);
  const displayPosts = posts.slice(0, 3);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LockCoupon',
    url: 'https://www.lockcoupon.com',
    description: 'Trouvez les meilleurs codes promo, coupons et réductions vérifiés pour vos boutiques préférées en France.',
    inLanguage: 'fr-FR',
    publisher: {
      '@type': 'Organization',
      name: 'LockCoupon',
      url: 'https://www.lockcoupon.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.lockcoupon.com/og-default.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.lockcoupon.com/boutiques?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* FAQ JSON-LD rendered server-side so Googlebot sees it in initial HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_SCHEMA_JSON }}
      />

      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-16 text-center">
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              Économisez avec les <span className="text-primary">meilleurs codes promo</span>
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto mb-6">
              Codes promo vérifiés &amp; mis à jour chaque jour. 100% gratuit.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-[13px] font-medium">
                🔥 Mis à jour aujourd&apos;hui
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-[13px] font-medium">
                ✅ 98% taux de succès
              </div>
              <Link href="/boutiques" className="bg-primary hover:bg-primary-dark rounded-full px-5 py-2 text-white text-[13px] font-bold transition-colors">
                🏪 {stores.length}+ boutiques →
              </Link>
              <Link href="/guide-achat" className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full px-5 py-2 text-white text-[13px] font-bold transition-colors border border-white/20">
                📖 Guide d&apos;achat
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10" aria-label="Catégories">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">Catégories populaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/codes-promo/categorie/${cat.slug}`} className="bg-white border border-border rounded-xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="text-[28px] mb-1">{cat.emoji}</div>
                <span className="text-text-main text-[12px] md:text-[13px] font-semibold">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stores */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10" aria-label="Boutiques populaires">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold">Boutiques populaires</h2>
            <Link href="/boutiques" className="text-primary text-[14px] font-semibold hover:underline">Voir tout →</Link>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="text-[18px] mb-2">Aucune boutique disponible</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                {displayStores.map((store) => (
                  <Link key={store.id} href={`/codes-promo/${store.slug}`} className="bg-white border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={`Logo ${store.name}`} width={48} height={48} loading="lazy" className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white text-[20px] md:text-[24px] font-bold group-hover:scale-105 transition-transform shadow-sm" style={{ backgroundColor: store.logo_color || '#C0392B' }}>
                        {store.logo_letter || store.name[0]}
                      </div>
                    )}
                    <span className="text-text-main text-[12px] md:text-[14px] font-semibold text-center leading-tight">{store.name}</span>
                  </Link>
                ))}
              </div>
              {stores.length > 12 && (
                <div className="text-center mt-8">
                  <Link href="/boutiques" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                    🏪 Voir les {stores.length} boutiques
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* Blog section */}
        {displayPosts.length > 0 && (
          <section className="bg-bg border-t border-border" aria-label="Derniers articles">
            <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold">📝 Derniers articles</h2>
                <Link href="/blog" className="text-primary text-[14px] font-semibold hover:underline">Voir tout →</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {displayPosts.map((post) => (
                  <article key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group block h-full">
                      {post.cover_image ? (
                        <div className="h-[180px] overflow-hidden">
                          <img src={post.cover_image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="h-[180px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <span className="text-[40px]">📝</span>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="text-[12px] text-muted mb-2">
                          <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </time>
                        </div>
                        <h3 className="text-text-main text-[16px] font-bold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted text-[13px] leading-relaxed line-clamp-2">{post.excerpt}</p>
                        )}
                        <span className="inline-block mt-3 text-primary text-[13px] font-semibold">Lire la suite →</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {posts.length > 3 && (
                <div className="text-center mt-8">
                  <Link href="/blog" className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                    📝 Voir tous les articles
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SEO content block (issue 7 — text-to-HTML ratio) */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              LockCoupon : votre référence codes promo en France
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                LockCoupon est la plateforme française de référence pour trouver des codes promo, coupons de réduction et bons plans vérifiés.
                Notre équipe vérifie chaque offre quotidiennement pour vous garantir des codes qui fonctionnent réellement.
                Avec plus de {stores.length} boutiques partenaires — de la mode à la tech, en passant par la maison, le sport et les voyages —
                vous trouverez toujours une réduction adaptée à vos achats.
              </p>
              <p>
                Comment ça marche ? Recherchez votre boutique préférée, choisissez un code promo vérifié, copiez-le en un clic et
                appliquez-le lors de votre paiement. C&apos;est 100% gratuit, sans inscription obligatoire. Nous mettons à jour nos offres
                chaque jour pour inclure les dernières promotions, ventes flash et réductions exclusives disponibles en France.
              </p>
              <p>
                Que vous cherchiez un code promo Amazon, une réduction Fnac, un bon plan Nike ou des offres Booking,
                LockCoupon centralise les meilleures affaires pour vous faire économiser sur chaque achat en ligne.
                Consultez également notre <Link href="/blog" className="text-primary hover:underline">blog</Link> pour des guides d&apos;achat détaillés
                et nos <Link href="/guide-achat" className="text-primary hover:underline">conseils pour économiser</Link> toute l&apos;année.
                Découvrez aussi notre <Link href="/top-codes-promo" className="text-primary hover:underline">top 20 des codes promo</Link> les plus populaires.
              </p>
            </div>
          </div>
        </section>

        {/* AI-optimized answer blocks for GEO/AEO */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto space-y-8">
            <div>
              <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
                Pourquoi choisir LockCoupon pour vos codes promo ?
              </h2>
              <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-3">
                <p>
                  <strong>Vérification quotidienne :</strong> Contrairement à d&apos;autres sites, chaque code promo sur LockCoupon est vérifié manuellement et automatiquement chaque jour. Notre taux de succès de 98% est le résultat de ce processus rigoureux.
                </p>
                <p>
                  <strong>{stores.length}+ boutiques couvertes :</strong> De la mode (Shein, Zara, H&amp;M) à la tech (Fnac, Samsung), du sport (Nike, Adidas) à la beauté (Sephora, Yves Rocher), en passant par le voyage (Booking, Airbnb) — nous couvrons les boutiques que les Français utilisent vraiment.
                </p>
                <p>
                  <strong>100% gratuit :</strong> Pas d&apos;inscription obligatoire, pas de frais cachés. Copiez un code en un clic et utilisez-le immédiatement.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
                Comment économiser en ligne en France en 2026 ?
              </h2>
              <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-3">
                <p>
                  Pour économiser sur vos achats en ligne, commencez par chercher un code promo avant de finaliser votre commande.
                  Sur LockCoupon, tapez le nom de la boutique pour trouver les codes vérifiés disponibles.
                  Profitez également des périodes de soldes (janvier, juin), du Black Friday, et des French Days pour maximiser vos économies.
                  Inscrivez-vous aux newsletters des boutiques pour recevoir des offres exclusives.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
    </>
  );
}
