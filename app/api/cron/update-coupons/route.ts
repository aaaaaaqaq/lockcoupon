import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Vercel serverless config ────────────────────────────────
export const maxDuration = 300; // 5 min max for Pro plan
export const dynamic = 'force-dynamic';

// ─── Clients ─────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || 'lockcoupon-cron-2026';

// ─── Source sites to search ──────────────────────────────────
const COUPON_SOURCES = [
  'Dealabs',
  'Ma-Reduc',
  'Savoo',
  'PlanReduc',
  'Radins.com',
];

// ─── Batch size: how many stores per cron run ────────────────
const STORES_PER_RUN = 3;

// ─── Types ───────────────────────────────────────────────────
interface ScrapedCoupon {
  title: string;
  code: string | null;
  discount_value: string | null;
  discount_type: 'percent' | 'euro' | 'free' | 'cashback' | null;
  type: 'code' | 'cashback' | 'bon' | null;
  expiry_date: string | null;
  source: string;
}

interface StoreRecord {
  id: string;
  name: string;
  slug: string;
}

// ─── Build the Claude prompt for a given store ───────────────
function buildSearchPrompt(storeName: string, storeSlug: string): string {
  const today = new Date().toISOString().split('T')[0];
  const sources = COUPON_SOURCES.join(', ');

  return `Tu es un assistant qui recherche des codes promo RÉELS et ACTUELS pour la boutique "${storeName}".

MISSION : Utilise l'outil web_search pour chercher des codes promo valides pour ${storeName} sur ces sites français : ${sources}.

ÉTAPES :
1. Fais plusieurs recherches web pour trouver des codes promo ${storeName} actuels (mars 2026)
2. Cherche spécifiquement : "code promo ${storeName} ${today.substring(0, 7)}", "coupon ${storeName} mars 2026", "${storeName} réduction"
3. Extrais UNIQUEMENT les codes/offres que tu trouves réellement dans les résultats de recherche
4. Ne JAMAIS inventer de codes — si tu ne trouves rien de concret, retourne un tableau vide

IMPORTANT :
- Seuls les codes/offres trouvés dans les résultats de recherche réels
- Ignore les offres expirées ou marquées comme expirées
- Privilégie les codes avec un vrai code alphanumérique
- Si une offre est "livraison gratuite" ou "bon plan" sans code, type = "bon"

RÉPONSE : Réponds UNIQUEMENT avec un JSON valide (pas de backticks, pas de texte avant/après) :
[
  {
    "title": "Description courte de l'offre en français",
    "code": "LECODE123" ou null si pas de code,
    "discount_value": "20" ou "10.50" ou null,
    "discount_type": "percent" ou "euro" ou "free" ou "cashback" ou null,
    "type": "code" ou "bon" ou "cashback",
    "expiry_date": "2026-04-30" ou null si pas de date,
    "source": "nom du site source (Dealabs, Ma-Reduc, etc.)"
  }
]

Si tu ne trouves AUCUN code promo valide, réponds exactement : []`;
}

