import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogRelated from '@/components/BlogRelated';
import { getPostBySlug, getPublishedPosts } from '@/lib/supabase';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

function truncateTitle(title: string, maxLen: number): string {
  if (title.length <= maxLen) return title;
  return title.slice(0, maxLen - 1) + '…';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  // Keep title ≤ 60 chars: "Post Title | Blog LockCoupon" → strip suffix if needed
  const suffix = ' | Blog LockCoupon';
  const maxTitleLen = 60 - suffix.length;
  const safeTitle = truncateTitle(post.title, maxTitleLen);
  const fullTitle = `${safeTitle}${suffix}`;
  // If still too long, drop the suffix
  const title = fullTitle.length <= 60 ? safeTitle : truncateTitle(post.title, 57);

  const description = post.excerpt
    ? (post.excerpt.length > 155 ? post.excerpt.slice(0, 152) + '…' : post.excerpt)
    : truncateTitle(post.title, 155);

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: safeTitle,
      description,
      url: `/blog/${post.slug}`,
      type: 'article',
      images: post.cover_image ? [{ url: post.cover_image }] : ['/og-default.png'],
    },
  };
}

export async function generateStaticParams() {
  // Return empty array — pages are generated on-demand with ISR (revalidate=60)
  // This avoids build timeouts when there are many blog posts
  return [];
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const baseUrl = 'https://www.lockcoupon.com';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // Clean BlogPosting JSON-LD (issue 3)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title.length > 110 ? post.title.slice(0, 107) + '…' : post.title,
    description: post.excerpt || post.title,
    ...(post.cover_image
      ? { image: post.cover_image }
      : { image: `${baseUrl}/og-default.png` }),
    author: { '@type': 'Person', name: post.author },
    datePublished: post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    publisher: {
      '@type': 'Organization',
      name: 'LockCoupon',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/og-default.png`,
      },
    },
  };

  // BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title.slice(0, 60), item: postUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <main>
        {/* Breadcrumb nav (issue 11 semantic HTML) */}
        <nav aria-label="Fil d'Ariane" className="max-w-[800px] mx-auto px-4 pt-6">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        <article className="max-w-[800px] mx-auto px-4 py-8 md:py-12">
          <header>
            <div className="flex items-center gap-3 text-[13px] text-muted mb-4">
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span>·</span>
              <span>{post.author}</span>
            </div>

            <h1 className="text-text-main text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-6">
              {post.title}
            </h1>

            {post.cover_image && (
              <div className="rounded-xl overflow-hidden mb-8">
                <Image src={post.cover_image} alt={post.title} width={800} height={450} className="w-full h-auto" priority />
              </div>
            )}
          </header>

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

          {/* Internal links for SEO (issue 8 — more than 1 internal link) */}
          <footer className="mt-12 pt-8 border-t border-border space-y-4">
            <Link href="/blog" className="text-primary font-semibold text-[15px] hover:underline block">
              ← Retour au blog
            </Link>
            <div className="flex flex-wrap gap-3 text-[13px]">
              <Link href="/boutiques" className="text-primary hover:underline font-semibold">→ Toutes les boutiques</Link>
              <Link href="/top-codes-promo" className="text-primary hover:underline font-semibold">→ Top codes promo</Link>
              <Link href="/guide-achat" className="text-primary hover:underline font-semibold">→ Guide d&apos;achat</Link>
            </div>
          </footer>
        </article>

        <BlogRelated currentSlug={post.slug} />
      </main>

      <Footer />
    </>
  );
}
