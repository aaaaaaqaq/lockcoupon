import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPublishedPosts } from '@/lib/supabase';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog — Conseils, Astuces & Bons Plans | LockCoupon',
  description: 'Découvrez nos articles sur les meilleures astuces pour économiser, les codes promo du moment et les bons plans en ligne.',
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Navbar />

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

      <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-[18px] mb-2">Aucun article publié pour le moment</p>
            <p className="text-[14px]">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                {post.cover_image ? (
                  <div className="h-[200px] overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
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
                    <span>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