// ─── Call Claude API with web search ─────────────────────────
async function searchCouponsForStore(
  storeName: string,
  storeSlug: string
): Promise<ScrapedCoupon[]> {
  const prompt = buildSearchPrompt(storeName, storeSlug);

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
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Claude API error for ${storeName}:`, errText.substring(0, 300));
    return [];
  }

  const data = await response.json();

  // Extract text from Claude's response (may have multiple content blocks)
  const textBlocks = data.content
    ?.filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n') || '';

  if (!textBlocks.trim()) {
    console.log(`No text response for ${storeName}`);
    return [];
  }

  // Parse JSON from response
  try {
    const cleaned = textBlocks
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find the JSON array in the response
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log(`No JSON array found for ${storeName}:`, cleaned.substring(0, 200));
      return [];
    }

    const coupons: ScrapedCoupon[] = JSON.parse(jsonMatch[0]);

    // Validate each coupon
    return coupons.filter((c) => {
      if (!c.title || c.title.length < 5) return false;
      if (c.code && c.code.length > 50) return false;
      if (c.discount_type && !['percent', 'euro', 'free', 'cashback'].includes(c.discount_type)) return false;
      if (c.type && !['code', 'bon', 'cashback'].includes(c.type)) return false;
      return true;
    });
  } catch (err) {
    console.error(`JSON parse error for ${storeName}:`, err);
    return [];
  }
}

// ─── Upsert coupons to Supabase ──────────────────────────────
async function upsertCoupons(
  storeId: string,
  storeName: string,
  coupons: ScrapedCoupon[]
): Promise<{ inserted: number; skipped: number; errors: number }> {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const coupon of coupons) {
    try {
      // Check for duplicates: same store + same code (if code exists) or same title
      let isDuplicate = false;

      if (coupon.code) {
        const { data: existing } = await supabase
          .from('coupons')
          .select('id')
          .eq('store_id', storeId)
          .eq('code', coupon.code)
          .maybeSingle();

        if (existing) {
          isDuplicate = true;
        }
      } else {
        // For codeless offers, check by title similarity
        const { data: existing } = await supabase
          .from('coupons')
          .select('id, title')
          .eq('store_id', storeId)
          .is('code', null);

        if (existing?.some((e) => e.title.toLowerCase() === coupon.title.toLowerCase())) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        skipped++;
        continue;
      }

      // Insert the new coupon
      const { error: insertError } = await supabase.from('coupons').insert({
        store_id: storeId,
        title: coupon.title,
        code: coupon.code || null,
        discount_value: coupon.discount_value || null,
        discount_type: coupon.discount_type || null,
        type: coupon.type || (coupon.code ? 'code' : 'bon'),
        expiry_date: coupon.expiry_date || null,
        is_best: false,
        is_exclusive: false,
        is_verified: false, // Auto-scraped = not manually verified
        affiliate_url: null,
        usage_count: 0,
      });

      if (insertError) {
        console.error(`Insert error for "${coupon.title}":`, insertError.message);
        errors++;
      } else {
        inserted++;
      }
    } catch (err) {
      console.error(`Error processing coupon "${coupon.title}":`, err);
      errors++;
    }
  }

  return { inserted, skipped, errors };
}

// ─── Clean up expired coupons ────────────────────────────────
async function cleanExpiredCoupons(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { data: expired, error } = await supabase
    .from('coupons')
    .select('id')
    .lt('expiry_date', today)
    .not('expiry_date', 'is', null);

  if (error || !expired || expired.length === 0) return 0;

  const ids = expired.map((c) => c.id);
  const { error: deleteError } = await supabase
    .from('coupons')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error('Error cleaning expired coupons:', deleteError.message);
    return 0;
  }

  return ids.length;
}

// ─── Select stores for this run ──────────────────────────────
// Uses a round-robin approach: stores are picked based on which were
// least recently updated, tracked via the `cron_coupon_log` table.
// Falls back to random selection if the log table doesn't exist.
async function selectStoresForRun(allStores: StoreRecord[]): Promise<StoreRecord[]> {
  try {
    // Try to get the last update timestamp per store from the log
    const { data: logs, error } = await supabase
      .from('cron_coupon_log')
      .select('store_id, updated_at')
      .order('updated_at', { ascending: true });

    if (error || !logs) {
      // Log table might not exist — fall back to random
      return shuffleAndPick(allStores, STORES_PER_RUN);
    }

    const logMap = new Map(logs.map((l) => [l.store_id, l.updated_at]));

    // Sort stores: never-updated first, then oldest-updated first
    const sorted = [...allStores].sort((a, b) => {
      const aTime = logMap.get(a.id) || '1970-01-01';
      const bTime = logMap.get(b.id) || '1970-01-01';
      return aTime.localeCompare(bTime);
    });

    return sorted.slice(0, STORES_PER_RUN);
  } catch {
    return shuffleAndPick(allStores, STORES_PER_RUN);
  }
}

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Log the update ──────────────────────────────────────────
async function logUpdate(storeId: string, storeName: string, result: any) {
  try {
    await supabase.from('cron_coupon_log').upsert(
      {
        store_id: storeId,
        store_name: storeName,
        updated_at: new Date().toISOString(),
        result: JSON.stringify(result),
      },
      { onConflict: 'store_id' }
    );
  } catch {
    // Non-critical — ignore if log table doesn't exist
  }
}

// ─── Main handler ────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Auth check
  if (secret !== CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }

  try {
    // 1. Fetch all stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, slug')
      .order('name');

    if (storesError || !stores || stores.length === 0) {
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }

    // 2. Select stores for this run (round-robin)
    const selectedStores = await selectStoresForRun(stores);

    // 3. Clean expired coupons first
    const expiredCleaned = await cleanExpiredCoupons();

    // 4. Search & upsert coupons for each selected store
    const results: Array<{
      store: string;
      slug: string;
      found: number;
      inserted: number;
      skipped: number;
      errors: number;
    }> = [];

    for (const store of selectedStores) {
      console.log(`🔍 Searching coupons for ${store.name}...`);

      const coupons = await searchCouponsForStore(store.name, store.slug);

      if (coupons.length > 0) {
        const upsertResult = await upsertCoupons(store.id, store.name, coupons);
        const storeResult = {
          store: store.name,
          slug: store.slug,
          found: coupons.length,
          ...upsertResult,
        };
        results.push(storeResult);
        await logUpdate(store.id, store.name, storeResult);
      } else {
        const storeResult = {
          store: store.name,
          slug: store.slug,
          found: 0,
          inserted: 0,
          skipped: 0,
          errors: 0,
        };
        results.push(storeResult);
        await logUpdate(store.id, store.name, storeResult);
      }

      // Small delay between API calls to be polite
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 5. Summary
    const totalFound = results.reduce((s, r) => s + r.found, 0);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        stores_processed: selectedStores.length,
        total_stores: stores.length,
        coupons_found: totalFound,
        coupons_inserted: totalInserted,
        coupons_skipped_duplicates: totalSkipped,
        expired_cleaned: expiredCleaned,
      },
      details: results,
    });
  } catch (error: any) {
    console.error('Cron update-coupons error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack?.substring(0, 500) },
      { status: 500 }
    );
  }
}
