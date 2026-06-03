import { MetadataRoute } from 'next';
import { getAllStores, getPublishedPosts } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';

/* ── Validate a slug: only lowercase alphanumeric + hyphens ── */
function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  if (!slug || slug.length === 0) return false;
  // Reject slugs with spaces, special chars, uppercase, double hyphens, etc.
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/* ── Static pages always returned, even if Supabase is down ── */
function staticPages(baseUrl: string): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/boutiques`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/top-codes-promo`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/guide-achat`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...CATEGORIES.map((c) => ({
      url: `${baseUrl}/codes-promo/categorie/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${baseUrl}/codes-promo/temu/nouveau-client`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/codes-promo/temu/livraison-gratuite`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/codes-promo/temu/parrainage`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com';

  // Graceful degradation: if Supabase is unreachable during a Googlebot crawl,
  // always return at minimum the static pages instead of throwing.
  let stores: { slug: string }[] = [];
  let posts: { slug: string; updated_at: string }[] = [];

  try {
    const [allStores, allPosts] = await Promise.all([
      getAllStores(),
      getPublishedPosts(),
    ]);
    stores = allStores.filter((s) => s && isValidSlug(s.slug));
    posts = allPosts.filter((p) => p && isValidSlug(p.slug));
  } catch {
    // Supabase down — return static pages only, do not crash sitemap
    return staticPages(baseUrl);
  }

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

  return [...staticPages(baseUrl), ...storeUrls, ...postUrls];
}
