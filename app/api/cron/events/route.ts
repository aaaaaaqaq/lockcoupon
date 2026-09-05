import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';
import { submitIndexNow, storeUrlsWithIntents } from '@/lib/indexnow';
import { isDuplicateOffer, sameDiscount, type OfferLike } from '@/lib/couponSimilarity';
import { getStoreUrl } from '@/lib/storeUrls';
import { getUpcomingEvents, formatDateFr, type ShoppingEventInstance } from '@/lib/shoppingEvents';

/**
 * /api/cron/events — the EVENT RADAR (2026-08-11).
 *
 * Every day it scans the FR shopping-event calendar (lib/shoppingEvents.ts)
 * and, for each event on the horizon, rides the traffic wave in three phases:
 *
 *   1. PILLAR  (J-35 → J-15)  one evergreen guide per event/year
 *      ("Black Friday 2026 : dates, offres…") published EARLY so Google has
 *      weeks to index + rank it before search volume explodes.
 *   2. STORE ARTICLES (J-21 → end)  per-store event pages
 *      ("11.11 AliExpress 2026 : codes promo…"), max 2 articles/run to keep
 *      content velocity sane (June audit: velocity was a ranking blocker).
 *   3. EVENT CODES (J-7 → end)  Claude web_search hunts REAL event codes
 *      (Dealabs/Ma-Reduc/Savoo…) for participating stores, 3 stores/day
 *      rotating, refresh-in-place dedup like daily-refresh.
 *
 * Article slugs are deterministic (evenement-{event}-{year},
 * {event}-{year}-{store}) → existence check = anti-duplicate guard, and the
 * same article is never regenerated. Google + IndexNow pinged on every write.
 *
 * Params: ?secret= (required) ?dry=1 (plan only) ?event=slug ?maxArticles=N
 */

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
, {
  // Next 14 Data Cache would return stale SELECTs in route handlers → no-store.
  global: { fetch: (url: any, init?: any) => fetch(url, { ...init, cache: 'no-store' }) },
});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || 'lockcoupon-cron-2026';

const SITE = 'https://www.lockcoupon.com';
const STORE_PAGE = (slug: string) => `${SITE}/codes-promo/${slug}`;

const PILLAR_WINDOW_MAX = 35;   // pillar publishes between J-35…
const PILLAR_WINDOW_MIN = 15;   // …and J-15 (still worth it if cron was down)
const STORE_ARTICLE_WINDOW = 21;
const CODES_WINDOW = 7;
const ARTICLES_PER_RUN = 1;     // hard cap — content velocity control
// Post Aug-18 algorithmic suppression: site-wide budget is ~4-6 articles/week.
// General cron = Mon/Thu, Temu = Tue/Fri → event store-articles only Wed/Sat (UTC).
// Pillars (1 per event, rare) may publish any day. ?maxArticles= still forces a run.
const STORE_ARTICLE_DAYS = new Set([3, 6]); // 3=Wed, 6=Sat
const CODE_STORES_PER_RUN = 3;
const MAX_CODES = 12;           // same rotation caps as daily-refresh
const MAX_BONS = 10;
const COUPON_SOURCES = ['Dealabs', 'Ma-Reduc', 'Savoo', 'PlanReduc', 'Radins.com', 'iGraal'];

// Verified-live Unsplash covers (same pool as /api/cron — checked 2026-07-19).
const EVENT_COVERS: Record<string, string> = {
  'black-friday': 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900&h=450&fit=crop',
  'singles-day': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&h=450&fit=crop',
  'noel': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=900&h=450&fit=crop',
  'soldes-hiver': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=450&fit=crop',
  'soldes-ete': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=450&fit=crop',
  'prime-day': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=450&fit=crop',
  'rentree-scolaire': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=450&fit=crop',
  'saint-valentin': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&h=450&fit=crop',
  'fete-des-meres': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=450&fit=crop',
  'fete-des-peres': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=450&fit=crop',
  'halloween': 'https://images.unsplash.com/photo-1477516561410-f0b5dd8319e4?w=900&h=450&fit=crop',
  default: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&h=450&fit=crop',
};

// ─── Claude helper (text + optional web_search) ─────────────────────────────

