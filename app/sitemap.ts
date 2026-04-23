import { MetadataRoute } from 'next';
import { getAllStores, getPublishedPosts } from '@/lib/supabase';

/* ── Validate a slug: only lowercase alphanumeric + hyphens ── */
function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  if (!slug || slug.length === 0) return false;
  // Reject slugs with spaces, special chars, uppercase, double hyphens, etc.
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com';

  // Fetch & filter: only stores/posts with valid slugs
  const allStores = await getAllStores();
  const allPosts = await getPublishedPosts();

  const stores = allStores.filter((s) => s && isValidSlug(s.slug));
  const posts = allPosts.filter((p) => p && isValidSlug(p.slug));

  const storeUrls = stores.map((store) => ({
    url: `${baseUrl}/codes-promo/${store.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/boutiques`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/top-codes-promo`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/guide-achat`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...storeUrls,
    ...postUrls,
  ];
}
