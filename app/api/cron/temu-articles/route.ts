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

// ─── Extract cover image ──────────────────────────────────────────────────────
function extractCoverImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;
  const url = m[1];
  if (url.startsWith('data:') || url.includes('unsplash') || url.includes('placeholder') || url.includes('picsum')) return null;
  return url;
}

// ─── Two-step approach: research then write ───────────────────────────────────

// Step 1: Use Claude + web_search to find real products with image URLs
function buildResearchPrompt(topic: typeof TEMU_TOPICS[0]): string {
  return `Search the web for real Temu products in the category "${topic.category}".

Do these searches:
1. "temu ${topic.category} best sellers 2025 2026 review"
2. "temu ${topic.category} haul review photos"
3. "site:temu.com ${topic.category}"

For each product you find, I need:
- Exact product name
- Price in euros
- A short description
- Customer rating if available
- The product page URL on temu.com if found

Find 8-10 real products with real prices.

IMPORTANT: After your research, output your findings as a simple list format like this:

PRODUCT_LIST_START
1. Name: [exact name]
   Price: [X.XX€]
   Description: [short description]  
   Rating: [X/5 or N/A]
   URL: [temu.com URL or N/A]
2. Name: ...
PRODUCT_LIST_END

Only output the product list. No other commentary.`;
}

// Step 2: Use the products to write the article (no web search needed)
function buildArticlePrompt(topic: typeof TEMU_TOPICS[0], month: string, products: string): string {
  return `Tu es Marc, rédacteur senior chez LockCoupon.com. Écris un article SEO HTML de 2000+ mots sur les produits ${topic.category} Temu.

Voici les produits à utiliser dans l'article (trouvés par recherche web) :

${products}

STYLE :
- "nous", "notre équipe", "on a testé" — voix de LockCoupon.com
- Direct, parfois drôle, authentique
- Phrases d'accroche : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "Résultat ?", "Le truc,", "Attention."
- INTERDIT : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez"

STRUCTURE HTML — commence DIRECTEMENT par <p>, rien avant :

<p>[intro 2-3 paragraphes avec vrais prix]</p>

<h2>Pourquoi acheter des produits ${topic.category} sur Temu ?</h2>
[3-4 paragraphes honnêtes]

<h2>Notre sélection : les meilleurs produits ${topic.category} Temu du moment</h2>

Pour chaque produit :
<h3>[Nom exact]</h3>
<p><strong>Prix : [X,XX]€</strong></p>
[2-3 paragraphes description + avis]

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

LIENS INTERNES (intégrés naturellement) :
<a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
<a href="/boutiques">toutes nos boutiques partenaires</a>

MOTS-CLÉS : "Temu ${topic.category}", "produits Temu ${month}", "avis Temu ${topic.category}", "acheter sur Temu"

RÈGLES :
- PAS de H1
- Minimum 2000 mots
- Le PREMIER caractère est < (pas de texte avant le HTML)
- Pas d'images (elles seront ajoutées séparément)`;
}

// Step 3: Find product images via Bing image search scraping
async function searchProductImages(
  productNames: string[],
  category: string
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  for (const name of productNames.slice(0, 10)) {
    if (imageMap.size >= 8) break;
    try {
      const query = encodeURIComponent(`${name} temu product`);
      const res = await fetch(
        `https://www.bing.com/images/search?q=${query}&first=1&count=10&qft=+filterui:photo-photo`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html',
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      const html = await res.text();

      // Extract image URLs from Bing results (murl = media URL)
      const murlMatches = html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)/gi);
      let match: IteratorResult<RegExpMatchArray>;
      const iter = murlMatches;
      while (!(match = iter.next()).done) {
        const url = match.value[1]
          .replace(/&amp;/g, '&')
          .replace(/\\u002f/gi, '/');
        // Filter: prefer Temu/kwcdn images, accept others, block stock sites
        if (
          url.includes('unsplash') ||
          url.includes('pexels') ||
          url.includes('pixabay') ||
          url.includes('placeholder') ||
          url.includes('shutterstock') ||
          url.includes('istockphoto') ||
          url.includes('gettyimages')
        ) continue;

        // Prefer kwcdn/temu images
        if (
          url.includes('kwcdn.com') ||
          url.includes('temu.com') ||
          url.includes('aliexpress') ||
          url.includes('alicdn') ||
          url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)
        ) {
          imageMap.set(name, url);
          break;
        }
      }
    } catch {
      // Individual product search failed, continue
    }
  }

  // Fallback: search the whole category if we got fewer than 3 images
  if (imageMap.size < 3) {
    try {
      const query = encodeURIComponent(`temu ${category} products`);
      const res = await fetch(
        `https://www.bing.com/images/search?q=${query}&first=1&count=20&qft=+filterui:photo-photo`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html',
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      const html = await res.text();
      const murlMatches = html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)/gi);
      let match: IteratorResult<RegExpMatchArray>;
      const iter = murlMatches;
      let idx = 0;
      while (!(match = iter.next()).done) {
        const url = match.value[1].replace(/&amp;/g, '&');
        if (
          url.includes('unsplash') || url.includes('pexels') ||
          url.includes('pixabay') || url.includes('shutterstock') ||
          url.includes('istockphoto') || url.includes('gettyimages')
        ) continue;

        // Assign to products that don't have images yet
        for (const pn of productNames) {
          if (!imageMap.has(pn) && url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)) {
            imageMap.set(pn, url);
            break;
          }
        }
        if (imageMap.size >= 8) break;
      }
    } catch {
      // Category fallback search failed
    }
  }

  return imageMap;
}