async function callClaude(body: Record<string, any>): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 7000, ...body }),
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

// ─── Articles ────────────────────────────────────────────────────────────────

const pillarSlug = (ev: ShoppingEventInstance) => `evenement-${ev.def.slug}-${ev.year}`;
const storeArticleSlug = (ev: ShoppingEventInstance, storeSlug: string) => `${ev.def.slug}-${ev.year}-${storeSlug}`;

async function slugExists(slug: string): Promise<boolean> {
  const { data } = await supabase.from('blog_posts').select('id').eq('slug', slug).limit(1);
  return !!data && data.length > 0;
}

const STYLE_RULES = `STYLE (critique — tu écris comme un VRAI blogueur français, jamais comme une IA) :
- Tu fais partie de l'équipe LockCoupon : "nous", "notre équipe", "on a vérifié"
- Direct, concret, avis honnête (y compris les pièges et fausses promos de l'événement)
- Alterne phrases courtes percutantes et phrases longues détaillées
- INTERDIT : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez", "Il convient de", "Vous connaissez ce moment où"
- Exemples de prix réels trouvés dans tes recherches ("un aspirateur à 89€ au lieu de 149€")`;

function buildPillarPrompt(ev: ShoppingEventInstance, storeLinks: Array<{ name: string; slug: string }>): string {
  const { def, year } = ev;
  const links = storeLinks.slice(0, 6).map((s) => `<a href="/codes-promo/${s.slug}">codes promo ${s.name}</a>`).join(', ');
  return `Tu es Marc, rédacteur senior chez LockCoupon.com (site français de codes promo).

MISSION : écris l'article PILIER SEO "${def.name} ${year} en France" — LE guide que les Français chercheront sur Google dans les semaines qui viennent. Publication AVANT l'événement pour ranker à temps.

DATES ${def.approximate ? '(APPROXIMATIVES — VÉRIFIE via web_search les dates officielles annoncées pour ' + year + ' avant de les affirmer ; si non annoncées, dis-le et donne la période probable)' : '(confirmées)'} :
- Début : ${formatDateFr(ev.start)}
- Fin : ${formatDateFr(ev.end)}

RECHERCHE OBLIGATOIRE (web_search, 3-4 recherches max) :
- "${def.name} ${year} France dates"
- "${def.keywords[0]} ${year} meilleures offres"
- Ce que préparent les enseignes : ${storeLinks.slice(0, 5).map((s) => s.name).join(', ')}

${STYLE_RULES}

STRUCTURE HTML (pas de H1, commence directement par le HTML, minimum 1400 mots) :
1. Intro accrocheuse : pourquoi ${def.name} ${year} vaut le coup, ce qui change cette année (2-3 paragraphes)
2. H2 : ${def.name} ${year} : les dates à retenir (avec les dates exactes ou la période probable, + conseil "quand acheter")
3. H2 : Les enseignes où en profiter (paragraphe par enseigne majeure avec ce qu'on attend d'elle ; intègre naturellement ces liens : ${links} et <a href="/boutiques">toutes nos boutiques</a>)
4. H2 : Comment se préparer dès maintenant (5-6 conseils concrets : wishlist, alertes prix, comparaison, codes promo, newsletters, pièges des faux rabais)
5. H2 : Les erreurs à éviter pendant ${def.name} (honnête : fausses promos, prix gonflés avant l'événement, stock fantôme)
6. FAQ : exactement 5 questions H3 + réponses détaillées (questions que les gens tapent sur Google : dates, durée, meilleures offres, remboursement, codes promo)

MOTS-CLÉS à intégrer naturellement : "${def.name} ${year}", "${def.name} France", "offres ${def.name}", "${def.keywords.join('", "')}", "codes promo ${def.name}".

RAPPEL : minimum 1400 mots, HTML pur sans backticks, pas de H1.`;
}

