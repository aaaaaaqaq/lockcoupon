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
  { category: 'mode femme',            title_fn: (m: string) => `Mode femme Temu ${m} : les meilleures trouvailles à moins de 20€`,            search_query: 'Temu meilleurs vêtements femme tendance populaire best-sellers' },
  { category: 'décoration maison',     title_fn: (m: string) => `Temu déco maison ${m} : 12 articles qui changent tout pour moins de 15€`,     search_query: 'Temu meilleurs produits décoration maison best-sellers populaires' },
  { category: 'gadgets tech',          title_fn: (m: string) => `Gadgets tech Temu ${m} : les petits accessoires qui valent vraiment le détour`, search_query: 'Temu gadgets électroniques accessoires tech populaires pas cher' },
  { category: 'beauté et soins',       title_fn: (m: string) => `Beauté Temu ${m} : les produits skincare et maquillage qu'on a testés`,        search_query: 'Temu produits beauté skincare maquillage best-sellers populaires' },
  { category: 'cuisine',               title_fn: (m: string) => `Cuisine Temu ${m} : ustensiles et gadgets qui rendent la vie plus facile`,      search_query: 'Temu ustensiles cuisine gadgets kitchen best-sellers' },
  { category: 'sport et fitness',      title_fn: (m: string) => `Sport pas cher sur Temu ${m} : équipement et vêtements de fitness à tester`,   search_query: 'Temu équipement sport fitness vêtements sportswear best-sellers' },
  { category: 'mode homme',            title_fn: (m: string) => `Mode homme Temu ${m} : le guide des achats malins à prix cassé`,               search_query: 'Temu meilleurs vêtements homme tendance populaires best-sellers' },
  { category: 'enfants et jouets',     title_fn: (m: string) => `Jouets et mode enfant sur Temu ${m} : ce qui vaut vraiment le coup`,           search_query: 'Temu jouets enfants vêtements enfant best-sellers populaires' },
  { category: 'jardinage et extérieur',title_fn: (m: string) => `Jardin et extérieur Temu ${m} : les bons plans pour aménager sans se ruiner`,  search_query: 'Temu jardinage extérieur terrasse balcon articles populaires' },
  { category: 'accessoires et bijoux', title_fn: (m: string) => `Accessoires et bijoux Temu ${m} : les pièces qu'on a adoptées`,                search_query: 'Temu bijoux accessoires sacs ceintures populaires best-sellers' },
  { category: 'rangement et organisation', title_fn: (m: string) => `Organisation maison Temu ${m} : les produits qui changent vraiment les choses`, search_query: 'Temu rangement organisation maison produits populaires best-sellers' },
  { category: 'animaux de compagnie',  title_fn: (m: string) => `Animalerie Temu ${m} : accessoires et jouets pour chats et chiens à tester`,   search_query: 'Temu produits animaux compagnie chiens chats best-sellers' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductData {
  name: string;
  price: string;
  description: string;
  avis: string;
  product_url: string | null;
  image_url: string | null;
}

// ─── Phase 1: research products via Claude + web_search ───────────────────────
async function researchProducts(topic: typeof TEMU_TOPICS[0], apiKey: string): Promise<ProductData[]> {
  const prompt = `Tu recherches des produits Temu réels pour la catégorie "${topic.category}".

Fais ces recherches web :
1. "${topic.search_query}"
2. "temu ${topic.category} avis 2026 meilleur"
3. "site:temu.com ${topic.category}"

Pour chaque produit trouvé, extrait :
- nom exact du produit (tel qu'il apparaît sur Temu)
- prix en euros
- description courte (2-3 phrases sur le produit)
- avis clients / points positifs et négatifs
- URL de la page produit temu.com si tu la vois dans les résultats (format : https://www.temu.com/...)

Réponds UNIQUEMENT avec un JSON valide — aucun texte avant ou après, aucun bloc \`\`\` :
[
  {
    "name": "Nom exact du produit",
    "price": "X.XX€",
    "description": "Description courte du produit",
    "avis": "Points positifs et négatifs",
    "product_url": "https://www.temu.com/..." ou null
  }
]

Trouve au minimum 8 produits. Si rien trouvé, réponds : []`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const texts = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text as string);

  // Take the last text block that looks like a JSON array
  const jsonBlock = [...texts].reverse().find(t => t.trim().startsWith('['));
  if (!jsonBlock) return [];

  try {
    const cleaned = jsonBlock.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const arr = JSON.parse(cleaned);
    return Array.isArray(arr) ? arr.slice(0, 10) : [];
  } catch { return []; }
}

