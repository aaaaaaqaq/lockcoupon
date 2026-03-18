import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || 'lockcoupon-cron-2026';

const COUPON_SOURCES = ['Dealabs', 'Ma-Reduc', 'Savoo', 'PlanReduc', 'Radins.com'];
const STORES_PER_RUN = 3;
const MIN_COUPONS = 3;

const STORE_URLS: Record<string, string> = {
  'shein': 'https://fr.shein.com',
  'zara': 'https://www.zara.com/fr',
  'hm': 'https://www2.hm.com/fr_fr',
  'asos': 'https://www.asos.com/fr',
  'mango': 'https://shop.mango.com/fr',
  'boohoo': 'https://fr.boohoo.com',
  'prettylittlething': 'https://www.prettylittlething.fr',
  'zalando': 'https://www.zalando.fr',
  'la-redoute': 'https://www.laredoute.fr',
  'kiabi': 'https://www.kiabi.com',
  'uniqlo': 'https://www.uniqlo.com/fr',
  'lacoste': 'https://www.lacoste.com/fr',
  'ralph-lauren': 'https://www.ralphlauren.fr',
  'tommy-hilfiger': 'https://fr.tommy.com',
  'calvin-klein': 'https://www.calvinklein.fr',
  'bershka': 'https://www.bershka.com/fr',
  'pull-and-bear': 'https://www.pullandbear.com/fr',
  'etam': 'https://www.etam.com',
  'veepee': 'https://www.veepee.fr',
  'showroomprive': 'https://www.showroomprive.com',
  'galeries-lafayette': 'https://www.galerieslafayette.com',
  'printemps': 'https://www.printemps.com',
  'jennyfer': 'https://www.jennyfer.com',
  'celio': 'https://www.celio.com',
  'jules': 'https://www.jules.com',
  'promod': 'https://www.promod.fr',
  'nike': 'https://www.nike.com/fr',
  'adidas': 'https://www.adidas.fr',
  'puma': 'https://eu.puma.com/fr',
  'new-balance': 'https://www.newbalance.fr',
  'foot-locker': 'https://www.footlocker.fr',
  'decathlon': 'https://www.decathlon.fr',
  'reebok': 'https://www.reebok.fr',
  'asics': 'https://www.asics.com/fr',
  'the-north-face': 'https://www.thenorthface.fr',
  'timberland': 'https://www.timberland.fr',
  'vans': 'https://www.vans.fr',
  'converse': 'https://www.converse.com/fr',
  'courir': 'https://www.courir.com',
  'intersport': 'https://www.intersport.fr',
  'skechers': 'https://www.skechers.fr',
  'samsung': 'https://www.samsung.com/fr',
  'apple': 'https://www.apple.com/fr',
  'xiaomi': 'https://www.mi.com/fr',
  'dyson': 'https://www.dyson.fr',
  'philips': 'https://www.philips.fr',
  'fnac': 'https://www.fnac.com',
  'darty': 'https://www.darty.com',
  'boulanger': 'https://www.boulanger.com',
  'ldlc': 'https://www.ldlc.com',
  'back-market': 'https://www.backmarket.fr',
  'cdiscount': 'https://www.cdiscount.com',
  'materiel-net': 'https://www.materiel.net',
  'micromania': 'https://www.micromania.fr',
  'booking': 'https://www.booking.com',
  'expedia': 'https://www.expedia.fr',
  'airbnb': 'https://www.airbnb.fr',
  'sephora': 'https://www.sephora.fr',
  'nocibe': 'https://www.nocibe.fr',
  'yves-rocher': 'https://www.yves-rocher.fr',
  'marionnaud': 'https://www.marionnaud.fr',
  'aroma-zone': 'https://www.aroma-zone.com',
  'ikea': 'https://www.ikea.com/fr',
  'leroy-merlin': 'https://www.leroymerlin.fr',
  'conforama': 'https://www.conforama.fr',
  'maisons-du-monde': 'https://www.maisonsdumonde.com',
  'but': 'https://www.but.fr',
  'bhv': 'https://www.bhv.fr',
  'temu': 'https://www.temu.com/fr',
  'amazon': 'https://www.amazon.fr',
  'aliexpress': 'https://fr.aliexpress.com',
  'auchan': 'https://www.auchan.fr',
  'carrefour': 'https://www.carrefour.fr',
  'leclerc': 'https://www.e.leclerc',
  'rakuten': 'https://fr.shopping.rakuten.com',
  'ebay': 'https://www.ebay.fr',
  'sarenza': 'https://www.sarenza.com',
  'spartoo': 'https://www.spartoo.com',
  'trois-suisses': 'https://www.3suisses.fr',
};