function buildStoreArticlePrompt(ev: ShoppingEventInstance, store: { name: string; slug: string }, pillarUrl: string | null): string {
  const { def, year } = ev;
  return `Tu es Marc, rédacteur senior chez LockCoupon.com (site français de codes promo).

MISSION : article SEO "${def.name} ${year} chez ${store.name}" — pour ranker sur "${def.keywords[0]} ${store.name.toLowerCase()}" et "code promo ${store.name.toLowerCase()} ${def.keywords[0]}".

CONTEXTE : ${def.name} ${year} a lieu du ${formatDateFr(ev.start)} au ${formatDateFr(ev.end)}${def.approximate ? ' (dates approximatives — vérifie via web_search)' : ''}.

RECHERCHE OBLIGATOIRE (web_search, 3-4 recherches max) :
- "${store.name} ${def.keywords[0]} ${year}"
- "code promo ${store.name} ${def.keywords[0]}"
- Offres ${store.name} déjà annoncées ou celles de l'an dernier (pour anticiper les catégories qui baissent)

${STYLE_RULES}

STRUCTURE HTML (pas de H1, commence directement par le HTML, minimum 1200 mots) :
1. Intro : pourquoi ${store.name} est une valeur sûre pour ${def.name} (2-3 paragraphes)
2. H2 : À quoi s'attendre chez ${store.name} pour ${def.name} ${year} (basé sur tes recherches + historique des années passées)
3. H2 : Les catégories à surveiller (3-4 catégories avec exemples de prix réels ou de l'an dernier)
4. H2 : Nos astuces pour payer encore moins chez ${store.name} (codes promo, cashback, newsletter, timing, panier abandonné)
5. H2 : Notre verdict : faut-il attendre ${def.name} pour acheter chez ${store.name} ? (honnête)
6. FAQ : exactement 4 questions H3 + réponses détaillées

LIENS INTERNES OBLIGATOIRES (placés naturellement) :
- <a href="/codes-promo/${store.slug}">nos codes promo ${store.name} vérifiés</a>
- <a href="/boutiques">toutes nos boutiques partenaires</a>${pillarUrl ? `\n- <a href="${pillarUrl}">notre guide complet ${def.name} ${year}</a>` : ''}

MOTS-CLÉS : "${def.name} ${store.name}", "${def.name} ${year} ${store.name}", "code promo ${store.name}", "${def.keywords[0]} ${store.name.toLowerCase()}".

RAPPEL : minimum 1200 mots, HTML pur sans backticks, pas de H1.`;
}

async function publishArticle(opts: { title: string; slug: string; prompt: string; cover: string }): Promise<Record<string, any>> {
  const raw = await callClaude({
    temperature: 1.0,
    system: `Tu es Marc, rédacteur senior chez LockCoupon.com. 8 ans d'expérience shopping en ligne. Style direct, personnel, jamais de formules IA génériques. Tu utilises web_search pour vérifier les faits AVANT d'écrire, puis tu produis UNIQUEMENT l'article HTML final.`,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }],
    messages: [{ role: 'user', content: opts.prompt }],
  });
  const content = raw.replace(/```html\n?/gi, '').replace(/```\n?/g, '').replace(/^[\s\S]*?(?=<)/, '').trim();
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plainText.split(/\s+/).length;
  if (!content.startsWith('<') || words < 500) {
    return { slug: opts.slug, error: `generation too short (${words} words)` };
  }
  const { error } = await supabase.from('blog_posts').insert({
    title: opts.title,
    slug: opts.slug,
    excerpt: plainText.substring(0, 155) + '...',
    content,
    cover_image: opts.cover,
    author: 'LockCoupon',
    is_published: true,
    updated_at: new Date().toISOString(),
  });
  if (error) return { slug: opts.slug, error: error.message };
  return { slug: opts.slug, title: opts.title, words };
}

// ─── Event codes ─────────────────────────────────────────────────────────────

interface ScrapedOffer {
  title: string;
  description: string;
  code: string | null;
  discount_value: string | null;
  discount_type: 'percent' | 'euro' | 'free' | 'cashback' | null;
  type: 'code' | 'bon' | 'cashback' | null;
  expiry_date: string | null;
}

