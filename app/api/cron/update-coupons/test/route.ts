import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const COUPON_SOURCES = ['Dealabs', 'Ma-Reduc', 'Savoo', 'PlanReduc', 'Radins.com'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, store_slug } = body;

    if (secret !== (process.env.CRON_SECRET || 'lockcoupon-cron-2026')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!store_slug) {
      return NextResponse.json({ error: 'store_slug is required' }, { status: 400 });
    }

    const { data: store } = await supabase.from('stores').select('id, name, slug').eq('slug', store_slug).single();
    if (!store) {
      return NextResponse.json({ error: `Store "${store_slug}" not found` }, { status: 404 });
    }

    const sources = COUPON_SOURCES.join(', ');
    const prompt = `Tu es un assistant qui recherche des codes promo RÉELS et ACTUELS pour la boutique "${store.name}".

MISSION : Utilise l'outil web_search pour chercher des codes promo valides pour ${store.name} sur ces sites français : ${sources}.

ÉTAPES :
1. Fais plusieurs recherches web pour trouver des codes promo ${store.name} actuels
2. Cherche spécifiquement : "code promo ${store.name}", "coupon ${store.name} mars 2026", "${store.name} réduction"
3. Extrais UNIQUEMENT les codes/offres que tu trouves réellement
4. Ne JAMAIS inventer de codes

RÉPONSE : Réponds UNIQUEMENT avec un JSON valide (pas de backticks) :
[
  {
    "title": "Description courte",
    "code": "LECODE123" ou null,
    "discount_value": "20" ou null,
    "discount_type": "percent" ou "euro" ou "free" ou "cashback" ou null,
    "type": "code" ou "bon" ou "cashback",
    "expiry_date": "2026-04-30" ou null,
    "source": "nom du site source"
  }
]

Si rien trouvé, réponds : []`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: 'Claude API error', detail: errText.substring(0, 500) }, { status: 500 });
    }

    const data = await response.json();
    const textBlocks = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n') || '';

    let parsedCoupons: any[] = [];
    let parseError: string | null = null;

    try {
      const cleaned = textBlocks.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) { parsedCoupons = JSON.parse(jsonMatch[0]); }
      else { parseError = 'No JSON array found'; }
    } catch (err: any) { parseError = err.message; }

    return NextResponse.json({
      store: { name: store.name, slug: store.slug },
      dry_run: true,
      saved_to_db: false,
      coupons_found: parsedCoupons.length,
      coupons: parsedCoupons,
      parse_error: parseError,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
