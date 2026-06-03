import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// ─── Coupon-focused topics (builds topical authority for "code promo temu") ───
const TEMU_TOPICS = [
  {
    slug: 'comment-utiliser-code-promo-temu',
    title_fn: (m: string) => `Comment utiliser un code promo Temu — Guide ${m}`,
    keywords: 'code promo temu, utiliser code temu, comment appliquer code promo temu',
    focus: 'Guide pas à pas pour utiliser un code promo Temu : où trouver les meilleurs codes, comment les appliquer, erreurs courantes à éviter.',
  },
  {
    slug: 'temu-vs-shein-codes-promo',
    title_fn: (m: string) => `Temu vs Shein : où trouver les meilleurs codes promo en ${m}`,
    keywords: 'temu vs shein, code promo temu shein, comparatif temu shein réductions',
    focus: 'Comparatif détaillé Temu vs Shein sur les codes promo, réductions, livraison, retours et rapport qualité-prix.',
  },
  {
    slug: 'astuces-economiser-temu',
    title_fn: (m: string) => `Les meilleures astuces pour économiser sur Temu — ${m}`,
    keywords: 'économiser temu, astuces temu, temu pas cher, réduction temu',
    focus: 'Toutes les techniques pour payer moins cher sur Temu : codes promo, parrainage, jeux in-app, timing des commandes, coupons automatiques.',
  },
  {
    slug: 'code-parrainage-temu-guide',
    title_fn: (m: string) => `Code parrainage Temu : guide complet ${m}`,
    keywords: 'code parrainage temu, parrainage temu, lien parrainage temu, inviter ami temu',
    focus: 'Comment fonctionne le parrainage Temu, combien on gagne, comment partager son lien, astuces pour maximiser les récompenses.',
  },
  {
    slug: 'temu-livraison-gratuite-guide',
    title_fn: (m: string) => `Temu livraison gratuite : tous nos conseils — ${m}`,
    keywords: 'temu livraison gratuite, frais de port temu, livraison temu france',
    focus: 'Guide complet sur la livraison Temu en France : frais, délais, transporteurs, suivi, douanes, retours gratuits.',
  },
  {
    slug: 'codes-promo-temu-qui-marchent',
    title_fn: (m: string) => `Codes promo Temu qui marchent vraiment — ${m}`,
    keywords: 'code promo temu qui marche, code temu valide, code promo temu actif',
    focus: 'Comment distinguer les vrais codes promo Temu des faux, où trouver des codes vérifiés, pourquoi certains codes ne fonctionnent pas.',
  },
  {
    slug: 'meilleures-periodes-acheter-temu',
    title_fn: (m: string) => `Quand acheter sur Temu : les meilleures périodes — ${m}`,
    keywords: 'soldes temu, black friday temu, 11.11 temu, quand acheter temu',
    focus: 'Calendrier des meilleures périodes pour acheter sur Temu : soldes, Black Friday, 11.11, rentrée, et comment préparer ses achats.',
  },
  {
    slug: 'temu-france-guide-reductions',
    title_fn: (m: string) => `Temu France : guide complet des réductions — ${m}`,
    keywords: 'temu france, temu réduction, acheter temu france, temu avis france',
    focus: 'Guide complet pour acheter sur Temu depuis la France : fonctionnement, codes promo, livraison, douanes, retours, avis clients.',
  },
  {
    slug: 'erreurs-codes-promo-temu',
    title_fn: (m: string) => `Erreurs à éviter avec les codes promo Temu — ${m}`,
    keywords: 'code promo temu erreur, code temu ne marche pas, problème code promo temu',
    focus: 'Les erreurs les plus courantes avec les codes promo Temu et comment les éviter : expiration, conditions, cumul, compte existant.',
  },
  {
    slug: 'temu-premiere-commande',
    title_fn: (m: string) => `Temu première commande : maximiser ses économies — ${m}`,
    keywords: 'temu première commande, temu nouveau client, première commande temu réduction',
    focus: 'Comment économiser un maximum sur sa première commande Temu : code nouveau client, parrainage, jeux in-app, astuces panier.',
  },
  {
    slug: 'cumuler-reductions-temu',
    title_fn: (m: string) => `Comment cumuler les réductions sur Temu — ${m}`,
    keywords: 'cumuler code promo temu, cumuler réduction temu, temu plusieurs codes',
    focus: 'Ce qu\'on peut cumuler sur Temu (et ce qu\'on ne peut pas) : codes promo, parrainage, coupons in-app, jeux, offres flash.',
  },
  {
    slug: 'temu-soldes-dates-astuces',
    title_fn: (m: string) => `Temu soldes ${m} : dates et astuces pour en profiter`,
    keywords: 'soldes temu, promotion temu, offres temu, vente flash temu',
    focus: 'Calendrier des soldes et ventes flash Temu, comment s\'y préparer, quels produits cibler, et comment maximiser les économies.',
  },
];

