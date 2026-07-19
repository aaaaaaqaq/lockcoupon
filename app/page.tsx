import type { Metadata } from 'next';
import Link from 'next/link';
import type React from 'react';
import { SITE_URL } from '@/lib/site';
import Navbar from '@/components/Navbar';
import HeroSearch from '@/components/HeroSearch';
import Footer from '@/components/Footer';
import FAQ, { FAQ_SCHEMA_JSON } from '@/components/FAQ';
import { getAllStores, getPostsLight } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import CategoryIcon, { CATEGORY_THEMES } from '@/components/CategoryIcon';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'x-default': SITE_URL,
    },
  },
};

const POPULAR_SLUGS = ['shein', 'temu', 'amazon', 'aliexpress', 'fnac'];

export default async function HomePage() {
  const [stores, posts] = await Promise.all([getAllStores(), getPostsLight()]);
  const displayStores = stores.slice(0, 12);
  const displayPosts = posts.slice(0, 3);
  const popularStores = POPULAR_SLUGS
    .map((slug) => stores.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.lockcoupon.com/#website',
    name: 'LockCoupon',
    url: 'https://www.lockcoupon.com',
    description: 'Trouvez les meilleurs codes promo, coupons et réductions vérifiés pour vos boutiques préférées en France.',
    inLanguage: 'fr-FR',
    publisher: {
      '@id': 'https://www.lockcoupon.com/#organization',
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
        <section className="hero-dark relative overflow-hidden">
          <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-14 lg:py-16 flex items-center gap-8">
            {/* Left — content */}
            <div className="flex-1 max-w-[660px] text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-4 py-1.5 text-white/75 text-[12.5px] font-medium mb-5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" aria-hidden>
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                Les meilleurs bons plans, chaque jour
              </div>

              <h1 className="text-white text-[30px] sm:text-[38px] md:text-[46px] font-extrabold leading-[1.12] mb-4">
                Économisez avec les meilleurs{' '}
                <span className="relative inline-block text-primary">
                  codes promo
                  <svg className="absolute left-0 -bottom-1.5 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 6C60 2 140 2 198 5" stroke="#e2503c" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-white/55 text-[15px] md:text-[16px] mb-7">
                Codes promo vérifiés &amp; mis à jour chaque jour. 100% gratuit.
              </p>

              <div className="flex justify-center lg:justify-start mb-5">
                <HeroSearch />
              </div>

              {popularStores.length > 0 && (
                <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap mb-8">
                  <span className="text-white/45 text-[13px] font-medium mr-1">Populaires&nbsp;:</span>
                  {popularStores.map((store) => (
                    <Link
                      key={store.slug}
                      href={`/codes-promo/${store.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 rounded-full pl-1.5 pr-3.5 py-1.5 text-white/85 text-[13px] font-semibold transition-colors"
                    >
                      {store.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={store.logo_url} alt="" className="w-5 h-5 rounded-full object-contain bg-white" loading="lazy" />
                      ) : (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: store.logo_color || '#C0392B' }}>
                          {store.logo_letter || store.name[0]}
                        </span>
                      )}
                      {store.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 whitespace-nowrap bg-white/[0.07] border border-white/10 backdrop-blur-sm rounded-full px-2.5 py-2 text-white/80 text-[12px] font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" aria-hidden>
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                  Mis à jour aujourd&apos;hui
                </div>
                <div className="inline-flex items-center gap-1.5 whitespace-nowrap bg-white/[0.07] border border-white/10 backdrop-blur-sm rounded-full px-2.5 py-2 text-white/80 text-[12px] font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                  98% taux de succès
                </div>
                <Link href="/boutiques" className="inline-flex items-center gap-1.5 whitespace-nowrap bg-primary hover:bg-primary-dark rounded-full px-2.5 py-2 text-white text-[12px] font-bold transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                    <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
                  </svg>
                  {stores.length}+ boutiques →
                </Link>
                <Link href="/guide-achat" className="inline-flex items-center gap-1.5 whitespace-nowrap bg-white/[0.12] hover:bg-white/[0.22] backdrop-blur-sm rounded-full px-2.5 py-2 text-white text-[12px] font-bold transition-colors border border-white/15">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  </svg>
                  Guide d&apos;achat
                </Link>
              </div>
            </div>

            {/* Right — decorative coupon composition (desktop only) */}
            <div className="hero-art relative hidden lg:block w-[370px] h-[350px] shrink-0" aria-hidden>
              {/* glow */}
              <div className="absolute inset-0 rounded-full bg-primary/25 blur-[90px]" />
              {/* podium */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] h-[54px] rounded-[50%] bg-black/60 shadow-[0_0_60px_10px_rgba(192,57,43,0.35)]" />
              {/* shopping bag */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[52px] w-[170px] h-[190px]">
                <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 w-[92px] h-[80px] rounded-t-full border-[10px] border-b-0 border-[#8e2418]" />
                <div className="relative w-full h-full rounded-b-[28px] rounded-t-[10px] bg-gradient-to-b from-[#ef6552] via-[#c0392b] to-[#8e2418] shadow-[inset_0_6px_14px_rgba(255,255,255,0.35),0_18px_40px_-12px_rgba(0,0,0,0.7)] flex items-center justify-center">
                  <span className="text-white text-[84px] font-extrabold leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">%</span>
                </div>
              </div>
              {/* ticket -50% */}
              <div className="absolute top-1 right-2 w-[150px] rotate-[14deg] rounded-2xl bg-gradient-to-br from-[#ff5f49] to-[#a72c1e] border border-white/25 shadow-[0_16px_36px_-10px_rgba(192,57,43,0.7)] px-4 py-4 text-center">
                <div className="text-white text-[34px] font-extrabold leading-none">-50%</div>
                <div className="mt-1.5 text-white/70 text-[10px] font-bold tracking-[0.18em] border-t border-dashed border-white/35 pt-1.5">CODE PROMO</div>
              </div>
              {/* ticket -30% */}
              <div className="absolute top-[118px] left-0 w-[120px] -rotate-[13deg] rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6d28d9] border border-white/25 shadow-[0_14px_30px_-10px_rgba(124,58,237,0.7)] px-3 py-3 text-center">
                <div className="text-white text-[26px] font-extrabold leading-none">-30%</div>
                <div className="mt-1 text-white/70 text-[9px] font-bold tracking-[0.18em] border-t border-dashed border-white/35 pt-1">CODE PROMO</div>
              </div>
              {/* ticket -20% */}
              <div className="absolute top-[168px] right-0 w-[112px] rotate-[9deg] rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#d97706] border border-white/25 shadow-[0_14px_30px_-10px_rgba(217,119,6,0.6)] px-3 py-3 text-center">
                <div className="text-white text-[24px] font-extrabold leading-none">-20%</div>
                <div className="mt-1 text-white/75 text-[9px] font-bold tracking-[0.18em] border-t border-dashed border-white/40 pt-1">CODE PROMO</div>
              </div>
              {/* sparkles */}
              <div className="absolute top-[54px] left-[92px] w-2 h-2 rotate-45 bg-amber-400/90 rounded-[2px]" />
              <div className="absolute top-[210px] right-[128px] w-1.5 h-1.5 rotate-12 bg-amber-300/80 rounded-[2px]" />
              <div className="absolute top-[24px] right-[168px] w-1.5 h-1.5 rotate-45 bg-white/70 rounded-full" />
              <div className="absolute bottom-[76px] left-[30px] w-2 h-2 rotate-12 bg-primary/80 rounded-[2px]" />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10" aria-label="Catégories">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-6">Catégories populaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => {
              const theme = CATEGORY_THEMES[cat.slug] || { from: '#C0392B', to: '#96281B' };
              return (
                <Link
                  key={cat.slug}
                  href={`/codes-promo/categorie/${cat.slug}`}
                  className="cat-card group bg-white border border-border rounded-2xl px-2 py-5 text-center flex flex-col items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  style={{
                    '--cat-border': `${theme.to}4D`,
                    '--cat-glow': `${theme.to}1F`,
                    '--cat-tint': `${theme.to}1C`,
                  } as React.CSSProperties}
                >
                  <div className="cat-tile flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-200 group-hover:scale-105">
                    <CategoryIcon slug={cat.slug} size={26} />
                  </div>
                  <span className="mt-3 min-h-[33px] flex items-start justify-center text-text-main text-[12px] md:text-[13px] font-semibold leading-tight px-1">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
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
                  <Link href="/boutiques" className="blog-cta group inline-flex items-center gap-2.5 text-white font-bold text-[15px] px-8 py-3.5 rounded-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="relative z-10">
                      <path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7" />
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                      <path d="M2 7h20v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2Z" />
                    </svg>
                    <span className="relative z-10">Voir les {stores.length} boutiques</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="relative z-10 transition-transform duration-200 group-hover:translate-x-1">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
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
                  <Link href="/blog" className="blog-cta group inline-flex items-center gap-2.5 text-white font-bold text-[15px] px-8 py-3.5 rounded-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="relative z-10">
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                      <path d="M18 14h-8" />
                      <path d="M15 18h-5" />
                      <path d="M10 6h8v4h-8V6Z" />
                    </svg>
                    <span className="relative z-10">Voir tous les articles</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="relative z-10 transition-transform duration-200 group-hover:translate-x-1">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* About section — genuine, people-first content */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              LockCoupon : votre référence codes promo en France
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                LockCoupon est né d&apos;un constat simple : la plupart des sites de codes promo affichent des offres expirées ou inventées.
                Notre approche est différente. Chaque code est vérifié — manuellement et automatiquement — plusieurs fois par jour.
                Quand un code ne fonctionne plus, il est retiré. Résultat : un taux de succès de 98% sur {stores.length}+ boutiques.
              </p>
              <p>
                Pas d&apos;inscription, pas de frais cachés. Vous trouvez votre boutique, vous copiez le code en un clic,
                vous le collez au paiement. La réduction s&apos;applique instantanément. Nos offres couvrent la mode, la tech,
                le sport, la beauté, les voyages et bien plus.
              </p>
              <p>
                Consultez notre <Link href="/blog" className="text-primary hover:underline">blog</Link> pour des guides d&apos;achat détaillés,
                nos <Link href="/guide-achat" className="text-primary hover:underline">conseils pour économiser</Link> toute l&apos;année,
                ou découvrez le <Link href="/top-codes-promo" className="text-primary hover:underline">top 20 des codes promo</Link> les plus utilisés ce mois-ci.
                Boutique star du moment : retrouvez notre sélection de <Link href="/codes-promo/temu" className="text-primary hover:underline">codes promo Temu</Link> vérifiés,
                avec des offres <Link href="/codes-promo/temu/nouveau-client" className="text-primary hover:underline">nouveau client</Link> et de <Link href="/codes-promo/temu/parrainage" className="text-primary hover:underline">parrainage Temu</Link> mises à jour chaque jour.
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
