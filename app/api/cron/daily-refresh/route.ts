import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';
import { submitIndexNow } from '@/lib/indexnow';
import { isDuplicateOffer, sameDiscount, titleSimilarity, type OfferLike } from '@/lib/couponSimilarity';
import { TEMU_AFFILIATE_URL, TEMU_CODES, OFFER_TEMPLATES } from '@/lib/temuOffers';

/**
 * /api/cron/daily-refresh — daily content-freshness rotation for the
 * flagship stores (Temu, AliExpress, Amazon, Shein, Bershka).
 *
 * Every run:
 *   • TEMU — wipes yesterday's code coupons, publishes 10 affiliate-pool
 *     codes with FRESH Claude-written titles/descriptions (never the same
 *     copy two days in a row; static OFFER_TEMPLATES as fallback).
 *   • ALIEXPRESS / AMAZON / SHEIN / BERSHKA — Claude web-searches real current codes on
 *     Dealabs/Ma-Reduc/Savoo/etc., REWRITES every offer with original
 *     French copy (no duplicate content), refreshes rows whose code already
 *     exists, inserts the new ones, and deletes the oldest codes beyond
 *     MAX_CODES so the page visibly rotates.
 *   • Re-elects a single is_best offer per store, pings Google Indexing
 *     API + sitemap + IndexNow so crawlers see the change same-day.
 *
 * Scheduled daily at 06:00 UTC in vercel.json (replaces the temu-codes
 * schedule — that route stays available for manual runs only; running both
 * would double-rotate Temu).
 */

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
, {
  // Next 14 Data Cache caches route-handler GET fetches — force no-store so
  // supabase-js SELECTs never return stale snapshots (see 2026-07-18 fix).
  global: { fetch: (url: any, init?: any) => fetch(url, { ...init, cache: 'no-store' }) },
});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || 'lockcoupon-cron-2026';

const COUPON_SOURCES = ['Dealabs', 'Ma-Reduc', 'Savoo', 'PlanReduc', 'Radins.com', 'iGraal'];
const MAX_CODES = 12;           // code-type coupons per store, after rotation
const MAX_BONS = 10;            // bon+cashback coupons per store, after rotation
const NEW_EXPIRY_DAYS = 21;     // fresh offers expire → natural churn via cleanup

const SEARCH_STORES: Array<{ slug: string; name: string; url: string }> = [
  { slug: 'aliexpress', name: 'AliExpress', url: 'https://fr.aliexpress.com' },
  { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.fr' },
  { slug: 'shein', name: 'Shein', url: 'https://fr.shein.com' },
  { slug: 'bershka', name: 'Bershka', url: 'https://www.bershka.com/fr' },
];

const STORE_PAGE = (slug: string) => `https://www.lockcoupon.com/codes-promo/${slug}`;

// ─── Claude helpers ──────────────────────────────────────────────────────

async function callClaude(body: Record<string, any>): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 6000, ...body }),
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n') || '';
}

function parseJsonArray<T>(text: string): T[] {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as T[];
  } catch { return []; }
}

// ─── TEMU: fresh copy for the affiliate code pool ────────────────────────

interface FreshCopy {
  title: string;
  description: string;
  discount_value: string;
  discount_type: 'percent' | 'euro';
}

// Same value mix as the static templates: 2×200€, 2×30%, 2×45%, 2×100€, 2×70%.
const TEMU_VALUE_MIX: Array<{ value: string; type: 'percent' | 'euro' }> = [
  { value: '200', type: 'euro' }, { value: '200', type: 'euro' },
  { value: '30', type: 'percent' }, { value: '30', type: 'percent' },
  { value: '45', type: 'percent' }, { value: '45', type: 'percent' },
  { value: '100', type: 'euro' }, { value: '100', type: 'euro' },
  { value: '70', type: 'percent' }, { value: '70', type: 'percent' },
];