// ─── Build prompt ─────────────────────────────────────────────────────────────
function buildPrompt(topic: typeof TEMU_TOPICS[0], month: string): string {
  return `Tu es Marc, rédacteur senior chez LockCoupon.com. Écris un article SEO de 2000+ mots en HTML.

SUJET : ${topic.focus}

MOTS-CLÉS À INTÉGRER : ${topic.keywords}

STYLE :
- "nous", "notre équipe", "on a testé" — voix de LockCoupon.com
- Direct, parfois drôle, authentique. Comme un pote qui s'y connaît.
- Phrases d'accroche variées : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "Résultat ?", "Le truc,", "Attention."
- INTERDIT : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez"

STRUCTURE HTML — commence DIRECTEMENT par <p>, rien avant :

<p>[intro 2-3 paragraphes accrocheurs qui posent le problème]</p>

[4-6 sections H2 avec contenu détaillé, pratique et actionnable]

<h2>Nos astuces exclusives</h2>
[5-6 conseils pratiques et concrets]

<div style="margin-top:30px">
<h2>Questions fréquentes</h2>
[5 Q&A pertinentes en HTML avec les balises appropriées]
</div>

LIENS INTERNES (intégrés naturellement dans le texte) :
<a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
<a href="/codes-promo/temu/nouveau-client">code promo Temu nouveau client</a>
<a href="/codes-promo/temu/livraison-gratuite">livraison gratuite Temu</a>
<a href="/codes-promo/temu/parrainage">parrainage Temu</a>
<a href="/boutiques">toutes nos boutiques</a>
<a href="/guide-achat">guide d'achat</a>

RÈGLES :
- PAS de H1 (le CMS l'ajoute)
- Minimum 2000 mots
- Le PREMIER caractère est < (pas de texte avant le HTML)
- PAS d'images — article textuel uniquement
- Mentionne des prix réalistes (€) et des exemples concrets
- Inclus le mois actuel (${month}) naturellement dans le texte`;
}

// ─── Claude API call ──────────────────────────────────────────────────────────
async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu écris des articles HTML SEO sur les codes promo et bons plans. Ta réponse est UNIQUEMENT du HTML pur. Le premier caractère est toujours '<'. Aucun texte avant le HTML.`,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API ${res.status}: ${errText.substring(0, 500)}`);
  }

  const data = await res.json();
  const textBlocks: string[] = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text as string);

  if (textBlocks.length === 0) {
    throw new Error('No text in response');
  }

  return textBlocks.join('\n');
}

// ─── Extract HTML ─────────────────────────────────────────────────────────────
function extractHtml(raw: string): string {
  let text = raw
    .replace(/```html\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  const idx = text.search(/<(?:p|h[2-6]|div)\b/i);
  if (idx > 0) {
    text = text.substring(idx);
  }

  return text;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== (process.env.CRON_SECRET || 'lockcoupon-cron-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

  try {
    // Recency dedup
    let recentTitles: string[] = [];
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(30);
      recentTitles = (data || []).map((p: any) => p.title.toLowerCase());
    } catch { /* proceed */ }

    const available = TEMU_TOPICS.filter(
      (t) => !recentTitles.some((rt) => rt.includes(t.slug.replace(/-/g, ' ')))
    );
    const topicPool = available.length > 0 ? available : TEMU_TOPICS;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const title = topic.title_fn(month);
    const prompt = buildPrompt(topic, month);

    // Single Claude call — no web search needed for coupon guides
    const articleRaw = await callClaude(apiKey, prompt);
    const content = extractHtml(articleRaw);

    if (!content || content.length < 500) {
      return NextResponse.json({
        error: 'Article too short',
        raw_length: articleRaw.length,
        extracted_length: content?.length || 0,
      }, { status: 500 });
    }

    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';

    const slug =
      topic.slug +
      '-' +
      Date.now().toString(36);

    const { error: dbError } = await supabase.from('blog_posts').insert({
      title,
      slug,
      excerpt,
      content,
      cover_image: null,
      author: 'LockCoupon',
      is_published: true,
      updated_at: new Date().toISOString(),
    });

    if (dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 });

    const newPostUrl = `https://www.lockcoupon.com/blog/${slug}`;
    await pingSitemap();
    await notifyGoogle([newPostUrl, 'https://www.lockcoupon.com/blog']);

    return NextResponse.json({
      success: true,
      title,
      slug,
      words: wordCount,
      indexed: newPostUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