// ─── Phase 2: fetch og:image from real Temu product pages ────────────────────
async function fetchTemuOgImage(productUrl: string): Promise<string | null> {
  try {
    const res = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    // Read only the first 40 KB — enough to capture <head> with og:image
    const reader = res.body?.getReader();
    if (!reader) return null;
    let html = '';
    while (html.length < 40000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
      if (html.includes('</head>')) break;
    }
    reader.cancel().catch(() => {});

    // og:image (either attribute order)
    const m =
      html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (m && m[1] && (m[1].includes('img.kwcdn.com') || m[1].includes('kwcdn.com'))) return m[1];

    // Fallback: any img.kwcdn.com URL in the page head
    const cdn = html.match(/https:\/\/(?:img|s)\.kwcdn\.com\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i);
    if (cdn) return cdn[0];

    return null;
  } catch { return null; }
}

async function enrichWithImages(products: ProductData[]): Promise<ProductData[]> {
  return Promise.all(
    products.map(async (p) => {
      if (!p.product_url) return p;
      try {
        const url = new URL(p.product_url);
        if (!url.hostname.endsWith('temu.com')) return p;
      } catch { return p; }
      const imageUrl = await fetchTemuOgImage(p.product_url);
      return { ...p, image_url: imageUrl };
    })
  );
}

// ─── Phase 3: write article (no tools — pure writing, no leakage) ─────────────
function buildWritePrompt(products: ProductData[], topic: typeof TEMU_TOPICS[0], month: string): string {
  const productList = products.map((p, i) =>
    `Produit ${i + 1}: ${p.name} | Prix: ${p.price} | Image: ${p.image_url || 'AUCUNE'} | URL: ${p.product_url || 'N/A'}
Description: ${p.description}
Avis: ${p.avis}`
  ).join('\n\n');

  return `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu écris pour de vraies personnes, jamais comme une IA.

Voici les ${products.length} produits Temu réels que tu as trouvés pour la catégorie "${topic.category}" :

${productList}

Écris maintenant un article SEO HTML de 2000 mots minimum sur ces produits.

STYLE :
- Utilise "nous", "notre équipe", "on a testé"
- Direct, parfois drôle, toujours authentique
- Commence certains paragraphes par : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "OK,", "Résultat ?", "Le truc,", "Attention."
- JAMAIS : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez", "Vous connaissez ce moment où"
- Cite les vrais prix des produits fournis

STRUCTURE HTML OBLIGATOIRE :

1. Introduction (2-3 paragraphes — accroche avec de vrais prix)

2. <h2>Pourquoi acheter des produits ${topic.category} sur Temu ?</h2>
   3-4 paragraphes : avantages et points d'attention honnêtes

3. <h2>Notre sélection : les meilleurs produits ${topic.category} Temu du moment</h2>
   Pour CHAQUE produit de la liste, dans cet ordre EXACT :

   <h3>[Nom du produit]</h3>
   [UNIQUEMENT si l'image du produit n'est PAS "AUCUNE" :]
   <img src="[URL_IMAGE_FOURNIE]" alt="[nom produit] Temu" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0 20px 0" loading="lazy">
   <p><strong>Prix : [prix fourni]</strong></p>
   [2-3 paragraphes de description + avis]

4. <h2>Tableau comparatif</h2>
   <table style="width:100%;border-collapse:collapse;margin:20px 0">
   <thead><tr style="background:#1a1a1a;color:white"><th style="padding:12px;text-align:left">Produit</th><th style="padding:12px;text-align:center">Prix</th><th style="padding:12px;text-align:center">Note</th><th style="padding:12px;text-align:center">Idéal pour</th></tr></thead>
   <tbody>[une ligne par produit]</tbody></table>

5. <h2>Nos astuces pour bien acheter sur Temu</h2>
   5-6 conseils concrets

6. <h2>Notre verdict honnête</h2>
   2-3 paragraphes avec points positifs ET négatifs

7. FAQ :
   <div style="margin-top:30px">
   <h2>Questions fréquentes sur les produits ${topic.category} Temu</h2>
   [5 questions avec réponses de 3-4 phrases]
   </div>

LIENS INTERNES (2, dans le texte) :
- <a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
- <a href="/boutiques">toutes nos boutiques partenaires</a>

MOTS-CLÉS : "Temu ${topic.category}", "produits Temu ${month}", "avis Temu ${topic.category}", "acheter sur Temu"

RÈGLES ABSOLUES :
- PAS de titre H1 (le CMS l'ajoute)
- Commence DIRECTEMENT par le premier <p> ou <h2> — ZÉRO texte de planification ou d'explication avant le HTML
- Les balises <img> : insère UNIQUEMENT les URLs fournies ci-dessus marquées différemment de "AUCUNE"
- Minimum 2000 mots`;
}

