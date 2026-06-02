import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// ─── Temu product topics ──────────────────────────────────────────────────────
const TEMU_TOPICS = [
  {
    category: 'mode femme',
    title_fn: (m: string) => `Mode femme Temu ${m} : les meilleures trouvailles à moins de 20€`,
    search_query: 'Temu meilleurs vêtements femme tendance populaire best-sellers',
  },
  {
    category: 'décoration maison',
    title_fn: (m: string) => `Temu déco maison ${m} : 12 articles qui changent tout pour moins de 15€`,
    search_query: 'Temu meilleurs produits décoration maison best-sellers populaires',
  },
  {
    category: 'gadgets tech',
    title_fn: (m: string) => `Gadgets tech Temu ${m} : les petits accessoires qui valent vraiment le détour`,
    search_query: 'Temu gadgets électroniques accessoires tech populaires pas cher',
  },
  {
    category: 'beauté et soins',
    title_fn: (m: string) => `Beauté Temu ${m} : les produits skincare et maquillage qu'on a testés`,
    search_query: 'Temu produits beauté skincare maquillage best-sellers populaires',
  },
  {
    category: 'cuisine',
    title_fn: (m: string) => `Cuisine Temu ${m} : ustensiles et gadgets qui rendent la vie plus facile`,
    search_query: 'Temu ustensiles cuisine gadgets kitchen best-sellers',
  },
  {
    category: 'sport et fitness',
    title_fn: (m: string) => `Sport pas cher sur Temu ${m} : équipement et vêtements de fitness à tester`,
    search_query: 'Temu équipement sport fitness vêtements sportswear best-sellers',
  },
  {
    category: 'mode homme',
    title_fn: (m: string) => `Mode homme Temu ${m} : le guide des achats malins à prix cassé`,
    search_query: 'Temu meilleurs vêtements homme tendance populaires best-sellers',
  },
  {
    category: 'enfants et jouets',
    title_fn: (m: string) => `Jouets et mode enfant sur Temu ${m} : ce qui vaut vraiment le coup`,
    search_query: 'Temu jouets enfants vêtements enfant best-sellers populaires',
  },
  {
    category: 'jardinage et extérieur',
    title_fn: (m: string) => `Jardin et extérieur Temu ${m} : les bons plans pour aménager sans se ruiner`,
    search_query: 'Temu jardinage extérieur terrasse balcon articles populaires',
  },
  {
    category: 'accessoires et bijoux',
    title_fn: (m: string) => `Accessoires et bijoux Temu ${m} : les pièces qu'on a adoptées`,
    search_query: 'Temu bijoux accessoires sacs ceintures populaires best-sellers',
  },
  {
    category: 'rangement et organisation',
    title_fn: (m: string) => `Organisation maison Temu ${m} : les produits qui changent vraiment les choses`,
    search_query: 'Temu rangement organisation maison produits populaires best-sellers',
  },
  {
    category: 'animaux de compagnie',
    title_fn: (m: string) => `Animalerie Temu ${m} : accessoires et jouets pour chats et chiens à tester`,
    search_query: 'Temu produits animaux compagnie chiens chats best-sellers',
  },
];

// ─── Extract first real product image from generated HTML ────────────────────
function extractCoverImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  const url = match[1];
  if (
    url.startsWith('data:') ||
    url.includes('unsplash') ||
    url.includes('placeholder') ||
    url.includes('via.placeholder') ||
    url.includes('picsum')
  ) return null;
  return url;
}