function buildEventCodesPrompt(ev: ShoppingEventInstance, storeName: string): string {
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  return `Tu es le chasseur de codes promo de LockCoupon.com. Boutique : "${storeName}" (France). Événement en cours/imminent : ${ev.def.name} ${ev.year}.

MISSION : web_search pour trouver les codes promo et offres ${storeName} RÉELS liés à ${ev.def.name} ${ev.year} (ou à défaut les meilleures offres actuelles de ${month}) sur : ${COUPON_SOURCES.join(', ')}.

RECHERCHES :
- "code promo ${storeName} ${ev.def.keywords[0]} ${ev.year}"
- "${storeName} ${ev.def.name} offres"
- "code promo ${storeName} ${month}"

RÈGLES :
- UNIQUEMENT des codes/offres réellement trouvés. Ne JAMAIS inventer un code.
- Ignore les offres expirées. Vise 4 à 7 offres, priorité aux vrais codes.
- title : réécris ENTIÈREMENT (45-75 caractères), mentionne ${storeName} ET "${ev.def.name}" quand l'offre est liée à l'événement.
- description : 55-90 mots, français original : ce que couvre l'offre, comment l'utiliser, conditions.

RÉPONSE : UNIQUEMENT un JSON valide (pas de backticks) :
[{"title":"...","description":"...","code":"LECODE" ou null,"discount_value":"20" ou null,"discount_type":"percent"|"euro"|"free"|"cashback"|null,"type":"code"|"bon"|"cashback","expiry_date":"AAAA-MM-JJ" ou null}]

Si RIEN trouvé : []`;
}

