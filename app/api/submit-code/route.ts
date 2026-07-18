import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Public "suggest a code" endpoint. Replaces the old client-side anon insert
// (anyone could publish arbitrary rows). Submissions are forced to
// is_verified:false and validated server-side.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

const DISCOUNT_TYPES = new Set(['percent', 'euro', 'free', 'cashback']);
const TYPES = new Set(['code', 'bon', 'cashback']);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const affiliateUrl = typeof body.affiliate_url === 'string' ? body.affiliate_url.trim() : '';

  if (!body.store_id || typeof body.store_id !== 'string') {
    return NextResponse.json({ error: 'store_id requis' }, { status: 400 });
  }
  if (title.length < 5 || title.length > 200) {
    return NextResponse.json({ error: 'Description invalide (5-200 caractères)' }, { status: 400 });
  }
  if (code.length > 50) {
    return NextResponse.json({ error: 'Code trop long' }, { status: 400 });
  }
  if (affiliateUrl && !/^https?:\/\//.test(affiliateUrl)) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  // Store must exist
  const { data: store } = await supabase.from('stores').select('id').eq('id', body.store_id).limit(1);
  if (!store || store.length === 0) {
    return NextResponse.json({ error: 'Boutique inconnue' }, { status: 404 });
  }

  const { error } = await supabase.from('coupons').insert({
    store_id: body.store_id,
    title,
    code: code || null,
    discount_value: typeof body.discount_value === 'string' && body.discount_value ? body.discount_value.slice(0, 20) : null,
    discount_type: DISCOUNT_TYPES.has(body.discount_type) ? body.discount_type : null,
    type: TYPES.has(body.type) ? body.type : (code ? 'code' : 'bon'),
    affiliate_url: affiliateUrl || null,
    expiry_date: null,
    is_best: false,
    is_exclusive: false,
    is_verified: false, // always requires manual review
    usage_count: 0,
  });

  if (error) return NextResponse.json({ error: 'Erreur enregistrement' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