// ─── Build the combined research + writing prompt ────────────────────────────
function buildTemuPrompt(topic: typeof TEMU_TOPICS[0], month: string): string {
  return `Tu es Marc, rédacteur senior chez LockCoupon.com, un site de bons plans et codes promo français. Tu as 8 ans d'expérience dans le shopping en ligne. Tu écris pour de VRAIES personnes, pas pour des algorithmes.

MISSION EN DEUX ÉTAPES :

════════════════════════════════════════
ÉTAPE 1 — RECHERCHE WEB (OBLIGATOIRE)
════════════════════════════════════════
Fais AU MINIMUM 4 recherches web pour trouver :

Recherche 1 : "${topic.search_query}"
Recherche 2 : "temu ${topic.category} avis test 2026"
Recherche 3 : "temu.com ${topic.category} best seller img.kwcdn.com"
Recherche 4 : "[nom d'un produit spécifique trouvé] temu image"

Pour CHAQUE produit trouvé, note impérativement :
- Nom exact du produit tel qu'il apparaît sur Temu
- Prix réel en euros
- Description, avantages, inconvénients
- Avis clients si disponibles
- URL d'image RÉELLE du produit — cherche spécifiquement sur :
  * img.kwcdn.com (CDN officiel Temu, ex: https://img.kwcdn.com/product/...)
  * s.kwcdn.com
  * Pages produit temu.com qui contiennent des balises og:image ou src d'image
  * Blogs/sites d'avis qui ont intégré des photos du produit Temu

⚠️ RÈGLE IMAGE STRICTE :
- Tu DOIS trouver des URLs d'images réelles pour AU MINIMUM 5 produits
- Si tu ne trouves pas assez d'images → fais des recherches supplémentaires
- Cherche "[produit] temu photo", "[produit] temu review image", etc.
- N'utilise JAMAIS Unsplash, stock photos, ou images génériques
- N'invente JAMAIS une URL d'image

════════════════════════════════════════
ÉTAPE 2 — RÉDACTION (2000 mots minimum)
════════════════════════════════════════

STYLE D'ÉCRITURE :
- Tu fais partie de l'équipe LockCoupon. Utilise "nous", "notre équipe", "on a testé"
- Direct, parfois drôle, toujours authentique — jamais comme une IA
- Commence certains paragraphes par : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "OK,", "Résultat ?", "Le truc,", "Attention.", "Pour être franc,"
- JAMAIS : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez", "Il convient de", "Vous connaissez ce moment où"
- Prix réels trouvés (ex : "3,99€", "12,50€", "8,99€")
- Anecdotes personnelles ("La semaine dernière, on a commandé...")

STRUCTURE HTML OBLIGATOIRE :

1. Introduction (2-3 paragraphes engageants — cite des prix réels dès le début)

2. <h2>Pourquoi acheter des produits ${topic.category} sur Temu ?</h2>
   3-4 paragraphes : avantages (prix, choix, livraison) et points d'attention honnêtes

3. <h2>Notre sélection : les meilleurs produits ${topic.category} Temu du moment</h2>

   Pour CHAQUE produit (8 à 10 produits), utilise EXACTEMENT ce format :

   <h3>[Nom exact du produit]</h3>
   [SI tu as trouvé une vraie URL d'image pour CE produit, insère IMMÉDIATEMENT ici :]
   <img src="[URL_IMAGE_REELLE_TROUVEE_VIA_RECHERCHE]" alt="[nom produit] Temu" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0 20px 0" loading="lazy">
   [SI tu n'as PAS trouvé d'image pour ce produit → n'insère RIEN ici, continue directement avec le texte]
   <p><strong>Prix : [X,XX]€</strong></p>
   [2-3 paragraphes de description détaillée, avantages, retours clients]

   ⚠️ RAPPEL : au minimum 5 produits sur 8-10 DOIVENT avoir une balise <img> avec une URL réelle.
   Si tu n'as pas atteint 5 images après la première série de recherches → FAIS D'AUTRES RECHERCHES avant d'écrire cette section.

4. <h2>Tableau comparatif des meilleurs produits</h2>
   <table style="width:100%;border-collapse:collapse;margin:20px 0">
   <thead><tr style="background:#1a1a1a;color:white"><th style="padding:12px;text-align:left">Produit</th><th style="padding:12px;text-align:center">Prix Temu</th><th style="padding:12px;text-align:center">Note</th><th style="padding:12px;text-align:center">Idéal pour</th></tr></thead>
   <tbody>
   <tr style="border-bottom:1px solid #eee"><td style="padding:10px">...</td><td style="padding:10px;text-align:center">...€</td><td style="padding:10px;text-align:center">⭐⭐⭐⭐</td><td style="padding:10px;text-align:center">...</td></tr>
   </tbody></table>

5. <h2>Nos astuces pour bien acheter sur Temu</h2>
   5-6 conseils pratiques détaillés (tailles, avis, codes promo, livraison, retours)

6. <h2>Notre verdict honnête</h2>
   2-3 paragraphes avec les vrais points positifs ET négatifs

7. FAQ (5 questions/réponses minimum 3-4 phrases chacune) :
   <div style="margin-top:30px">
   <h2>Questions fréquentes sur les produits ${topic.category} Temu</h2>
   <h3>[Question] ?</h3>
   <p>Réponse détaillée...</p>
   </div>

LIENS INTERNES OBLIGATOIRES (2, placés naturellement) :
- <a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
- <a href="/boutiques">toutes nos boutiques partenaires</a>

MOTS-CLÉS SEO : "Temu ${topic.category}", "produits Temu ${month}", "avis Temu ${topic.category}", "acheter sur Temu", "meilleurs produits Temu"

RAPPEL FINAL :
- PAS de titre H1
- Minimum 2000 mots
- Commence DIRECTEMENT par le HTML (zéro balise \`\`\` autour)
- Images : uniquement des URLs réelles trouvées par ta recherche — zéro stock photo, zéro Unsplash, zéro invention
- Minimum 5 <img> avec de vraies URLs dans l'article`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== (process.env.CRON_SECRET || 'lockcoupon-cron-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    // Avoid repeating topics covered recently — best-effort, never blocks article generation
    let recentTitles: string[] = [];
    try {
      const { data: recentPosts } = await supabase
        .from('blog_posts')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(30);
      recentTitles = (recentPosts || []).map((p: any) => p.title.toLowerCase());
    } catch { /* table scan timed out — proceed without recency filter */ }

    const available = TEMU_TOPICS.filter(
      (t) => !recentTitles.some((rt) => rt.includes(t.category.toLowerCase()))
    );
    const topicPool = available.length > 0 ? available : TEMU_TOPICS;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const title = topic.title_fn(month);
    const prompt = buildTemuPrompt(topic, month);

    // Call Claude with web_search — researches real Temu products + images, then writes
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu utilises la recherche web pour trouver de vrais produits Temu avec leurs vraies images (domaine img.kwcdn.com ou blogs d'avis) avant d'écrire. Tu n'utilises JAMAIS d'images stock ou Unsplash. Tu n'inventes JAMAIS de produits, de prix ou d'URLs d'images.`,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Claude API error: ${errText.substring(0, 500)}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract all text blocks (Claude emits text after tool use rounds)
    const textBlocks = (data.content || [])
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    if (!textBlocks.trim()) {
      return NextResponse.json({ error: 'Empty response from Claude' }, { status: 500 });
    }

    // Clean stray code fences
    const content = textBlocks
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\n]+/, '')
      .trim();

    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';

    // Use first real product image found in the article as cover; null if none
    const coverImage = extractCoverImage(content);

    // Count embedded images for the response summary
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

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

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