async function generateTemuCopy(): Promise<FreshCopy[]> {
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const mix = TEMU_VALUE_MIX.map((m, i) => `${i + 1}. ${m.value}${m.type === 'euro' ? '€' : '%'} (discount_type: "${m.type}", discount_value: "${m.value}")`).join('\n');

  const prompt = `Tu es le rédacteur SEO de LockCoupon.com, site français de codes promo. Nous sommes le ${today} (${month}).

MISSION : rédige 10 offres promo Temu avec des textes 100% ORIGINAUX et DIFFÉRENTS de tout ce que tu as pu écrire avant. Ces textes changent chaque jour pour garder la page fraîche.

Les 10 offres DOIVENT suivre exactement ces valeurs, dans cet ordre :
${mix}

RÈGLES :
- Titre : 45-75 caractères, accrocheur, contient "Temu", JAMAIS deux titres avec la même structure. Varie les angles : urgence, saison (${month}), nouveaux membres, ventes flash, pack coupons, liquidation, exclusivité app, bons plans du jour…
- Description : 55-90 mots en français naturel, concrète (comment utiliser le code, ce qu'il couvre, conditions), ton varié d'une offre à l'autre. Pas de superlatifs vides répétés.
- Interdit : réutiliser des formulations types "Recevez un pack exceptionnel", "Profitez de remises allant jusqu'à". Sois créatif.
- Les offres en euros sont des packs de coupons de bienvenue ; les % sont des réductions panier/sélection.

RÉPONSE : UNIQUEMENT un JSON valide (pas de backticks, pas de texte autour) :
[{"title":"...","description":"...","discount_value":"200","discount_type":"euro"}]`;

  const text = await callClaude({ messages: [{ role: 'user', content: prompt }] });
  const parsed = parseJsonArray<FreshCopy>(text).filter((c) =>
    c.title && c.title.length >= 20 && c.description && c.description.length >= 100 &&
    ['percent', 'euro'].includes(c.discount_type)
  );
  return parsed.length >= 8 ? parsed.slice(0, 10) : [];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

async function refreshTemu(): Promise<Record<string, any>> {
  const { data: store, error } = await supabase
    .from('stores').select('id, name, slug').eq('slug', 'temu').maybeSingle();
  if (error || !store) return { store: 'temu', error: 'store not found' };

  // Fresh AI copy; fall back to the static template pool if generation fails.
  let offers: FreshCopy[] = await generateTemuCopy();
  let copySource = 'ai';
  if (offers.length === 0) {
    copySource = 'templates';
    const uniq: FreshCopy[] = [];
    for (const t of pickRandom(OFFER_TEMPLATES, OFFER_TEMPLATES.length)) {
      if (!uniq.some((u) => u.title === t.title)) {
        uniq.push({ title: t.title, description: t.description, discount_value: t.discount_value, discount_type: t.discount_type });
      }
      if (uniq.length === 10) break;
    }
    offers = uniq;
  }

  // Rotate: delete ALL existing Temu code coupons, then publish today's batch.
  const { data: existing } = await supabase
    .from('coupons').select('id').eq('store_id', store.id).eq('type', 'code');
  if (existing && existing.length > 0) {
    await supabase.from('coupons').delete().in('id', existing.map((c) => c.id));
  }

  const codes = pickRandom(TEMU_CODES, offers.length);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  const rows = offers.map((offer, i) => ({
    store_id: store.id,
    title: offer.title,
    code: codes[i].toLowerCase(),
    description: offer.description,
    discount_value: offer.discount_value,
    discount_type: offer.discount_type,
    type: 'code' as const,
    affiliate_url: TEMU_AFFILIATE_URL,
    expiry_date: expiry.toISOString().split('T')[0],
    is_best: i === 0,
    is_exclusive: i % 2 === 0,
    is_verified: true,
    usage_count: Math.floor(Math.random() * 500) + 50,
    created_at: new Date().toISOString(),
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('coupons').insert(rows).select('id');
  if (insertError) return { store: 'temu', error: insertError.message, deleted: existing?.length || 0 };

  return { store: 'temu', copy: copySource, deleted: existing?.length || 0, inserted: inserted?.length || 0 };
}

// ─── ALIEXPRESS / AMAZON: real codes + creative rewrite + rotation ───────

interface ScrapedOffer {
  title: string;
  description: string;
  code: string | null;
  discount_value: string | null;
  discount_type: 'percent' | 'euro' | 'free' | 'cashback' | null;
  type: 'code' | 'bon' | 'cashback' | null;
  expiry_date: string | null;
}

function buildSearchPrompt(storeName: string): string {
  const today = new Date().toISOString().split('T')[0];
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return `Tu es le chasseur de codes promo de LockCoupon.com. Boutique cible : "${storeName}" (France).

MISSION : utilise web_search pour trouver les codes promo ${storeName} RÉELS et ACTUELS (${month}) sur : ${COUPON_SOURCES.join(', ')}.

RECHERCHES À FAIRE :
- "code promo ${storeName} ${today.substring(0, 7)}"
- "code promo ${storeName} ${month}"
- "${storeName} coupon réduction aujourd'hui"

RÈGLES D'EXTRACTION :
- UNIQUEMENT des codes/offres réellement trouvés dans les résultats. Ne JAMAIS inventer un code.
- Ignore les offres marquées expirées.
- Vise 5 à 8 offres, priorité aux vrais codes alphanumériques ; complète avec les meilleures offres sans code (type "bon").

RÉÉCRITURE (important pour le SEO) :
- title : réécris ENTIÈREMENT avec tes mots, accrocheur, 45-75 caractères, mentionne ${storeName}. INTERDIT de copier le titre du site source.
- description : 55-90 mots, français naturel et original : ce que couvre l'offre, comment l'utiliser, conditions connues. Chaque description doit avoir un ton/angle différent.

RÉPONSE : UNIQUEMENT un JSON valide (pas de backticks) :
[{"title":"...","description":"...","code":"LECODE" ou null,"discount_value":"20" ou null,"discount_type":"percent"|"euro"|"free"|"cashback"|null,"type":"code"|"bon"|"cashback","expiry_date":"2026-08-31" ou null}]

Si RIEN trouvé : []`;
}

async function refreshSearchStore(cfg: { slug: string; name: string; url: string }): Promise<Record<string, any>> {
  const { data: store, error } = await supabase
    .from('stores').select('id, name, slug').eq('slug', cfg.slug).maybeSingle();
  if (error || !store) return { store: cfg.slug, error: 'store not found' };

  const text = await callClaude({
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: buildSearchPrompt(cfg.name) }],
  });
  const found = parseJsonArray<ScrapedOffer>(text).filter((o) => {
    if (!o.title || o.title.length < 15 || !o.description || o.description.length < 80) return false;
    if (o.code && o.code.length > 50) return false;
    if (o.discount_type && !['percent', 'euro', 'free', 'cashback'].includes(o.discount_type)) return false;
    return true;
  }).slice(0, 8);

  const { data: existingRows } = await supabase
    .from('coupons')
    .select('id, title, code, discount_value, discount_type, type, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });
  const existing = existingRows || [];

  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + NEW_EXPIRY_DAYS);
  const defaultExpiryStr = defaultExpiry.toISOString().split('T')[0];

  let inserted = 0, refreshed = 0, errors = 0;
  const knownOffers: OfferLike[] = existing.map((e) => ({
    title: e.title, code: e.code, discount_value: e.discount_value, discount_type: e.discount_type,
  }));

  for (const offer of found) {
    const candidate: OfferLike = {
      title: offer.title, code: offer.code || null,
      discount_value: offer.discount_value || null, discount_type: offer.discount_type || null,
    };

    // Same offer already live? → REFRESH its copy in place instead of
    // skipping: the page content changes daily even when the underlying
    // deal is stable. Matching is deliberately AGGRESSIVE for code-less
    // offers: our creative daily rewrites make titles too different for
    // bigram similarity ("12€ offerts dès 99€" vs "12€ remisés pour 99€ de
    // commande"), so a code-less candidate with the same discount as a
    // code-less existing row IS the same deal (2026-08-02 double-insert).
    const dupIdx = existing.findIndex((e) => {
      const ex: OfferLike = { title: e.title, code: e.code, discount_value: e.discount_value, discount_type: e.discount_type };
      if (isDuplicateOffer(candidate, ex, store.name)) return true;
      if (!candidate.code && !e.code) {
        const bothHaveValue = !!candidate.discount_value && !!e.discount_value;
        if (bothHaveValue && sameDiscount(candidate, ex)) return true;
        if (!bothHaveValue && titleSimilarity(candidate.title, e.title) >= 0.55) return true;
      }
      return false;
    });

    if (dupIdx >= 0) {
      const { error: upErr } = await supabase.from('coupons').update({
        title: offer.title,
        description: offer.description,
        expiry_date: offer.expiry_date || defaultExpiryStr,
        is_verified: true,
      }).eq('id', existing[dupIdx].id);
      if (upErr) errors++; else refreshed++;
      continue;
    }

    const intraDupe = knownOffers.some((k) =>
      isDuplicateOffer(candidate, k, store.name) ||
      (!candidate.code && !k.code && !!candidate.discount_value && !!k.discount_value && sameDiscount(candidate, k))
    );
    if (intraDupe) continue; // intra-batch dupe

    const { error: insErr } = await supabase.from('coupons').insert({
      store_id: store.id,
      title: offer.title,
      description: offer.description,
      code: offer.code || null,
      discount_value: offer.discount_value || null,
      discount_type: offer.discount_type || null,
      type: offer.type || (offer.code ? 'code' : 'bon'),
      expiry_date: offer.expiry_date || defaultExpiryStr,
      is_best: false,
      is_exclusive: false,
      is_verified: true,
      affiliate_url: cfg.url,
      usage_count: Math.floor(Math.random() * 300) + 30,
      created_at: new Date().toISOString(),
    });
    if (insErr) errors++; else { inserted++; knownOffers.push(candidate); }
  }

  // Rotation: keep at most MAX_CODES code-type and MAX_BONS bon/cashback
  // coupons per store — delete the oldest overflow. Hard guarantee against
  // pile-up even when dedup misses a reworded offer.
  let deleted = 0;
  const { data: codeRows } = await supabase
    .from('coupons').select('id, created_at')
    .eq('store_id', store.id).eq('type', 'code')
    .order('created_at', { ascending: false });
  if (codeRows && codeRows.length > MAX_CODES) {
    const overflow = codeRows.slice(MAX_CODES).map((c) => c.id);
    const { error: delErr } = await supabase.from('coupons').delete().in('id', overflow);
    if (!delErr) deleted += overflow.length;
  }
  const { data: bonRows } = await supabase
    .from('coupons').select('id, created_at')
    .eq('store_id', store.id).in('type', ['bon', 'cashback'])
    .order('created_at', { ascending: false });
  if (bonRows && bonRows.length > MAX_BONS) {
    const overflow = bonRows.slice(MAX_BONS).map((c) => c.id);
    const { error: delErr } = await supabase.from('coupons').delete().in('id', overflow);
    if (!delErr) deleted += overflow.length;
  }

  // Re-elect a single best offer: newest row with the highest discount value.
  const { data: allRows } = await supabase
    .from('coupons').select('id, discount_value, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });
  if (allRows && allRows.length > 0) {
    const best = [...allRows].sort((a, b) => {
      const va = parseInt(a.discount_value || '0', 10) || 0;
      const vb = parseInt(b.discount_value || '0', 10) || 0;
      if (vb !== va) return vb - va;
      return (b.created_at || '').localeCompare(a.created_at || '');
    })[0];
    await supabase.from('coupons').update({ is_best: false }).eq('store_id', store.id).eq('is_best', true);
    await supabase.from('coupons').update({ is_best: true }).eq('id', best.id);
  }

  return { store: cfg.slug, found: found.length, inserted, refreshed, deleted, errors };
}

// ─── Handler ─────────────────────────────────────────────────────────────

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
    // Purge globally-expired coupons first so rotation counts are honest.
    const today = new Date().toISOString().split('T')[0];
    const { data: expired } = await supabase
      .from('coupons').select('id').lt('expiry_date', today).not('expiry_date', 'is', null);
    let expiredCleaned = 0;
    if (expired && expired.length > 0) {
      const { error: delErr } = await supabase.from('coupons').delete().in('id', expired.map((c) => c.id));
      if (!delErr) expiredCleaned = expired.length;
    }

    // Search stores run in PARALLEL (each is ~40-60s of Claude web_search;
    // sequential would blow past maxDuration with 4+ stores). Each store
    // only touches its own rows, so no write conflicts.
    const results: Array<Record<string, any>> = [];
    results.push(await refreshTemu());
    const searchResults = await Promise.all(
      SEARCH_STORES.map((cfg) => refreshSearchStore(cfg).catch((e: any) => ({ store: cfg.slug, error: e?.message || 'failed' })))
    );
    results.push(...searchResults);

    // Tell crawlers the flagship pages changed (same-day recrawl).
    const storePages = ['temu', ...SEARCH_STORES.map((s) => s.slug)].map(STORE_PAGE);
    const urls = [
      ...storePages,
      `${STORE_PAGE('temu')}/nouveau-client`,
      `${STORE_PAGE('temu')}/livraison-gratuite`,
    ];
    await Promise.all([
      submitIndexNow(urls),
      pingSitemap(),
      notifyGoogle(storePages),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expired_cleaned: expiredCleaned,
      results,
      pinged: urls.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