function getStoreUrl(slug: string, storeName: string): string {
  if (STORE_URLS[slug]) return STORE_URLS[slug];
  const clean = storeName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `https://www.${clean}.fr`;
}

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

function buildSearchPrompt(storeName: string): string {
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

function buildExtraPrompt(storeName: string): string {
  const sources = COUPON_SOURCES.join(', ');

  return `Tu es un assistant qui recherche des codes promo RÉELS pour "${storeName}".

Cette boutique a très peu de codes promo. Fais une recherche APPROFONDIE sur : ${sources}, ainsi que Google Shopping, RetailMeNot, Groupon, et tout autre site de codes promo.

Cherche aussi :
- "code promo ${storeName} 2026"
- "${storeName} bon de réduction"
- "${storeName} offre spéciale"
- "${storeName} promo nouveaux clients"
- "${storeName} livraison gratuite code"

Trouve au moins 5 codes/offres si possible. Inclus aussi les offres génériques comme "livraison gratuite dès X€" ou "réduction nouveaux clients".

RÉPONSE : Réponds UNIQUEMENT avec un JSON valide (pas de backticks) :
[
  {
    "title": "Description courte de l'offre en français",
    "code": "LECODE123" ou null si pas de code,
    "discount_value": "20" ou null,
    "discount_type": "percent" ou "euro" ou "free" ou "cashback" ou null,
    "type": "code" ou "bon" ou "cashback",
    "expiry_date": "2026-04-30" ou null,
    "source": "nom du site source"
  }
]

Si rien trouvé, réponds : []`;
}

async function callClaude(prompt: string): Promise<ScrapedCoupon[]> {
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

  if (!response.ok) return [];

  const data = await response.json();
  const textBlocks = data.content?.filter((block: any) => block.type === 'text').map((block: any) => block.text).join('\n') || '';
  if (!textBlocks.trim()) return [];

  try {
    const cleaned = textBlocks.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const coupons: ScrapedCoupon[] = JSON.parse(jsonMatch[0]);
    return coupons.filter((c) => {
      if (!c.title || c.title.length < 5) return false;
      if (c.code && c.code.length > 50) return false;
      if (c.discount_type && !['percent', 'euro', 'free', 'cashback'].includes(c.discount_type)) return false;
      if (c.type && !['code', 'bon', 'cashback'].includes(c.type)) return false;
      return true;
    });
  } catch { return []; }
}

async function upsertCoupons(storeId: string, storeSlug: string, storeName: string, coupons: ScrapedCoupon[]): Promise<{ inserted: number; skipped: number; errors: number }> {
  let inserted = 0, skipped = 0, errors = 0;
  const storeUrl = getStoreUrl(storeSlug, storeName);

  for (const coupon of coupons) {
    try {
      let isDuplicate = false;

      if (coupon.code) {
        const { data: existing } = await supabase.from('coupons').select('id').eq('store_id', storeId).eq('code', coupon.code).maybeSingle();
        if (existing) isDuplicate = true;
      } else {
        const { data: existing } = await supabase.from('coupons').select('id, title').eq('store_id', storeId).is('code', null);
        if (existing?.some((e) => e.title.toLowerCase() === coupon.title.toLowerCase())) isDuplicate = true;
      }

      if (isDuplicate) { skipped++; continue; }

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
        is_verified: false,
        affiliate_url: storeUrl,
        usage_count: 0,
      });

      if (insertError) { errors++; } else { inserted++; }
    } catch { errors++; }
  }
  return { inserted, skipped, errors };
}

async function getStoreCouponCount(storeId: string): Promise<number> {
  const { count } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('store_id', storeId);
  return count || 0;
}

async function cleanExpiredCoupons(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data: expired, error } = await supabase.from('coupons').select('id').lt('expiry_date', today).not('expiry_date', 'is', null);
  if (error || !expired || expired.length === 0) return 0;
  const ids = expired.map((c) => c.id);
  const { error: deleteError } = await supabase.from('coupons').delete().in('id', ids);
  if (deleteError) return 0;
  return ids.length;
}

