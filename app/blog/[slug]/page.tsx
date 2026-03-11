import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPostBySlug, getPublishedPosts } from '@/lib/supabase';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | Blog LockCoupon`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `/blog/${post.slug}`,
      type: 'article',
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_image || undefined,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.created_at,
    dateModified: post.updated_at,
    publisher: { '@type': 'Organization', name: 'LockCoupon', url: 'https://lockcoupon.com' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <article className="max-w-[800px] mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 text-[13px] text-muted mb-4">
          <span>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>

        <h1 className="text-text-main text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-6">
          {post.title}
        </h1>

        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-8">
            <img src={post.cover_image} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        {/* Render HTML content */}
        <div
          className="text-muted text-[16px] leading-relaxed
            [&_h2]:text-text-main [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
            [&_h3]:text-text-main [&_h3]:text-[20px] [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:mb-4
            [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-dark
            [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_li]:mb-1
            [&_hr]:my-6 [&_hr]:border-border
            [&_strong]:text-text-main [&_strong]:font-bold
            [&_em]:italic
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-border">
          <a href="/blog" className="text-primary font-semibold text-[15px] hover:underline">
            ← Retour au blog
          </a>
        </div>
      </article>

      <Footer />
    </>
  );
}
