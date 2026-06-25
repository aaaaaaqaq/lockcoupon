import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPublishedPosts } from '@/lib/supabase';

export const revalidate = 60;


export const metadata: Metadata = {
  title: 'Blog — Astuces & Bons Plans',
  description: 'Découvrez nos articles sur les meilleures astuces pour économiser en ligne, les codes promo du moment et les guides d\'achat détaillés.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.lockcoupon.com/blog' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <main>
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-14 text-center">
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-3">
              Le Blog <span className="text-primary">LockCoupon</span>
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Astuces, guides et bons plans pour économiser sur vos achats en ligne.
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="max-w-[1200px] mx-auto px-4 pt-4">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">Blog</li>
          </ol>
        </nav>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="text-[18px] mb-2">Aucun article publié pour le moment</p>
              <p className="text-[14px]">Revenez bientôt !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group block h-full"
                  >
                    {post.cover_image ? (
                      <div className="h-[200px] overflow-hidden">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          width={600}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-[200px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <span className="text-[48px]">📝</span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-[12px] text-muted mb-2">
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </time>
                        <span>·</span>
                        <span>{post.author}</span>
                      </div>
                      <h2 className="text-text-main text-[17px] font-bold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted text-[13px] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="inline-block mt-3 text-primary text-[13px] font-semibold">
                        Lire la suite →
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SEO text + cross-links (issue 7, 8) */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Conseils et astuces pour économiser
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Le blog LockCoupon vous propose des guides détaillés pour tirer le meilleur parti de vos achats en ligne.
                Nos articles couvrent les stratégies d&apos;économie, les meilleurs moments pour acheter, et des conseils par catégorie
                (mode, tech, sport, beauté, voyage). Nous publions régulièrement de nouveaux contenus pour vous aider à économiser
                intelligemment tout au long de l&apos;année.
              </p>
              <p>
                Consultez également nos <Link href="/boutiques" className="text-primary hover:underline">boutiques partenaires</Link>,
                le <Link href="/top-codes-promo" className="text-primary hover:underline">top 20 des codes promo</Link>,
                ou notre <Link href="/guide-achat" className="text-primary hover:underline">guide d&apos;achat</Link> pour découvrir
                toutes les astuces pour payer moins cher.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