async function selectStoresForRun(allStores: StoreRecord[]): Promise<StoreRecord[]> {
  try {
    const { data: logs, error } = await supabase.from('cron_coupon_log').select('store_id, updated_at').order('updated_at', { ascending: true });
    if (error || !logs) return [...allStores].sort(() => Math.random() - 0.5).slice(0, STORES_PER_RUN);

    const logMap = new Map(logs.map((l) => [l.store_id, l.updated_at]));
    const sorted = [...allStores].sort((a, b) => {
      const aTime = logMap.get(a.id) || '1970-01-01';
      const bTime = logMap.get(b.id) || '1970-01-01';
      return aTime.localeCompare(bTime);
    });
    return sorted.slice(0, STORES_PER_RUN);
  } catch { return [...allStores].sort(() => Math.random() - 0.5).slice(0, STORES_PER_RUN); }
}

async function logUpdate(storeId: string, storeName: string, result: any) {
  try {
    await supabase.from('cron_coupon_log').upsert({ store_id: storeId, store_name: storeName, updated_at: new Date().toISOString(), result: JSON.stringify(result) }, { onConflict: 'store_id' });
  } catch {}
}

async function backfillStoreUrls(): Promise<number> {
  const { data: stores } = await supabase.from('stores').select('id, name, slug');
  if (!stores) return 0;

  let updated = 0;
  for (const store of stores) {
    const storeUrl = getStoreUrl(store.slug, store.name);
    const { error } = await supabase
      .from('coupons')
      .update({ affiliate_url: storeUrl })
      .eq('store_id', store.id)
      .is('affiliate_url', null);
    if (!error) updated++;
  }
  return updated;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }

  try {
    const { data: stores, error: storesError } = await supabase.from('stores').select('id, name, slug').order('name');
    if (storesError || !stores || stores.length === 0) {
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }

    const expiredCleaned = await cleanExpiredCoupons();
    const backfilled = await backfillStoreUrls();
    const selectedStores = await selectStoresForRun(stores);

    const results: Array<{
      store: string;
      slug: string;
      store_url: string;
      coupons_before: number;
      found_update: number;
      inserted_update: number;
      needed_extra: boolean;
      found_extra: number;
      inserted_extra: number;
      coupons_after: number;
    }> = [];

    for (const store of selectedStores) {
      const storeUrl = getStoreUrl(store.slug, store.name);
      const couponsBefore = await getStoreCouponCount(store.id);

      const updateCoupons = await callClaude(buildSearchPrompt(store.name));
      let insertedUpdate = 0;
      if (updateCoupons.length > 0) {
        const r = await upsertCoupons(store.id, store.slug, store.name, updateCoupons);
        insertedUpdate = r.inserted;
      }

      const couponsAfterUpdate = await getStoreCouponCount(store.id);

      let neededExtra = false;
      let foundExtra = 0;
      let insertedExtra = 0;

      if (couponsAfterUpdate <= MIN_COUPONS) {
        neededExtra = true;
        const extraCoupons = await callClaude(buildExtraPrompt(store.name));
        foundExtra = extraCoupons.length;
        if (extraCoupons.length > 0) {
          const r = await upsertCoupons(store.id, store.slug, store.name, extraCoupons);
          insertedExtra = r.inserted;
        }
      }

      const couponsAfter = await getStoreCouponCount(store.id);

      const storeResult = {
        store: store.name,
        slug: store.slug,
        store_url: storeUrl,
        coupons_before: couponsBefore,
        found_update: updateCoupons.length,
        inserted_update: insertedUpdate,
        needed_extra: neededExtra,
        found_extra: foundExtra,
        inserted_extra: insertedExtra,
        coupons_after: couponsAfter,
      };

      results.push(storeResult);
      await logUpdate(store.id, store.name, storeResult);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        stores_processed: selectedStores.length,
        total_stores: stores.length,
        total_updated: results.reduce((s, r) => s + r.inserted_update, 0),
        stores_needed_extra: results.filter((r) => r.needed_extra).length,
        total_extra_added: results.reduce((s, r) => s + r.inserted_extra, 0),
        expired_cleaned: expiredCleaned,
        urls_backfilled: backfilled,
      },
      details: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
