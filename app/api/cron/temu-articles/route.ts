import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// ─── Topics ───────────────────────────────────────────────────────────────────
const TEMU_TOPICS = [
  { category: 'mode femme',             title_fn: (m: string) => `Mode femme Temu ${m} : les meilleures trouvailles à moins de 20€`,             search_query: 'Temu meilleurs vêtements femme tendance populaire best-sellers' },
  { category: 'décoration maison',      title_fn: (m: string) => `Temu déco maison ${m} : 12 articles qui changent tout pour moins de 15€`,      search_query: 'Temu meilleurs produits décoration maison best-sellers populaires' },
  { category: 'gadgets tech',           title_fn: (m: string) => `Gadgets tech Temu ${m} : les petits accessoires qui valent vraiment le détour`, search_query: 'Temu gadgets électroniques accessoires tech populaires pas cher' },
  { category: 'beauté et soins',        title_fn: (m: string) => `Beauté Temu ${m} : les produits skincare et maquillage qu'on a testés`,         search_query: 'Temu produits beauté skincare maquillage best-sellers populaires' },
  { category: 'cuisine',                title_fn: (m: string) => `Cuisine Temu ${m} : ustensiles et gadgets qui rendent la vie plus facile`,       search_query: 'Temu ustensiles cuisine gadgets kitchen best-sellers' },
  { category: 'sport et fitness',       title_fn: (m: string) => `Sport pas cher sur Temu ${m} : équipement et vêtements de fitness à tester`,    search_query: 'Temu équipement sport fitness vêtements sportswear best-sellers' },
  { category: 'mode homme',             title_fn: (m: string) => `Mode homme Temu ${m} : le guide des achats malins à prix cassé`,                search_query: 'Temu meilleurs vêtements homme tendance populaires best-sellers' },
  { category: 'enfants et jouets',      title_fn: (m: string) => `Jouets et mode enfant sur Temu ${m} : ce qui vaut vraiment le coup`,            search_query: 'Temu jouets enfants vêtements enfant best-sellers populaires' },
  { category: 'jardinage et extérieur', title_fn: (m: string) => `Jardin et extérieur Temu ${m} : les bons plans pour aménager sans se ruiner`,   search_query: 'Temu jardinage extérieur terrasse balcon articles populaires' },
  { category: 'accessoires et bijoux',  title_fn: (m: string) => `Accessoires et bijoux Temu ${m} : les pièces qu'on a adoptées`,                 search_query: 'Temu bijoux accessoires sacs ceintures populaires best-sellers' },
  { category: 'rangement',              title_fn: (m: string) => `Organisation maison Temu ${m} : les produits qui changent vraiment les choses`,  search_query: 'Temu rangement organisation maison produits populaires best-sellers' },
  { category: 'animaux de compagnie',   title_fn: (m: string) => `Animalerie Temu ${m} : accessoires et jouets pour chats et chiens à tester`,    search_query: 'Temu produits animaux compagnie chiens chats best-sellers' },
];

// ─── Extract first real product image URL from article HTML ───────────────────
function extractCoverImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;
  const url = m[1];
  if (
    url.startsWith('data:') ||
    url.includes('unsplash') ||
    url.includes('placeholder') ||
    url.includes('picsum')
  )
    return null;
  return url;
}

