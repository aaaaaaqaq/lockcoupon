import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';
import { submitIndexNow, storeUrlsWithIntents } from '@/lib/indexnow';
import { isDuplicateOffer, sameDiscount, titleSimilarity, type OfferLike } from '@/lib/couponSimilarity';
import { reviewOffer, queueForReview } from '@/lib/couponReview';
import { TEMU_AFFILIATE_URL, TEMU_CODES, TEMU_PINNED_CODES, OFFER_TEMPLATES } from '@/lib/temuOffers';

/**
 * /api/cron/daily-refresh — daily content-freshness rotation for the
 * flagship stores (Temu, AliExpress, Amazon, Shein, Bershka).
 *
 * Every run:
 *   • TEMU — keeps the 10 affiliate-pool code rows STABLE (ids/created_at
 *     never reset); renews expiry when needed, refreshes copy at most every
 *     3 days (2026-09-22 anti-churn rewrite; static OFFER_TEMPLATES fallback).
 *   • ALIEXPRESS / AMAZON / SHEIN (daily) + 4 ROTATION_STORES/day (24-store
 *     pool, each ~every 6 days) — Claude web-searches real current codes on
 *     Dealabs/Ma-Reduc/Savoo/etc., writes original French copy for NEW
 *     offers, only extends validity of offers that already exist (no daily
 *     rewrite), and deletes the oldest codes beyond MAX_CODES.
 *   • Re-elects a single is_best offer per store, pings sitemap + IndexNow.
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

type SearchStore = { slug: string; name: string; url: string };

// TIER A — flagship stores refreshed EVERY day (highest search volume).
const DAILY_STORES: SearchStore[] = [
  { slug: 'aliexpress', name: 'AliExpress', url: 'https://fr.aliexpress.com' },
  { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.fr' },
  { slug: 'shein', name: 'Shein', url: 'https://fr.shein.com' },
];

// TIER B — high-intent stores refreshed on ROTATION (2026-09-07). Each Claude
// web_search pass is ~40-90s; every store runs in parallel but Vercel caps the
// route at 300s and Anthropic rate-limits burst concurrency, so we take
// ROTATION_PER_DAY of these per run, indexed by day-of-year. With 34 stores and
// 4/day each store gets re-searched every ~8-9 days — on top of the update-coupons
// cron that still touches every store 4×/day.
const ROTATION_STORES: SearchStore[] = [
  { slug: 'zalando', name: 'Zalando', url: 'https://www.zalando.fr' },
  { slug: 'cdiscount', name: 'Cdiscount', url: 'https://www.cdiscount.com' },
  { slug: 'fnac', name: 'Fnac', url: 'https://www.fnac.com' },
  { slug: 'decathlon', name: 'Decathlon', url: 'https://www.decathlon.fr' },
  { slug: 'sephora', name: 'Sephora', url: 'https://www.sephora.fr' },
  { slug: 'nike', name: 'Nike', url: 'https://www.nike.com/fr' },
  { slug: 'adidas', name: 'Adidas', url: 'https://www.adidas.fr' },
  { slug: 'asos', name: 'ASOS', url: 'https://www.asos.com/fr' },
  { slug: 'zara', name: 'Zara', url: 'https://www.zara.com/fr' },
  { slug: 'hm', name: 'H&M', url: 'https://www2.hm.com/fr_fr' },
  { slug: 'bershka', name: 'Bershka', url: 'https://www.bershka.com/fr' },
  { slug: 'la-redoute', name: 'La Redoute', url: 'https://www.laredoute.fr' },
  { slug: 'darty', name: 'Darty', url: 'https://www.darty.com' },
  { slug: 'boulanger', name: 'Boulanger', url: 'https://www.boulanger.com' },
  { slug: 'booking', name: 'Booking.com', url: 'https://www.booking.com' },
  { slug: 'uber-eats', name: 'Uber Eats', url: 'https://www.ubereats.com/fr' },
  { slug: 'nocibe-fr', name: 'Nocibé', url: 'https://www.nocibe.fr' },
  { slug: 'kiabi', name: 'Kiabi', url: 'https://www.kiabi.com' },
  { slug: 'veepee', name: 'Veepee', url: 'https://www.veepee.fr' },
  { slug: 'ldlc', name: 'LDLC', url: 'https://www.ldlc.com' },
  { slug: 'back-market', name: 'Back Market', url: 'https://www.backmarket.fr' },
  { slug: 'puma', name: 'Puma', url: 'https://eu.puma.com/fr' },
  { slug: 'mango', name: 'Mango', url: 'https://shop.mango.com/fr' },
  { slug: 'leclerc', name: 'E.Leclerc', url: 'https://www.e.leclerc' },
  // 2026-09-22 expansion — highest-volume newcomers
  { slug: 'lidl', name: 'Lidl', url: 'https://www.lidl.fr' },
  { slug: 'castorama', name: 'Castorama', url: 'https://www.castorama.fr' },
  { slug: 'notino', name: 'Notino', url: 'https://www.notino.fr' },
  { slug: 'lookfantastic', name: 'Lookfantastic', url: 'https://www.lookfantastic.fr' },
  { slug: 'zooplus', name: 'Zooplus', url: 'https://www.zooplus.fr' },
  { slug: 'deliveroo', name: 'Deliveroo', url: 'https://deliveroo.fr' },
  { slug: 'hellofresh', name: 'HelloFresh', url: 'https://www.hellofresh.fr' },
  { slug: 'picard', name: 'Picard', url: 'https://www.picard.fr' },
  { slug: 'etsy', name: 'Etsy', url: 'https://www.etsy.com/fr' },
  { slug: 'flixbus', name: 'FlixBus', url: 'https://www.flixbus.fr' },
];
const ROTATION_PER_DAY = 4;

function dayOfYear(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86_400_000);
}

/** Today's search set: all Tier A + a contiguous rotating window of Tier B.
 *  `?slugs=a,b` overrides for manual/targeted runs. */