// ─── Extract first real product image from HTML (for cover_image) ─────────────
function extractCoverImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;
  const url = m[1];
  if (url.startsWith('data:') || url.includes('unsplash') || url.includes('placeholder') || url.includes('picsum')) return null;
  return url;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== (process.env.CRON_SECRET || 'lockcoupon-cron-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

  try {
    // Recency dedup — best-effort only, never blocks generation
    let recentTitles: string[] = [];
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(30);
      recentTitles = (data || []).map((p: any) => p.title.toLowerCase());
    } catch { /* proceed without filter */ }

    const available = TEMU_TOPICS.filter(
      (t) => !recentTitles.some((rt) => rt.includes(t.category.toLowerCase()))
    );
    const topicPool = available.length > 0 ? available : TEMU_TOPICS;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const title = topic.title_fn(month);

    // ── Phase 1: research real products (Claude + web_search) ──────────────
    const products = await researchProducts(topic, apiKey);
    if (products.length === 0) {
      return NextResponse.json({ error: 'Research phase returned no products' }, { status: 500 });
    }

    // ── Phase 2: enrich products with real Temu og:image URLs ──────────────
    const enriched = await enrichWithImages(products);
    const withImages = enriched.filter((p) => p.image_url).length;

    // ── Phase 3: write article (no tools — zero deliberation leakage) ──────
    const writePrompt = buildWritePrompt(enriched, topic, month);

    const writeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu reçois une liste de vrais produits Temu avec leurs données. Tu écris directement l'article HTML — aucun texte de planification, aucune explication, aucun bloc de code. Tu commences DIRECTEMENT par le HTML.`,
        messages: [{ role: 'user', content: writePrompt }],
      }),
    });

    if (!writeRes.ok) {
      const err = await writeRes.text();
      return NextResponse.json({ error: `Write phase API error: ${err.substring(0, 300)}` }, { status: 500 });
    }

    const writeData = await writeRes.json();

    // Take only the last (and typically only) text block — no tool use in this call
    const textBlocks = (writeData.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text as string);

    // Use last block that starts with HTML, fallback to last block
    const rawContent =
      [...textBlocks].reverse().find((t) => t.trimStart().startsWith('<')) ||
      textBlocks[textBlocks.length - 1] ||
      '';

    if (!rawContent.trim()) {
      return NextResponse.json({ error: 'Write phase returned empty content' }, { status: 500 });
    }

    const content = rawContent
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .trimStart();

    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';

    const coverImage = extractCoverImage(content);
    const imgMatches = content.match(/<img[^>]+src=["'][^"']+["']/gi) || [];
    const imageCount = imgMatches.length;

    const slug =
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
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

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    const newPostUrl = `https://www.lockcoupon.com/blog/${slug}`;
    await pingSitemap();
    await notifyGoogle([newPostUrl, 'https://www.lockcoupon.com/blog']);

    return NextResponse.json({
      success: true,
      title,
      category: topic.category,
      slug,
      words: wordCount,
      products_found: products.length,
      products_with_images: withImages,
      images_embedded: imageCount,
      cover_image: coverImage,
      indexed: newPostUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
