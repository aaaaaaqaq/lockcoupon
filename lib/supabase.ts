import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
