import { createClient } from '@supabase/supabase-js';

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
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data;
}

export async function getCouponsByStoreId(storeId: string): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true })
    .order('is_best', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getAllStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name');
  if (error) return [];
  return data || [];
}

/** Offer count per store_id in ONE query — used by the sitemap to exclude
 *  zero-offer (thin) store pages until they have offers again. */
export async function getCouponCountsByStore(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('coupons').select('store_id');
  if (error || !data) return {};
  const counts: Record<string, number> = {};
  for (const row of data as { store_id: string }[]) {
    counts[row.store_id] = (counts[row.store_id] || 0) + 1;
  }
  return counts;
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

/** Lightweight post list (no content) — for internal-linking widgets. */
export async function getPostsLight(): Promise<Pick<BlogPost, 'slug' | 'title' | 'created_at'>[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug,title,created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  if (error) return null;
  return data;
}