function pickSearchStores(slugsParam: string | null): SearchStore[] {
  const all = [...DAILY_STORES, ...ROTATION_STORES];
  if (slugsParam) {
    const want = new Set(slugsParam.split(',').map((s) => s.trim()).filter(Boolean));
    return all.filter((s) => want.has(s.slug));
  }
  const n = ROTATION_STORES.length;
  const offset = (dayOfYear() * ROTATION_PER_DAY) % n;
  const rotation = Array.from({ length: Math.min(ROTATION_PER_DAY, n) }, (_, i) => ROTATION_STORES[(offset + i) % n]);
  return [...DAILY_STORES, ...rotation];
}

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

  // 2026-09-22 anti-churn rewrite (Google Aug-18 suppression): the old
  // behaviour deleted ALL Temu codes and re-inserted 10 rows with new AI copy
  // EVERY day → created_at reset daily, dateModified bumped daily, fake
  // "10 offres ajoutées aujourd'hui" changelog, zero real change. Now:
  //   • existing code rows are KEPT (created_at stable);
  //   • only EXPIRED rows are replaced (with the same code, new expiry);
  //   • copy is refreshed at most every TEMU_COPY_ROTATION_DAYS, and only
  //     when there is a real reason (rotation window reached);
  //   • missing pinned/pool codes are back-filled up to 10 rows.
  const TEMU_COPY_ROTATION_DAYS = 3;
  const TEMU_TARGET = 10;
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: existingRows } = await supabase
    .from('coupons')
    .select('id, code, title, description, expiry_date, created_at, sort_order, discount_value, discount_type')
    .eq('store_id', store.id).eq('type', 'code')
    .order('sort_order', { ascending: true });
  const existing = existingRows || [];

  // Decide whether this run is a copy-rotation run. We key it on the day
  // number so it is deterministic and independent of previous run success.
  const rotationRun = dayOfYear() % TEMU_COPY_ROTATION_DAYS === 0;

  // Renew expiry BEFORE the global purge would delete the row (the handler
  // purges expired coupons before calling us) — a renewed row keeps its id
  // and created_at, a purged+reinserted one would not.
  const soon = new Date(); soon.setDate(soon.getDate() + 5);
  const soonStr = soon.toISOString().split('T')[0];

  const presentCodes = new Set(existing.map((r) => (r.code || '').toLowerCase()));
  const missingPinned = TEMU_PINNED_CODES.map((c) => c.toLowerCase()).filter((c) => !presentCodes.has(c));
  const expired = existing.filter((r) => r.expiry_date && r.expiry_date <= soonStr);
  const slotsToFill = Math.max(0, TEMU_TARGET - existing.length) + missingPinned.length;

  if (!rotationRun && expired.length === 0 && slotsToFill === 0) {
    return { store: 'temu', action: 'noop', kept: existing.length, next_rotation_in_days: TEMU_COPY_ROTATION_DAYS - (dayOfYear() % TEMU_COPY_ROTATION_DAYS) };
  }

  // Fresh AI copy only when we actually need it; static templates as fallback.
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

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  const expiryStr = expiry.toISOString().split('T')[0];

  let refreshed = 0, renewed = 0, inserted = 0, errors = 0;

  // 1) Existing rows: renew expiry if expired; refresh copy only on rotation runs.
  //    Codes and created_at never change → no churn, honest changelog.
  for (let i = 0; i < existing.length; i++) {
    const row = existing[i];
    const isExpired = !!row.expiry_date && row.expiry_date <= soonStr;
    if (!rotationRun && !isExpired) continue;
    const offer = offers[i % offers.length];
    const patch: Record<string, any> = {};
    if (isExpired) { patch.expiry_date = expiryStr; renewed++; }
    if (rotationRun) {
      patch.title = offer.title;
      patch.description = offer.description;
      patch.discount_value = offer.discount_value;
      patch.discount_type = offer.discount_type;
      refreshed++;
    }
    const { error: upErr } = await supabase.from('coupons').update(patch).eq('id', row.id);
    if (upErr) errors++;
  }

  // 2) Back-fill missing rows (first run after this change, or pool drift).
  if (slotsToFill > 0) {
    const pool = TEMU_CODES.map((c) => c.toLowerCase()).filter((c) => !TEMU_PINNED_CODES.map((p) => p.toLowerCase()).includes(c) && !presentCodes.has(c));
    const newCodes = [...missingPinned, ...pickRandom(pool, Math.max(0, slotsToFill - missingPinned.length))].slice(0, slotsToFill);
    const startOrder = existing.length;
    const rows = newCodes.map((code, i) => {
      const offer = offers[(startOrder + i) % offers.length];
      return {
        store_id: store.id,
        title: offer.title,
        code,
        sort_order: startOrder + i + 1,
        description: offer.description,
        discount_value: offer.discount_value,
        discount_type: offer.discount_type,
        type: 'code' as const,
        affiliate_url: TEMU_AFFILIATE_URL,
        expiry_date: expiryStr,
        is_best: false,
        is_exclusive: false,
        is_verified: false, // affiliate-pool code, not independently re-tested
        usage_count: 0,     // real counter only (no fabricated social proof)
        created_at: new Date().toISOString(),
      };
    });
    if (rows.length > 0) {
      const { data: ins, error: insErr } = await supabase.from('coupons').insert(rows).select('id');
      if (insErr) errors++; else inserted = ins?.length || 0;
    }
  }

  // 3) Exactly one is_best: the first pinned code.
  const { data: after } = await supabase.from('coupons').select('id, code, sort_order').eq('store_id', store.id).eq('type', 'code').order('sort_order', { ascending: true });
  if (after && after.length > 0) {
    const pinnedFirst = after.find((r) => (r.code || '').toLowerCase() === TEMU_PINNED_CODES[0]?.toLowerCase()) || after[0];
    await supabase.from('coupons').update({ is_best: false }).eq('store_id', store.id).eq('is_best', true);
    await supabase.from('coupons').update({ is_best: true }).eq('id', pinnedFirst.id);
  }

  return { store: 'temu', action: rotationRun ? 'copy-rotation' : 'maintenance', copy: copySource, kept: existing.length, refreshed, renewed, inserted, errors };
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
  source: string | null;
  source_url: string | null;
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
- Pour CHAQUE offre, renseigne "source" (nom du site) et "source_url" (URL EXACTE de la page où tu as vu l'offre dans les résultats de recherche). Un code sans source_url réelle sera mis en quarantaine au lieu d'être publié — ne fabrique JAMAIS une URL.

RÉÉCRITURE (important pour le SEO) :
- title : réécris ENTIÈREMENT avec tes mots, accrocheur, 45-75 caractères, mentionne ${storeName}. INTERDIT de copier le titre du site source.
- description : 55-90 mots, français naturel et original : ce que couvre l'offre, comment l'utiliser, conditions connues. Chaque description doit avoir un ton/angle différent.

RÉPONSE : UNIQUEMENT un JSON valide (pas de backticks) :
[{"title":"...","description":"...","code":"LECODE" ou null,"discount_value":"20" ou null,"discount_type":"percent"|"euro"|"free"|"cashback"|null,"type":"code"|"bon"|"cashback","expiry_date":"2026-08-31" ou null,"source":"Dealabs","source_url":"https://www.dealabs.com/..."}]

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

  let inserted = 0, refreshed = 0, errors = 0, quarantined = 0;
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
      // 2026-09-22: the deal is unchanged → do NOT rewrite its copy (that was
      // pure daily churn). Only extend validity — the offer was re-found on a
      // trusted aggregator today, which is a genuine re-verification.
      const { error: upErr } = await supabase.from('coupons').update({
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

    // Review gate: a NEW code goes live only with a source_url on a trusted
    // aggregator; anything else waits in coupon_review_queue for a human.
    const verdict = reviewOffer({ code: offer.code || null, source: offer.source, source_url: offer.source_url });
    if (!verdict.live) {
      const q = await queueForReview(supabase, {
        store_id: store.id,
        store_slug: cfg.slug,
        title: offer.title,
        description: offer.description,
        code: offer.code || null,
        discount_value: offer.discount_value || null,
        discount_type: offer.discount_type || null,
        type: offer.type || (offer.code ? 'code' : 'bon'),
        expiry_date: offer.expiry_date || null,
        affiliate_url: cfg.url,
        source: offer.source || null,
        source_url: offer.source_url || null,
        reason: verdict.reason || 'raison inconnue',
        cron: 'daily-refresh',
      });
      if (q === 'queued') quarantined++;
      continue;
    }

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
      usage_count: 0,
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

  return { store: cfg.slug, found: found.length, inserted, refreshed, deleted, quarantined, errors };
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
    const searchStores = pickSearchStores(searchParams.get('slugs'));
    const skipTemu = searchParams.get('temu') === '0';

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
    if (!skipTemu) results.push(await refreshTemu());
    const searchResults = await Promise.all(
      searchStores.map((cfg) => refreshSearchStore(cfg).catch((e: any) => ({ store: cfg.slug, error: e?.message || 'failed' })))
    );
    results.push(...searchResults);

    // Tell crawlers the flagship pages changed (same-day recrawl).
    const touched = [...(skipTemu ? [] : ['temu']), ...searchStores.map((s) => s.slug)];
    const storePages = touched.map(STORE_PAGE);
    // Intent sub-pages included: rotation can 404 or revive them — IndexNow
    // must learn about dead links too (Bing SEO report, Aug 2026).
    const urls = [
      ...storeUrlsWithIntents(touched),
      `${STORE_PAGE('temu')}/nouveau-client`,
      `${STORE_PAGE('temu')}/livraison-gratuite`,
    ];
    // 2026-09-22: stopped daily Google Indexing API pings for coupon pages
    // (API is officially JobPosting/BroadcastEvent-only; daily pings on
    // rewritten pages = churn signal). Sitemap ping + IndexNow (Bing) stay.
    void notifyGoogle; void storePages;
    await Promise.all([
      submitIndexNow(urls),
      pingSitemap(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expired_cleaned: expiredCleaned,
      stores: touched,
      results,
      pinged: urls.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
