import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPostBySlug, getPublishedPosts } from '@/lib/supabase';

export const revalidate = 60;

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
    publisher: {
      '@type': 'Organization',
      name: 'LockCoupon',
      url: 'https://lockcoupon.com',
    },
  };

  // Convert line breaks to paragraphs
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, i) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-text-main text-[24px] font-bold mt-8 mb-3">{trimmed.replace('## ', '')}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-text-main text-[20px] font-bold mt-6 mb-2">{trimmed.replace('### ', '')}</h3>;
      }
      return <p key={i} className="mb-4">{trimmed}</p>;
    });
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <article className="max-w-[800px] mx-auto px-4 py-8 md:py-12">
        {/* Meta */}
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

        <div className="text-muted text-[16px] leading-relaxed">
          {renderContent(post.content)}
        </div>

        {/* Back to blog */}
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
