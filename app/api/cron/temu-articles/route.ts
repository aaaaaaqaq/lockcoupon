import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// ─── Temu product topics with web search queries ────────────────────────────
const TEMU_TOPICS = [
  {
    category: 'mode femme',
    title_fn: (m: string) => `Mode femme Temu ${m} : les meilleures trouvailles à moins de 20€`,
    search_query: 'Temu meilleurs vêtements femme tendance populaire best-sellers',
    cover: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=450&fit=crop',
  },
  {
    category: 'décoration maison',
    title_fn: (m: string) => `Temu déco maison ${m} : 12 articles qui changent tout pour moins de 15€`,
    search_query: 'Temu meilleurs produits décoration maison best-sellers populaires',
    cover: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=450&fit=crop',
  },
  {
    category: 'gadgets tech',
    title_fn: (m: string) => `Gadgets tech Temu ${m} : les petits accessoires qui valent vraiment le détour`,
    search_query: 'Temu gadgets électroniques accessoires tech populaires pas cher',
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=450&fit=crop',
  },
  {
    category: 'beauté et soins',
    title_fn: (m: string) => `Beauté Temu ${m} : les produits skincare et maquillage qu'on a testés`,
    search_query: 'Temu produits beauté skincare maquillage best-sellers populaires',
    cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=450&fit=crop',
  },
  {
    category: 'cuisine',
    title_fn: (m: string) => `Cuisine Temu ${m} : ustensiles et gadgets qui rendent la vie plus facile`,
    search_query: 'Temu ustensiles cuisine gadgets kitchen best-sellers',
    cover: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&h=450&fit=crop',
  },
  {
    category: 'sport et fitness',
    title_fn: (m: string) => `Sport pas cher sur Temu ${m} : équipement et vêtements de fitness à tester`,
    search_query: 'Temu équipement sport fitness vêtements sportswear best-sellers',
    cover: 'https://images.unsplash.com/photo-1461896836934-bd45ba688c47?w=900&h=450&fit=crop',
  },
  {
    category: 'mode homme',
    title_fn: (m: string) => `Mode homme Temu ${m} : le guide des achats malins à prix cassé`,
    search_query: 'Temu meilleurs vêtements homme tendance populaires best-sellers',
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=450&fit=crop',
  },
  {
    category: 'enfants et jouets',
    title_fn: (m: string) => `Jouets et mode enfant sur Temu ${m} : ce qui vaut vraiment le coup`,
    search_query: 'Temu jouets enfants vêtements enfant best-sellers populaires',
    cover: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900&h=450&fit=crop',
  },
  {
    category: 'jardinage et extérieur',
    title_fn: (m: string) => `Jardin et extérieur Temu ${m} : les bons plans pour aménager sans se ruiner`,
    search_query: 'Temu jardinage extérieur terrasse balcon articles populaires',
    cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&h=450&fit=crop',
  },
  {
    category: 'accessoires et bijoux',
    title_fn: (m: string) => `Accessoires et bijoux Temu ${m} : les pièces qu'on a adoptées`,
    search_query: 'Temu bijoux accessoires sacs ceintures populaires best-sellers',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=450&fit=crop',
  },
  {
    category: 'rangement et organisation',
    title_fn: (m: string) => `Organisation maison Temu ${m} : les produits qui changent vraiment les choses`,
    search_query: 'Temu rangement organisation maison produits populaires best-sellers',
    cover: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=450&fit=crop',
  },
  {
    category: 'animaux de compagnie',
    title_fn: (m: string) => `Animalerie Temu ${m} : accessoires et jouets pour chats et chiens à tester`,
    search_query: 'Temu produits animaux compagnie chiens chats best-sellers',
    cover: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&h=450&fit=crop',
  },
];

