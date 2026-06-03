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

// ─── Scrape real Temu product image URLs from search results ──────────────────
async function findTemuImages(
  category: string,
  productNames: string[]
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Search for Temu product images using Google-compatible queries
  const queries = [
    `temu ${category} products site:temu.com`,
    ...productNames.slice(0, 5).map((name) => `"${name}" temu product image`),
  ];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&cx=${process.env.GOOGLE_CSE_ID}&key=${process.env.GOOGLE_API_KEY}&num=5`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const data = await res.json();
        for (const item of data.items || []) {
          const link: string = item.link || '';
          if (
            link.includes('img.kwcdn.com') ||
            link.includes('temu.com') ||
            link.includes('kwcdn')
          ) {
            // Match to a product name
            for (const name of productNames) {
              if (!imageMap.has(name)) {
                imageMap.set(name, link);
                break;
              }
            }
          }
        }
      }
    } catch {
      /* best effort */
    }
  }

  return imageMap;
}

// ─── Extract product names from HTML to find images for them ──────────────────
function extractH3Names(html: string): string[] {
  const matches = html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/gi);
  return [...matches].map((m) => m[1].trim());
}

// ─── Extract first real image URL from article HTML ───────────────────────────
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
  return `Utilise la recherche web pour trouver de vrais produits Temu dans la catégorie "${topic.category}", puis écris un article complet.

════ RECHERCHES ════

Fais plusieurs recherches pour trouver :
1. Des vrais produits Temu ${topic.category} avec leurs prix réels en euros
2. Des avis clients récents (2025-2026)
3. Des images produits — cherche sur Google Images ou des blogs/sites d'avis

Pour les images, cherche :
- "${topic.category} temu product review" (les blogs d'avis incluent souvent des photos)
- "temu ${topic.category} haul" (les hauls ont des photos réelles)
- Les URLs d'images trouvées dans les résultats de recherche (surtout img.kwcdn.com, mais aussi des photos de blogs, avis, YouTube thumbnails)

Collecte 8-10 produits avec : nom exact, prix €, description, et URL d'image si trouvée.

════ ARTICLE HTML ════

RÈGLE CRITIQUE : Ta réponse doit commencer DIRECTEMENT par la balise HTML <p>. 
Aucun texte, aucune explication, aucun commentaire avant. Juste du HTML pur.

Écris un article SEO HTML de 2000+ mots.

STYLE :
- "nous", "notre équipe", "on a testé" — voix de LockCoupon.com
- Direct, parfois drôle, authentique
- Phrases d'accroche variées : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "Résultat ?", "Le truc,", "Attention."
- INTERDIT : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez"

STRUCTURE :

<p>[intro 2-3 paragraphes avec vrais prix]</p>

<h2>Pourquoi acheter des produits ${topic.category} sur Temu ?</h2>
[3-4 paragraphes honnêtes]

<h2>Notre sélection : les meilleurs produits ${topic.category} Temu du moment</h2>

Pour chaque produit (8-10) :
<h3>[Nom exact]</h3>
<img src="[URL_IMAGE_TROUVEE]" alt="[nom] Temu" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0 20px 0" loading="lazy">
<p><strong>Prix : [X,XX]€</strong></p>
[2-3 paragraphes description + avis]

IMAGES — TRÈS IMPORTANT :
- Utilise UNIQUEMENT des URLs d'images que tu as RÉELLEMENT trouvées dans tes recherches web
- Sources acceptées : img.kwcdn.com, blogs, sites d'avis, comparateurs — tant que l'URL est réelle
- Si tu trouves une URL d'image dans un résultat de recherche, utilise-la
- NE JAMAIS inventer une URL d'image
- NE JAMAIS utiliser Unsplash, Pexels, Pixabay, ou des images stock
- Si tu n'as vraiment pas trouvé d'image pour un produit spécifique, OMETS la balise <img> pour ce produit
- Minimum 5 images réelles dans l'article total

<h2>Tableau comparatif</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0">
<thead><tr style="background:#1a1a1a;color:white"><th style="padding:12px;text-align:left">Produit</th><th style="padding:12px;text-align:center">Prix</th><th style="padding:12px;text-align:center">Note</th><th style="padding:12px;text-align:center">Idéal pour</th></tr></thead>
<tbody>[ligne par produit]</tbody>
</table>

<h2>Nos astuces pour bien acheter sur Temu</h2>
[5-6 conseils]

<h2>Notre verdict honnête</h2>
[2-3 paragraphes, positifs ET négatifs]

<div style="margin-top:30px">
<h2>Questions fréquentes</h2>
[5 Q&A]
</div>

LIENS INTERNES :
<a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
<a href="/boutiques">toutes nos boutiques partenaires</a>

MOTS-CLÉS : "Temu ${topic.category}", "produits Temu ${month}", "avis Temu ${topic.category}", "acheter sur Temu"

RAPPEL : Le PREMIER caractère de ta réponse est < — pas de texte avant.`;
}

// ─── Strip Claude reasoning from output, keep only HTML ───────────────────────
function extractHtmlArticle(raw: string): string {
  // Remove markdown code fences
  let cleaned = raw.replace(/```html\n?/gi, '').replace(/```\n?/g, '');

  // Find the first HTML tag and take everything from there
  const htmlStart = cleaned.search(/<(?:p|h[1-6]|div|table|section|article)\b/i);
  if (htmlStart > 0) {
    cleaned = cleaned.substring(htmlStart);
  }

  return cleaned.trim();
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
    // Recency dedup
    let recentTitles: string[] = [];
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(30);
      recentTitles = (data || []).map((p: any) => p.title.toLowerCase());
    } catch {
      /* proceed */
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

    // Single Claude call with server-side web_search
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system: `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu utilises la recherche web pour trouver de vrais produits Temu avec prix réels et images. Ta réponse finale est UNIQUEMENT du HTML. Le PREMIER caractère est toujours '<'. Aucun texte explicatif, aucune narration de tes recherches — uniquement l'article HTML final.`,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 15,
          },
        ],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Claude API error ${response.status}: ${errText.substring(0, 400)}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Extract text blocks from the response
    // With server-side web_search, results and text come back in one response
    const allContent = data.content || [];
    const textBlocks: string[] = allContent
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text as string);

    if (textBlocks.length === 0) {
      return NextResponse.json(
        {
          error: 'Claude returned no text blocks',
          stop_reason: data.stop_reason,
          content_types: allContent.map((b: any) => b.type),
        },
        { status: 500 }
      );
    }

    // Find the text block that contains actual HTML article
    // Claude may have multiple text blocks — reasoning before, article after
    // Take the longest block that starts with HTML, or the last block
    const htmlBlocks = textBlocks
      .map((t) => extractHtmlArticle(t))
      .filter((t) => t.startsWith('<'));

    let content: string;
    if (htmlBlocks.length > 0) {
      // Pick the longest HTML block (the article)
      content = htmlBlocks.reduce((a, b) => (a.length > b.length ? a : b));
    } else {
      // Fallback: concatenate all text and try to extract HTML
      const allText = textBlocks.join('\n');
      content = extractHtmlArticle(allText);
    }

    if (!content || content.length < 200) {
      return NextResponse.json(
        {
          error: 'Article content too short or empty after HTML extraction',
          raw_length: textBlocks.join('').length,
          extracted_length: content?.length || 0,
        },
        { status: 500 }
      );
    }

    // Count images — if less than 5, try to find real Temu images and inject them
    let imageCount = (content.match(/<img[^>]+src=["'][^"']+["']/gi) || []).length;

    if (imageCount < 5) {
      // Extract product names from H3 headings
      const productNames = extractH3Names(content);
      const missingImageProducts: string[] = [];

      // Find which H3s don't have an img right after them
      for (const name of productNames) {
        const h3Pattern = new RegExp(
          `<h3[^>]*>${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h3>\\s*<img`,
          'i'
        );
        if (!h3Pattern.test(content)) {
          missingImageProducts.push(name);
        }
      }

      // Search for images using web search via a second Claude call
      if (missingImageProducts.length > 0) {
        try {
          const imageSearchPrompt = `Search for real product images for these Temu products. For each product, find one real image URL (preferably from img.kwcdn.com, temu.com, blog reviews, or YouTube thumbnails). Return ONLY a JSON array of objects with "name" and "imageUrl" fields. No explanation.

Products:
${missingImageProducts.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;

          const imgRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 4000,
              tools: [
                {
                  type: 'web_search_20250305',
                  name: 'web_search',
                  max_uses: 10,
                },
              ],
              messages: [{ role: 'user', content: imageSearchPrompt }],
            }),
          });

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            const imgTexts = (imgData.content || [])
              .filter((b: any) => b.type === 'text')
              .map((b: any) => b.text)
              .join('\n');

            // Extract JSON from response
            const jsonMatch = imgTexts.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              try {
                const images: { name: string; imageUrl: string }[] = JSON.parse(
                  jsonMatch[0]
                );
                for (const img of images) {
                  if (
                    img.imageUrl &&
                    !img.imageUrl.includes('unsplash') &&
                    !img.imageUrl.includes('placeholder') &&
                    !img.imageUrl.startsWith('data:')
                  ) {
                    // Inject image after the matching H3
                    const escapedName = img.name.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      '\\$&'
                    );
                    const h3Regex = new RegExp(
                      `(<h3[^>]*>${escapedName}</h3>)`,
                      'i'
                    );
                    if (h3Regex.test(content)) {
                      content = content.replace(
                        h3Regex,
                        `$1\n<img src="${img.imageUrl}" alt="${img.name} Temu" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0 20px 0" loading="lazy">`
                      );
                    }
                  }
                }
              } catch {
                /* JSON parse failed, continue without */
              }
            }
          }
        } catch {
          /* image search failed, continue without */
        }
      }
    }

    // Final counts
    const plainText = content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';
    const coverImage = extractCoverImage(content);
    imageCount = (content.match(/<img[^>]+src=["'][^"']+["']/gi) || []).length;

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
