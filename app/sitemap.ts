import { MetadataRoute } from 'next';
import { getAllStores, getPublishedPosts, getCouponCountsByStore, type BlogPost, type Store } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import { slugFromTitle } from '@/lib/slugs';
import { SITE_URL } from '@/lib/site';

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
    { url: `${baseUrl}/codes-promo/amazon/prime-day`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Canonical origin: always https + www, no trailing slash (lib/site.ts).
  const baseUrl = SITE_URL;

  // Graceful degradation: if Supabase is unreachable during a Googlebot crawl,
  // always return at minimum the static pages instead of throwing.
  let stores: Store[] = [];
  let posts: BlogPost[] = [];

  try {
    const [allStores, allPosts, couponCounts] = await Promise.all([
      getAllStores(),
      getPublishedPosts(),
      getCouponCountsByStore(),
    ]);
    // Only stores that exist in Supabase right now, with a valid slug AND at
    // least one active offer. Zero-offer stores are noindexed on-page and
    // kept out of the sitemap until they have offers (thin-content fix).
    stores = allStores.filter(
      (s) => s && isValidSlug(s.slug) && (couponCounts[s.id] || 0) > 0
    );
    // Deduplicate article clusters: keep only the OLDEST copy per title-slug
    // (duplicates 308-redirect to it, so they must not appear in the sitemap).
    const validPosts = allPosts.filter((p) => p && isValidSlug(p.slug));
    const byKey = new Map<string, (typeof validPosts)[number]>();
    for (const p of validPosts) {
      const key = slugFromTitle(p.title);
      const existing = byKey.get(key);
      if (!existing || new Date(p.created_at) < new Date(existing.created_at)) {
        byKey.set(key, p);
      }
    }
    posts = Array.from(byKey.values());
  } catch {
    // Supabase down — return static pages only, do not crash sitemap
    return staticPages(baseUrl);
  }

  // Stable daily stamp (after the 07:00 Paris coupon refresh) — honest lastmod
  // instead of a new timestamp on every sitemap fetch, which erodes Google's
  // trust in lastmod and wastes crawl budget.
  const dailyStamp = new Date();
  dailyStamp.setUTCHours(5, 30, 0, 0);
  if (dailyStamp.getTime() > Date.now()) dailyStamp.setUTCDate(dailyStamp.getUTCDate() - 1);

  const storeUrls = stores.map((store) => ({
    url: `${baseUrl}/codes-promo/${store.slug}`,
    lastModified: dailyStamp,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const postUrls = posts.map((post) => {
    const postDate = new Date(post.updated_at);
    const ageMs = now - postDate.getTime();

    let priority: number;
    let changeFrequency: 'weekly' | 'monthly';

    if (ageMs < thirtyDaysMs) {
      // Fresh content — crawl frequently, high priority
      priority = 0.7;
      changeFrequency = 'weekly';
    } else if (ageMs < ninetyDaysMs) {
      // Mid-age content — reduced priority
      priority = 0.4;
      changeFrequency = 'monthly';
    } else {
      // Older content — low priority, save crawl budget
      priority = 0.3;
      changeFrequency = 'monthly';
    }

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: postDate,
      changeFrequency,
      priority,
    };
  });

  return [...staticPages(baseUrl), ...storeUrls, ...postUrls];
}
