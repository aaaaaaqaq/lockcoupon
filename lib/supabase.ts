import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Fallback values prevent crash during build when env vars aren't set.
// Queries will simply fail and our error handlers return empty data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ───────────────────────────────────────────────────
export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  logo_color: string | null;
  logo_letter: string | null;
  description: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  store_id: string;
  title: string;
  code: string | null;
  discount_value: string | null;
  discount_type: 'percent' | 'euro' | 'free' | 'cashback' | null;
  type: 'code' | 'cashback' | 'bon' | null;
  expiry_date: string | null;
  usage_count: number;
  is_best: boolean;
  is_exclusive: boolean;
  is_verified: boolean;
  description: string | null;
  affiliate_url: string | null;
  sort_order?: number | null;
  created_at: string;
}

// ─── Data fetchers ───────────────────────────────────────────
// Two-layer caching strategy (fixes slow cold-ISR blog/store renders):
//   • React cache()      → dedupes identical calls WITHIN a single request
//                          (e.g. getPostBySlug runs in both generateMetadata
//                          and the page body → 1 query instead of 2).
//   • unstable_cache()   → shares the result ACROSS requests via the Next data
//                          cache, so N concurrent cold renders of different
//                          slugs don't each re-fetch the whole post index /
//                          store list. Errors are thrown inside so failures are
//                          never cached; the outer wrapper degrades to [].

export const getStoreBySlug = cache(async (slug: string): Promise<Store | null> => {
  // .maybeSingle() + limit(1): .single() errors out (→ page 404s) when the
  // table accidentally contains duplicate slugs. Oldest row wins (canonical).
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  // Real query failure must THROW (→ HTTP 500, Google retries later), never
  // return null (→ notFound() → cacheable 404 → page gets deindexed).
  // maybeSingle() returns data:null WITHOUT error when the row simply doesn't exist.
  if (error) throw new Error(`getStoreBySlug(${slug}) failed: ${error.message}`);
  return data;
});

export const getCouponsByStoreId = cache(async (storeId: string): Promise<Coupon[]> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true })
    .order('is_best', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
});

const _getAllStoresCached = unstable_cache(
  async (): Promise<Store[]> => {
    const { data, error } = await supabase.from('stores').select('*').order('name');
    if (error) throw new Error(`getAllStores failed: ${error.message}`); // don't cache failures
    return data || [];
  },
  ['all-stores'],
  { revalidate: 300, tags: ['stores'] }
);
export const getAllStores = cache(async (): Promise<Store[]> => {
  try {
    return await _getAllStoresCached();
  } catch {
    return [];
  }
});

/** Paginated whole-table select: Supabase REST silently caps any query at
 *  1000 rows. With 1300+ coupons, a bare .select() drops ~26% of rows —
 *  which made the sitemap's zero-offer filter and intent-page gate evaluate
 *  WRONG data (Bing: "important pages missing in sitemaps"). Loop .range()
 *  pages until a short page signals the end. */
async function selectAllRows<T>(table: string, columns: string): Promise<T[] | null> {
  const PAGE = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) return null;
    if (data) rows.push(...(data as T[]));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

/** Offer count per store_id — used by the sitemap to exclude
 *  zero-offer (thin) store pages until they have offers again. */
export async function getCouponCountsByStore(): Promise<Record<string, number>> {
  const data = await selectAllRows<{ store_id: string }>('coupons', 'store_id');
  if (!data) return {};
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.store_id] = (counts[row.store_id] || 0) + 1;
  }
  return counts;
}

/** Light coupon rows (store_id + text fields) — lets the sitemap apply the
 *  intent-page gate (≥2 offers matching the intent's filter) without N
 *  per-store queries. */
export type CouponLight = Pick<Coupon, 'store_id' | 'title' | 'description'>;
export async function getAllCouponsLight(): Promise<CouponLight[]> {
  const data = await selectAllRows<CouponLight>('coupons', 'store_id,title,description');
  return data ?? [];
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  await supabase.rpc('increment_usage', { coupon_id: couponId });
}

// ─── Blog ────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** Lightweight post list — every column EXCEPT the heavy `content` HTML.
 *  This one list serves the sitemap, canonical-slug clustering, related-post
 *  widgets and the homepage teaser, so no hot path ever needs to pull the
 *  full content of all ~300 posts. Cross-request cached (300s) + per-render
 *  deduped, so concurrent cold blog renders share a single DB round-trip. */
export type PostLight = Pick<
  BlogPost,
  'id' | 'slug' | 'title' | 'excerpt' | 'cover_image' | 'author' | 'created_at' | 'updated_at'
>;

const _getPostsLightCached = unstable_cache(
  async (): Promise<PostLight[]> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id,slug,title,excerpt,cover_image,author,created_at,updated_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`getPostsLight failed: ${error.message}`); // don't cache failures
    return data || [];
  },
  ['posts-light'],
  { revalidate: 300, tags: ['posts'] }
);
export const getPostsLight = cache(async (): Promise<PostLight[]> => {
  try {
    return await _getPostsLightCached();
  } catch {
    return [];
  }
});

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  // .maybeSingle() + limit(1): .single() errors out (→ page 404s, and the URL
  // is still in the sitemap — GSC "Introuvable 404") when the article cron
  // created duplicate slug rows. Oldest row wins (canonical copy).
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  // Same rule as getStoreBySlug: DB failure ⇒ throw (500), not a cacheable 404.
  if (error) throw new Error(`getPostBySlug(${slug}) failed: ${error.message}`);
  return data;
});