// ─── Build the prompt ─────────────────────────────────────────────────────────
function buildPrompt(topic: typeof TEMU_TOPICS[0], month: string): string {
  return `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu vas utiliser la recherche web pour trouver de vrais produits Temu puis écrire un article complet.

════ ÉTAPE 1 : RECHERCHES WEB ════

Fais ces recherches dans cet ordre pour collecter des vrais produits et images :

1. Cherche "site:temu.com ${topic.category}" pour trouver de vraies pages produits Temu.
2. Cherche "${topic.search_query} site:temu.com" pour des résultats spécifiques.
3. Cherche "temu ${topic.category} best sellers 2025 2026" pour des avis récents.
4. Pour chaque produit intéressant, cherche son nom + "temu" pour trouver sa page et son image.

IMAGES PRODUITS — C'EST CRUCIAL :
- Les images Temu sont sur img.kwcdn.com ou commencent par https://img.kwcdn.com/
- Cherche "temu [nom produit] img.kwcdn.com" pour trouver les URLs d'images
- Tu peux aussi trouver des images sur des sites d'avis, blogs, ou comparateurs
- Chaque produit DOIT avoir une image — fais des recherches supplémentaires si nécessaire
- N'utilise JAMAIS Unsplash, Pexels, ou des images stock

Collecte au moins 8-10 produits avec : nom exact, prix en €, description, avis si disponible, et URL d'image.

════ ÉTAPE 2 : ÉCRIRE L'ARTICLE ════

Écris un article SEO HTML de 2000+ mots sur les produits ${topic.category} Temu.

STYLE :
- Utilise "nous", "notre équipe", "on a testé" — LockCoupon.com
- Direct, parfois drôle, toujours authentique
- Phrases courtes et percutantes. Commence certains paragraphes par : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "Résultat ?", "Le truc,", "Attention."
- JAMAIS : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez"
- Cite les vrais prix trouvés

STRUCTURE HTML OBLIGATOIRE :

<p>[introduction 2-3 paragraphes engageants avec de vrais prix]</p>

<h2>Pourquoi acheter des produits ${topic.category} sur Temu ?</h2>
[3-4 paragraphes honnêtes : avantages prix/choix ET points d'attention]

<h2>Notre sélection : les meilleurs produits ${topic.category} Temu du moment</h2>

Pour CHAQUE produit (8 à 10 minimum) — cette structure est obligatoire :
<h3>[Nom exact du produit]</h3>
<img src="[URL_IMAGE_REELLE_DU_PRODUIT]" alt="[nom] Temu" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0 20px 0" loading="lazy">
<p><strong>Prix : [X,XX]€</strong></p>
[2-3 paragraphes de description et avis]

⚠️ CHAQUE <h3> DOIT être suivi d'une <img> avec une VRAIE URL trouvée dans tes recherches.
Si tu n'as pas d'image pour un produit, fais une recherche supplémentaire pour en trouver une.
Minimum 5 images différentes dans l'article, idéalement une par produit.

<h2>Tableau comparatif</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0">
<thead><tr style="background:#1a1a1a;color:white"><th style="padding:12px;text-align:left">Produit</th><th style="padding:12px;text-align:center">Prix</th><th style="padding:12px;text-align:center">Note</th><th style="padding:12px;text-align:center">Idéal pour</th></tr></thead>
<tbody>[une ligne par produit]</tbody>
</table>

<h2>Nos astuces pour bien acheter sur Temu</h2>
[5-6 conseils pratiques détaillés]

<h2>Notre verdict honnête</h2>
[2-3 paragraphes avec points positifs ET négatifs réels]

<div style="margin-top:30px">
<h2>Questions fréquentes sur les produits ${topic.category} Temu</h2>
[5 questions avec réponses de 3-4 phrases]
</div>

LIENS INTERNES (2, placés naturellement) :
<a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
<a href="/boutiques">toutes nos boutiques partenaires</a>

MOTS-CLÉS : "Temu ${topic.category}", "produits Temu ${month}", "avis Temu ${topic.category}", "acheter sur Temu", "meilleurs produits Temu"

RÈGLES ABSOLUES :
- PAS de titre H1
- Minimum 2000 mots
- Ton output final est UNIQUEMENT du HTML — pas de texte avant le premier <p>
- Le premier caractère de ta réponse finale DOIT être '<'
- Images : URLs réelles uniquement trouvées via tes recherches — JAMAIS d'Unsplash ou inventées`;
}