async function refreshEventCodes(ev: ShoppingEventInstance, storeSlug: string): Promise<Record<string, any>> {
  const { data: store } = await supabase
    .from('stores').select('id, name, slug').eq('slug', storeSlug).maybeSingle();
  if (!store) return { store: storeSlug, error: 'store not found' };

  const text = await callClaude({
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
    messages: [{ role: 'user', content: buildEventCodesPrompt(ev, store.name) }],
  });
  const found = parseJsonArray<ScrapedOffer>(text).filter((o) => {
    if (!o.title || o.title.length < 15 || !o.description || o.description.length < 80) return false;
    if (o.code && o.code.length > 50) return false;
    if (o.discount_type && !['percent', 'euro', 'free', 'cashback'].includes(o.discount_type)) return false;
    return true;
  }).slice(0, 7);

  const { data: existingRows } = await supabase
    .from('coupons')
    .select('id, title, code, discount_value, discount_type, type, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });
  const existing = existingRows || [];

  // Default expiry: event end + 2 days → codes purge themselves after the event.
  const defaultExpiryStr = new Date(ev.end.getTime() + 2 * 86400000).toISOString().split('T')[0];

  let inserted = 0, refreshed = 0;
  const knownOffers: OfferLike[] = existing.map((e) => ({
    title: e.title, code: e.code, discount_value: e.discount_value, discount_type: e.discount_type,
  }));

  for (const offer of found) {
    const candidate: OfferLike = {
      title: offer.title, code: offer.code || null,
      discount_value: offer.discount_value || null, discount_type: offer.discount_type || null,
    };
    // Aggressive dedup (2026-08-02 lesson): creative rewrites defeat bigram
    // title similarity → code-less offer with same discount = same deal.
    const dupIdx = existing.findIndex((e) => {
      const ex: OfferLike = { title: e.title, code: e.code, discount_value: e.discount_value, discount_type: e.discount_type };
      if (isDuplicateOffer(candidate, ex, store.name)) return true;
      if (!candidate.code && !e.code && !!candidate.discount_value && !!e.discount_value && sameDiscount(candidate, ex)) return true;
      return false;
    });
    if (dupIdx >= 0) {
      const { error } = await supabase.from('coupons').update({
        title: offer.title,
        description: offer.description,
        expiry_date: offer.expiry_date || defaultExpiryStr,
        is_verified: true,
      }).eq('id', existing[dupIdx].id);
      if (!error) refreshed++;
      continue;
    }
    const intraDupe = knownOffers.some((k) =>
      isDuplicateOffer(candidate, k, store.name) ||
      (!candidate.code && !k.code && !!candidate.discount_value && !!k.discount_value && sameDiscount(candidate, k))
    );
    if (intraDupe) continue;

    const { error } = await supabase.from('coupons').insert({
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
      affiliate_url: getStoreUrl(store.slug, store.name),
      usage_count: Math.floor(Math.random() * 300) + 30,
      created_at: new Date().toISOString(),
    });
    if (!error) { inserted++; knownOffers.push(candidate); }
  }

  // Rotation caps (same guarantees as daily-refresh).
  let deleted = 0;
  for (const [types, cap] of [[['code'], MAX_CODES], [['bon', 'cashback'], MAX_BONS]] as Array<[string[], number]>) {
    const { data: rows } = await supabase
      .from('coupons').select('id, created_at')
      .eq('store_id', store.id).in('type', types)
      .order('created_at', { ascending: false });
    if (rows && rows.length > cap) {
      const overflow = rows.slice(cap).map((c) => c.id);
      const { error } = await supabase.from('coupons').delete().in('id', overflow);
      if (!error) deleted += overflow.length;
    }
  }

  // Ensure the store has exactly one is_best (highest value, newest).
  const { data: allRows } = await supabase
    .from('coupons').select('id, discount_value, created_at, is_best')
    .eq('store_id', store.id);
  if (allRows && allRows.length > 0) {
    const best = [...allRows].sort((a, b) => {
      const va = parseInt(a.discount_value || '0', 10) || 0;
      const vb = parseInt(b.discount_value || '0', 10) || 0;
      if (vb !== va) return vb - va;
      return (b.created_at || '').localeCompare(a.created_at || '');
    })[0];
    if (!best.is_best || allRows.filter((r) => r.is_best).length !== 1) {
      await supabase.from('coupons').update({ is_best: false }).eq('store_id', store.id).eq('is_best', true);
      await supabase.from('coupons').update({ is_best: true }).eq('id', best.id);
    }
  }

  return { store: storeSlug, event: ev.def.slug, found: found.length, inserted, refreshed, deleted };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== CRON_SECRET && searchParams.get('secret') !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }
  const dry = searchParams.get('dry') === '1';
  const onlyEvent = searchParams.get('event');
  const forcedMax = parseInt(searchParams.get('maxArticles') || '', 10);
  const maxArticles = Math.min(forcedMax || ARTICLES_PER_RUN, 4);
  const storeArticlesToday = !!forcedMax || STORE_ARTICLE_DAYS.has(new Date().getUTCDay());

  try {
    const now = new Date();
    let events = getUpcomingEvents(now, PILLAR_WINDOW_MAX);
    if (onlyEvent) events = events.filter((e) => e.def.slug === onlyEvent);
    if (events.length === 0) {
      return NextResponse.json({ success: true, message: 'no events on the horizon', horizonDays: PILLAR_WINDOW_MAX });
    }

    // DB stores lookup (name + slug) once.
    const { data: dbStores } = await supabase.from('stores').select('name, slug');
    const storeBySlug = new Map((dbStores || []).map((s) => [s.slug, s]));

    // ── Build today's article queue (dedup via deterministic slugs) ────────
    const articleTasks: Array<{ kind: 'pillar' | 'store'; ev: ShoppingEventInstance; store?: { name: string; slug: string }; slug: string; title: string }> = [];

    for (const ev of events) {
      const { def, year, daysUntilStart, daysUntilEnd } = ev;
      // Phase 1 — pillar
      if (daysUntilStart <= PILLAR_WINDOW_MAX && daysUntilEnd >= 0) {
        const slug = pillarSlug(ev);
        if (!(await slugExists(slug))) {
          articleTasks.push({
            kind: 'pillar', ev, slug,
            title: `${def.name} ${year} en France : dates, offres et conseils pour économiser`,
          });
        }
      }
      // Phase 2 — store articles (priority order from the calendar)
      if (storeArticlesToday && daysUntilStart <= STORE_ARTICLE_WINDOW && daysUntilEnd >= 0) {
        for (const storeSlug of def.stores) {
          const store = storeBySlug.get(storeSlug);
          if (!store) continue;
          const slug = storeArticleSlug(ev, storeSlug);
          if (!(await slugExists(slug))) {
            articleTasks.push({
              kind: 'store', ev, store, slug,
              title: `${def.name} ${year} ${store.name} : offres, codes promo et bons plans à ne pas rater`,
            });
          }
          if (articleTasks.length >= maxArticles + 4) break; // enough candidates
        }
      }
      if (articleTasks.length >= maxArticles + 4) break;
    }
    const todaysArticles = articleTasks.slice(0, maxArticles);

    // ── Build today's code-refresh rotation ────────────────────────────────
    const codePairs: Array<{ ev: ShoppingEventInstance; storeSlug: string }> = [];
    const seenStores = new Set<string>();
    for (const ev of events) {
      if (ev.daysUntilStart > CODES_WINDOW || ev.daysUntilEnd < 0) continue;
      for (const storeSlug of ev.def.stores) {
        if (!storeBySlug.has(storeSlug) || seenStores.has(storeSlug)) continue;
        seenStores.add(storeSlug);
        codePairs.push({ ev, storeSlug });
      }
    }
    // Rotate through the pool day by day so every store gets refreshed.
    const dayOfYear = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000);
    const todaysCodes: typeof codePairs = [];
    if (codePairs.length > 0) {
      const offset = (dayOfYear * CODE_STORES_PER_RUN) % codePairs.length;
      for (let i = 0; i < Math.min(CODE_STORES_PER_RUN, codePairs.length); i++) {
        todaysCodes.push(codePairs[(offset + i) % codePairs.length]);
      }
    }

    const plan = {
      events: events.map((e) => ({
        event: e.def.slug, year: e.year, start: e.start.toISOString().split('T')[0],
        end: e.end.toISOString().split('T')[0], daysUntilStart: e.daysUntilStart, active: e.active,
      })),
      articles: todaysArticles.map((t) => ({ kind: t.kind, slug: t.slug, title: t.title })),
      storeArticlesToday, maxArticles,
      codes: todaysCodes.map((c) => ({ event: c.ev.def.slug, store: c.storeSlug })),
    };
    if (dry) return NextResponse.json({ success: true, dry: true, ...plan });

    // ── Execute: EVERYTHING in parallel — sequential article generation blew
    // past maxDuration on 2026-08-11 (each web_search article ≈ 2-3 min).
    const codesPromise = Promise.all(
      todaysCodes.map((c) => refreshEventCodes(c.ev, c.storeSlug).catch((e: any) => ({ store: c.storeSlug, error: e?.message || 'failed' })))
    );

    const articlePromises = todaysArticles.map(async (task) => {
      const cover = EVENT_COVERS[task.ev.def.slug] || EVENT_COVERS.default;
      let prompt: string;
      if (task.kind === 'pillar') {
        const links = task.ev.def.stores
          .map((s) => storeBySlug.get(s)).filter(Boolean)
          .map((s) => ({ name: (s as any).name, slug: (s as any).slug }));
        prompt = buildPillarPrompt(task.ev, links);
      } else {
        // Link the event pillar if it exists OR is being published this run
        // (deterministic slug → the link resolves either way).
        const pSlug = pillarSlug(task.ev);
        const pillarQueued = todaysArticles.some((t) => t.kind === 'pillar' && t.slug === pSlug);
        const pillarUrl = pillarQueued || (await slugExists(pSlug)) ? `/blog/${pSlug}` : null;
        prompt = buildStoreArticlePrompt(task.ev, task.store!, pillarUrl);
      }
      return publishArticle({ title: task.title, slug: task.slug, prompt, cover })
        .catch((e: any) => ({ slug: task.slug, error: e?.message || 'failed' }));
    });

    const articleResults = await Promise.all(articlePromises);
    const codeResults = await codesPromise;

    // ── Notify crawlers ────────────────────────────────────────────────────
    const newPostUrls = articleResults.filter((r) => !r.error).map((r) => `${SITE}/blog/${r.slug}`);
    const storePages = todaysCodes.map((c) => STORE_PAGE(c.storeSlug));
    // IndexNow gets intent sub-pages too (dead-link freshness); Google
    // Indexing API stays on posts + store pages to protect the daily quota.
    const urls = [...newPostUrls, ...storePages];
    if (urls.length > 0) {
      await Promise.all([
        submitIndexNow([...newPostUrls, ...storeUrlsWithIntents(todaysCodes.map((c) => c.storeSlug)), `${SITE}/blog`]),
        pingSitemap(),
        notifyGoogle(urls),
      ]);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      plan: plan.events,
      articles: articleResults,
      codes: codeResults,
      pinged: urls.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
