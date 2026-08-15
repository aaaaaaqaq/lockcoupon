import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Server-side admin gateway. The admin UI used to write straight to Supabase
// with the anon key (RLS was wide open). Now writes go through here with the
// service-role key, and RLS blocks anon writes entirely.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
, {
  // Next 14 caches GET fetches in route handlers (Data Cache) — supabase-js
  // SELECTs were returning hours-old snapshots (empty stores, already-deleted
  // expired coupons), silently breaking dedup guards and count reporting.
  global: { fetch: (url: any, init?: any) => fetch(url, { ...init, cache: 'no-store' }) },
});

const TABLES = new Set(['stores', 'coupons', 'blog_posts', 'subscribers', 'coupon_review_queue']);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const adminPassword = process.env.ADMIN_PASSWORD || 'lockcoupon2026';
  if (body.password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table, action, payload, match } = body as {
    table?: string; action?: string;
    payload?: Record<string, unknown> | Record<string, unknown>[];
    match?: Record<string, unknown>;
  };

  if (action === 'verify') return NextResponse.json({ ok: true });

  // ── Review queue lifecycle (coupon quarantine, Aug 2026) ──
  // approve_review: copy the queued offer into live `coupons`, mark approved.
  // reject_review: mark rejected. Both require match.id.
  if (action === 'approve_review' || action === 'reject_review') {
    const id = match && typeof match === 'object' ? (match as Record<string, unknown>).id : null;
    if (!id) return NextResponse.json({ error: 'match.id required' }, { status: 400 });
    const { data: row, error: selErr } = await supabase
      .from('coupon_review_queue').select('*').eq('id', id).maybeSingle();
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (row.status !== 'pending') return NextResponse.json({ error: `Already ${row.status}` }, { status: 400 });

    if (action === 'approve_review') {
      const { error: insErr } = await supabase.from('coupons').insert({
        store_id: row.store_id,
        title: row.title,
        description: row.description,
        code: row.code,
        discount_value: row.discount_value,
        discount_type: row.discount_type,
        type: row.type || (row.code ? 'code' : 'bon'),
        expiry_date: row.expiry_date,
        is_best: false,
        is_exclusive: false,
        is_verified: true, // human-approved
        affiliate_url: row.affiliate_url,
        usage_count: 0,
      });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    const { error: upErr } = await supabase
      .from('coupon_review_queue')
      .update({ status: action === 'approve_review' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    return NextResponse.json({ error: upErr?.message || null });
  }

  if (!table || !TABLES.has(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 400 });
  }

  try {
    if (action === 'select') {
      const { data, error } = await supabase.from(table).select('*').limit(10000);
      return NextResponse.json({ data, error: error?.message || null });
    }
    if (action === 'insert') {
      if (!payload) return NextResponse.json({ error: 'payload required' }, { status: 400 });
      const { error } = await supabase.from(table).insert(payload);
      return NextResponse.json({ error: error?.message || null });
    }
    if (action === 'update' || action === 'delete') {
      if (!match || typeof match !== 'object' || Object.keys(match).length === 0) {
        return NextResponse.json({ error: 'match required' }, { status: 400 });
      }
      if (action === 'update' && (!payload || Array.isArray(payload))) {
        return NextResponse.json({ error: 'payload required' }, { status: 400 });
      }
      const q = action === 'update'
        ? supabase.from(table).update(payload as Record<string, unknown>).match(match)
        : supabase.from(table).delete().match(match);
      const { error } = await q;
      return NextResponse.json({ error: error?.message || null });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