// ─── Multi-turn Anthropic API with web_search tool ────────────────────────────
async function callClaudeWithWebSearch(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTurns = 25
): Promise<string> {
  const messages: any[] = [{ role: 'user', content: userPrompt }];

  for (let turn = 0; turn < maxTurns; turn++) {
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
        system: systemPrompt,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 20,
          },
        ],
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude API ${res.status}: ${errText.substring(0, 500)}`);
    }

    const data = await res.json();
    const stopReason = data.stop_reason;
    const content = data.content || [];

    // Append assistant response to conversation
    messages.push({ role: 'assistant', content });

    // If stop_reason is "end_turn" or no more tool use, we're done
    if (stopReason === 'end_turn' || stopReason !== 'tool_use') {
      // Extract final text
      const textBlocks = content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text as string);

      if (textBlocks.length === 0) {
        // Check all messages for text blocks (sometimes text comes in earlier turns)
        const allTexts: string[] = [];
        for (const msg of messages) {
          if (msg.role === 'assistant' && Array.isArray(msg.content)) {
            for (const block of msg.content) {
              if (block.type === 'text' && block.text) {
                allTexts.push(block.text);
              }
            }
          }
        }
        if (allTexts.length === 0) {
          throw new Error('Claude returned no text blocks after all turns');
        }
        // Return last HTML block
        const htmlBlock = [...allTexts].reverse().find((t) => t.trimStart().startsWith('<'));
        return htmlBlock ?? allTexts[allTexts.length - 1];
      }

      const htmlBlock = [...textBlocks].reverse().find((t) => t.trimStart().startsWith('<'));
      return htmlBlock ?? textBlocks[textBlocks.length - 1];
    }

    // Handle tool_use: web_search is server-side, results come back in the
    // same response content as web_search_tool_result blocks.
    // We just need to continue the conversation — the API handles search execution.
    // For server-side tools, we don't need to send tool results back manually.
    // But if there are tool_use blocks that need results, send empty acknowledgment.

    const toolUseBlocks = content.filter((b: any) => b.type === 'tool_use');
    if (toolUseBlocks.length > 0) {
      // For web_search (server-side tool), the results are already in the content
      // as web_search_tool_result blocks. We just continue the conversation.
      // Check if there are already tool results in the content
      const hasServerResults = content.some(
        (b: any) => b.type === 'web_search_tool_result'
      );

      if (hasServerResults) {
        // Server-side tool already executed, just continue by asking Claude to proceed
        messages.push({
          role: 'user',
          content: 'Continue avec les résultats de recherche. Écris l\'article maintenant si tu as assez de données.',
        });
      } else {
        // Should not happen with server-side web_search, but handle gracefully
        const toolResults = toolUseBlocks.map((tb: any) => ({
          type: 'tool_result' as const,
          tool_use_id: tb.id,
          content: 'Search completed.',
        }));
        messages.push({ role: 'user', content: toolResults });
      }
    }
  }

  throw new Error(`Exceeded max turns (${maxTurns}) without completing`);
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
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );

  try {
    // Recency dedup — best-effort, never blocks generation
    let recentTitles: string[] = [];
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(30);
      recentTitles = (data || []).map((p: any) => p.title.toLowerCase());
    } catch {
      /* proceed without recency filter */
    }

    const available = TEMU_TOPICS.filter(
      (t) => !recentTitles.some((rt) => rt.includes(t.category.toLowerCase()))
    );
    const topicPool = available.length > 0 ? available : TEMU_TOPICS;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

    const month = new Date().toLocaleString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    const title = topic.title_fn(month);
    const prompt = buildPrompt(topic, month);

    const systemPrompt = `Tu es Marc, rédacteur senior chez LockCoupon.com avec 8 ans d'expérience shopping en ligne. Tu utilises la recherche web pour trouver de vrais produits Temu avec leurs vraies images (img.kwcdn.com) avant d'écrire. TON OUTPUT FINAL EST UNIQUEMENT DU HTML — tu ne commences JAMAIS par du texte explicatif. Le premier caractère de ta réponse finale est toujours '<'. Tu fais autant de recherches web que nécessaire pour trouver des images réelles de chaque produit.`;

    const rawArticle = await callClaudeWithWebSearch(apiKey, systemPrompt, prompt);

    const content = rawArticle
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .trimStart();

    if (!content) {
      return NextResponse.json(
        { error: 'Article content is empty after cleaning' },
        { status: 500 }
      );
    }

    const plainText = content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';

    const coverImage = extractCoverImage(content);
    const imageCount = (
      content.match(/<img[^>]+src=["'][^"']+["']/gi) || []
    ).length;

    const slug =
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 75) +
      '-' +
      Date.now().toString(36);

    const { error: dbError } = await supabase.from('blog_posts').insert({
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage,
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
      category: topic.category,
      slug,
      words: wordCount,
      images_embedded: imageCount,
      cover_image: coverImage,
      indexed: newPostUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