// ─── Build the combined research + writing prompt ────────────────────────────
function buildTemuPrompt(topic: typeof TEMU_TOPICS[0], month: string): string {
  return `Tu es Marc, rédacteur senior chez LockCoupon.com, un site de bons plans et codes promo français. Tu as 8 ans d'expérience dans le shopping en ligne. Tu écris pour de VRAIES personnes, pas pour des algorithmes.

MISSION EN DEUX ÉTAPES :

ÉTAPE 1 — RECHERCHE (utilise l'outil web_search) :
Cherche "${topic.search_query}" et aussi "Temu ${topic.category} avis 2026" pour trouver :
- Au moins 8 produits Temu RÉELS et actuels dans la catégorie "${topic.category}"
- Les vrais prix en euros (ex: 3,99€, 12,50€, 8,99€)
- Les descriptions de produits, leurs avantages/inconvénients
- Des avis d'acheteurs si disponibles
- Les produits les plus vendus / best-sellers actuels

ÉTAPE 2 — RÉDACTION :
Écris un article SEO de 2000 mots minimum basé sur les VRAIS produits que tu as trouvés.

STYLE D'ÉCRITURE :
- Tu fais partie de l'équipe LockCoupon. Utilise "nous", "notre équipe", "on a testé"
- Direct, parfois drôle, toujours authentique — jamais comme une IA
- Commence certains paragraphes par : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "OK,", "Résultat ?", "Le truc,", "Attention.", "Pour être franc,"
- JAMAIS : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez", "Il convient de", "Vous connaissez ce moment où"
- Exemples de prix réels (ceux que tu as trouvés via la recherche)
- Anecdotes personnelles ("La semaine dernière, on a commandé...")

LONGUEUR OBLIGATOIRE : Minimum 2000 mots. Développe CHAQUE section en profondeur. C'est un article pilier SEO.

STRUCTURE HTML OBLIGATOIRE :

1. Introduction (2-3 paragraphes engageants) — parle des vrais prix que tu as trouvés pour accrocher le lecteur

2. <h2>Pourquoi acheter des produits ${topic.category} sur Temu ?</h2>
   3-4 paragraphes sur les avantages (prix, choix, livraison) et les points d'attention (qualité variable, délais)

3. <h2>Notre sélection : les meilleurs produits ${topic.category} Temu du moment</h2>
   Présente 8-10 produits RÉELS que tu as trouvés, chacun avec :
   - Sous-titre H3 avec le nom du produit
   - Prix réel trouvé (en euros)
   - Description détaillée (2-3 paragraphes)
   - Ce qu'on aime / ce qui est moins bien

4. <h2>Tableau comparatif des meilleurs produits</h2>
   Tableau HTML avec les produits trouvés, leurs prix, notes et catégories :
   <table style="width:100%;border-collapse:collapse;margin:20px 0">
   <thead><tr style="background:#1a1a1a;color:white"><th style="padding:12px;text-align:left">Produit</th><th style="padding:12px;text-align:center">Prix Temu</th><th style="padding:12px;text-align:center">Note</th><th style="padding:12px;text-align:center">Idéal pour</th></tr></thead>
   <tbody>
   <tr style="border-bottom:1px solid #eee"><td style="padding:10px">...</td><td style="padding:10px;text-align:center">...</td><td style="padding:10px;text-align:center">...</td><td style="padding:10px;text-align:center">...</td></tr>
   </tbody></table>

5. <h2>Nos astuces pour bien acheter sur Temu</h2>
   5-6 conseils pratiques (vérifier les tailles, lire les avis, utiliser les codes promo, etc.)

6. <h2>Notre verdict honnête</h2>
   2-3 paragraphes avec les vrais points positifs ET négatifs de Temu pour la catégorie "${topic.category}"

7. FAQ (5 questions/réponses) :
   <div style="margin-top:30px">
   <h2>Questions fréquentes sur les produits ${topic.category} Temu</h2>
   <h3>[Question 1] ?</h3>
   <p>Réponse détaillée de 3-4 phrases...</p>
   </div>

LIENS INTERNES OBLIGATOIRES (exactement 2, placés naturellement dans le texte) :
- <a href="/codes-promo/temu">nos codes promo Temu vérifiés</a>
- <a href="/boutiques">toutes nos boutiques partenaires</a>

MOTS-CLÉS SEO (intègre-les naturellement) :
- "Temu ${topic.category}"
- "produits Temu ${month}"
- "avis Temu ${topic.category}"
- "acheter sur Temu"
- "meilleurs produits Temu"

RAPPEL CRITIQUE :
- PAS de titre H1 (le CMS l'ajoute)
- Minimum 2000 mots — développe CHAQUE section
- Commence DIRECTEMENT par le HTML (pas de balises \`\`\` autour)
- Inclus des prix réels trouvés via ta recherche web
- Tableau et FAQ obligatoires`;
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
    // Avoid repeating topics written in the last 12 days
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('title')
      .gte('created_at', new Date(Date.now() - 12 * 86400000).toISOString());

    const recentTitles = (recentPosts || []).map((p) => p.title.toLowerCase());

    // Pick a topic not recently covered
    const available = TEMU_TOPICS.filter(
      (t) => !recentTitles.some((rt) => rt.includes(t.category.toLowerCase()))
    );
    const topicPool = available.length > 0 ? available : TEMU_TOPICS;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const title = topic.title_fn(month);
    const prompt = buildTemuPrompt(topic, month);

    // Call Claude with web_search tool for real product research + writing
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
        system: `Tu es Marc, rédacteur senior chez LockCoupon.com. Tu utilises la recherche web pour trouver de vrais produits Temu avant d'écrire. Tes articles sont basés sur des faits réels, des prix réels, des produits qui existent vraiment. Tu n'inventes jamais de produits ou de prix.`,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Claude API error: ${errText.substring(0, 500)}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract all text blocks (Claude may emit text after tool use)
    const textBlocks = (data.content || [])
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    if (!textBlocks.trim()) {
      return NextResponse.json({ error: 'Empty response from Claude' }, { status: 500 });
    }

    // Clean any stray code fences
    const content = textBlocks
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\n]+/, '')
      .trim();

    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';

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
      cover_image: topic.cover,
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
      indexed: newPostUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