// ─── Claude API call helper ───────────────────────────────────────────────────
async function callClaude(
  apiKey: string,
  opts: {
    system?: string;
    prompt: string;
    useWebSearch?: boolean;
    maxTokens?: number;
  }
): Promise<string> {
  const tools = opts.useWebSearch
    ? [{ type: 'web_search_20250305', name: 'web_search', max_uses: 15 }]
    : undefined;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: opts.maxTokens || 16000,
      ...(opts.system ? { system: opts.system } : {}),
      ...(tools ? { tools } : {}),
      messages: [{ role: 'user', content: opts.prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API ${res.status}: ${errText.substring(0, 500)}`);
  }

  const data = await res.json();

  // Collect ALL text blocks from the response
  const textBlocks: string[] = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text as string);

  if (textBlocks.length === 0) {
    throw new Error(`No text in response. stop_reason=${data.stop_reason}, blocks=${JSON.stringify((data.content || []).map((b: any) => b.type))}`);
  }

  // Return all text concatenated
  const combined = textBlocks.join('\n');
  console.log(`[temu-articles] callClaude: ${textBlocks.length} text blocks, total ${combined.length} chars, first 100: ${combined.substring(0, 100)}`);
  return combined;
}

// ─── Extract HTML article from mixed text ─────────────────────────────────────
function extractHtml(raw: string): string {
  let text = raw
    .replace(/```html\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  // Find the first <p> or <h2> tag
  const idx = text.search(/<(?:p|h[2-6]|div)\b/i);
  if (idx > 0) {
    text = text.substring(idx);
  }

  return text;
}

// ─── Parse product names from article H3 tags ────────────────────────────────
function getH3Names(html: string): string[] {
  const results: string[] = [];
  let match: RegExpExecArray | null;
  const re = /<h3[^>]*>([^<]+)<\/h3>/gi;
  while ((match = re.exec(html)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

// ─── Inject images after H3 tags ──────────────────────────────────────────────
function injectImages(html: string, imageMap: Map<string, string>): string {
  let result = html;
  imageMap.forEach((url, name) => {
    // Escape regex chars in name
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match H3 containing this name (fuzzy — check if H3 text includes name)
    const regex = new RegExp(
      `(<h3[^>]*>[^<]*?${escaped}[^<]*?<\/h3>)(?!\s*<img)`,
      'i'
    );
    if (regex.test(result)) {
      result = result.replace(
        regex,
        `$1\n<img src="${url}" alt="${name} Temu" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0 20px 0" loading="lazy">`
      );
    }
  });
  return result;
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
    // ── Pick topic (dedup against recent) ──
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
      (t) => !recentTitles.some((rt) => rt.includes(t.category.toLowerCase()))
    );
    const topicPool = available.length > 0 ? available : TEMU_TOPICS;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const title = topic.title_fn(month);

    // ── Step 1: Research products with web search ──
    const researchRaw = await callClaude(apiKey, {
      prompt: buildResearchPrompt(topic),
      useWebSearch: true,
      maxTokens: 4000,
    });

    // Extract product list
    const listMatch = researchRaw.match(/PRODUCT_LIST_START([\s\S]*?)PRODUCT_LIST_END/);
    const productList = listMatch ? listMatch[1].trim() : researchRaw;

    if (productList.length < 50) {
      return NextResponse.json({
        error: 'Research returned insufficient product data',
        raw_length: researchRaw.length,
        product_text: productList.substring(0, 200),
      }, { status: 500 });
    }

    console.log(`[temu-articles] Step 1 done. productList length: ${productList.length}, first 200: ${productList.substring(0, 200)}`);

    // ── Step 2: Write article (no web search — pure writing) ──
    const articleRaw = await callClaude(apiKey, {
      system: `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu écris des articles HTML SEO. Ta réponse est UNIQUEMENT du HTML pur. Le premier caractère est toujours '<'. Aucun texte avant le HTML.`,
      prompt: buildArticlePrompt(topic, month, productList),
      useWebSearch: false,
      maxTokens: 16000,
    });

    console.log(`[temu-articles] Step 2 done. articleRaw length: ${articleRaw.length}, first 300: ${articleRaw.substring(0, 300)}`);

    let content = extractHtml(articleRaw);
    console.log(`[temu-articles] After extractHtml: ${content.length} chars, first 200: ${content.substring(0, 200)}`);

    if (!content || content.length < 500) {
      return NextResponse.json({
        error: 'Article too short after extraction',
        raw_length: articleRaw.length,
        extracted_length: content?.length || 0,
        first200: articleRaw.substring(0, 200),
      }, { status: 500 });
    }

    // ── Step 3: Find product images via Bing image search ──
    const productNames = getH3Names(content);
    console.log(`[temu-articles] Step 3: searching images for ${productNames.length} products`);

    if (productNames.length > 0) {
      try {
        const imageMap = await searchProductImages(productNames, topic.category);
        console.log(`[temu-articles] Found ${imageMap.size} images`);
        if (imageMap.size > 0) {
          content = injectImages(content, imageMap);
        }
      } catch (imgErr: any) {
        console.log(`[temu-articles] Image search error: ${imgErr.message}`);
        // Article still usable without images
      }
    }

    // ── Final processing ──
    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';
    const coverImage = extractCoverImage(content);
    const imageCount = (content.match(/<img[^>]+src=["'][^"']+["']/gi) || []).length;

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
      version: 'v3-3step',
      debug_articleRawLength: articleRaw.length,
      debug_contentLength: content.length,
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
