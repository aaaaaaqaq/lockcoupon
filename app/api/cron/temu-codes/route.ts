import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';
import { submitIndexNow } from '@/lib/indexnow';
import { TEMU_AFFILIATE_URL, TEMU_CODES, TEMU_PINNED_CODES, OFFER_TEMPLATES } from '@/lib/temuOffers';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
, {
  // Next 14 caches GET fetches in route handlers (Data Cache) — supabase-js
  // SELECTs were returning hours-old snapshots (empty stores, already-deleted
  // expired coupons), silently breaking dedup guards and count reporting.
  global: { fetch: (url: any, init?: any) => fetch(url, { ...init, cache: 'no-store' }) },
});

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find Temu store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, slug')
      .eq('slug', 'temu')
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Temu store not found', detail: storeError?.message }, { status: 404 });
    }

    // 2. Delete ALL existing Temu code coupons before publishing today's
    // batch. The old `.limit(10)` only removed the newest 10 while the
    // update-coupons cron also inserts Temu codes — older same-title copies
    // survived every day and piled up (8× "-70% Liquidation" live on 07-27).
    const { data: existingCoupons } = await supabase
      .from('coupons')
      .select('id')
      .eq('store_id', store.id)
      .eq('type', 'code');

    if (existingCoupons && existingCoupons.length > 0) {
      await supabase
        .from('coupons')
        .delete()
        .in('id', existingCoupons.map(c => c.id));
    }

    // 3. Pick 10 random codes and 10 UNIQUE offer templates (uniqueness
    // guard: one coupon per template title per batch — duplicate templates
    // would recreate the same-title dupes the 2026-07-27 cleanup removed).
    // Top 5 = pinned personal affiliate codes, always, in this exact order.
    // Ranks 6+ rotate from the pool (minus pinned).
    const temuPool = TEMU_CODES.filter((c) => !TEMU_PINNED_CODES.includes(c));
    const selectedCodes = [...TEMU_PINNED_CODES, ...pickRandom(temuPool, 5)];
    const uniqueTemplates: typeof OFFER_TEMPLATES = [];
    for (const t of pickRandom(OFFER_TEMPLATES, OFFER_TEMPLATES.length)) {
      if (!uniqueTemplates.some((u) => u.title === t.title)) uniqueTemplates.push(t);
      if (uniqueTemplates.length === 10) break;
    }
    const selectedOffers = uniqueTemplates;

    // 4. Expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    // 5. Build and insert 10 coupons
    // Guard: never index past the unique-template list (if the pool ever
    // shrinks below 10 unique titles, publish fewer coupons, not duplicates).
    const newCoupons = selectedCodes.slice(0, selectedOffers.length).map((code, i) => ({
      store_id: store.id,
      title: selectedOffers[i].title,
      code: code.toLowerCase(),
      description: selectedOffers[i].description,
      discount_value: selectedOffers[i].discount_value,
      discount_type: selectedOffers[i].discount_type,
      type: 'code' as const,
      sort_order: i + 1,
      affiliate_url: TEMU_AFFILIATE_URL,
      expiry_date: expiryStr,
      is_best: selectedOffers[i].is_best,
      is_exclusive: selectedOffers[i].is_exclusive,
      is_verified: true,
      usage_count: Math.floor(Math.random() * 500) + 50,
      created_at: new Date().toISOString(),
    }));

    // Mark the first one as best
    newCoupons[0].is_best = true;

    const { data: inserted, error: insertError } = await supabase
      .from('coupons')
      .insert(newCoupons)
      .select('id, title, code, discount_value, discount_type');

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed', detail: insertError.message }, { status: 500 });
    }

    // ── Notify search engines: codes just changed on these pages ──────────
    // IndexNow → Bing/Yandex (Bing index powers ChatGPT search).
    // Indexing API + sitemap ping → Google.
    const temuUrls = [
      'https://www.lockcoupon.com/codes-promo/temu',
      'https://www.lockcoupon.com/codes-promo/temu/nouveau-client',
      'https://www.lockcoupon.com/codes-promo/temu/livraison-gratuite',
      'https://www.lockcoupon.com/codes-promo/temu/parrainage',
    ];
    await Promise.all([
      submitIndexNow(temuUrls),
      pingSitemap(),
      notifyGoogle([temuUrls[0]]),
    ]);

    return NextResponse.json({
      success: true,
      message: `${inserted?.length || 0} Temu codes published`,
      pinged: { indexnow: temuUrls.length, google: 1 },
      deleted: existingCoupons?.length || 0,
      inserted: inserted?.length || 0,
      codes: inserted?.map(c => ({ title: c.title, code: c.code, value: `${c.discount_value}${c.discount_type === 'percent' ? '%' : '€'}` })),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Temu codes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
