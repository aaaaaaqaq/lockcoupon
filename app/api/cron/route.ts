import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

const COVER_IMAGES: Record<string, string[]> = {
  mode: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
  ],
  sport: [
    'https://images.unsplash.com/photo-1461896836934-bd45ba688c47?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=400&fit=crop',
  ],
  voyage: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
  ],
  beaute: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop',
  ],
  maison: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=400&fit=crop',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
  ],
};

const STORE_CATEGORIES: Record<string, string> = {
  'shein': 'mode', 'zara': 'mode', 'hm': 'mode', 'asos': 'mode', 'mango': 'mode', 'boohoo': 'mode',
  'prettylittlething': 'mode', 'zalando': 'mode', 'la-redoute': 'mode', 'kiabi': 'mode',
  'uniqlo': 'mode', 'lacoste': 'mode', 'ralph-lauren': 'mode', 'tommy-hilfiger': 'mode',
  'calvin-klein': 'mode', 'bershka': 'mode', 'pull-and-bear': 'mode', 'etam': 'mode',
  'veepee': 'mode', 'showroomprive': 'mode', 'galeries-lafayette': 'mode', 'printemps': 'mode',
  'jennyfer': 'mode', 'celio': 'mode', 'jules': 'mode', 'promod': 'mode',
  'nike': 'sport', 'adidas': 'sport', 'puma': 'sport', 'new-balance': 'sport',
  'foot-locker': 'sport', 'decathlon': 'sport', 'reebok': 'sport',
  'asics': 'sport', 'the-north-face': 'sport', 'timberland': 'sport', 'vans': 'sport',
  'converse': 'sport', 'courir': 'sport', 'intersport': 'sport', 'skechers': 'sport',
  'samsung': 'tech', 'apple': 'tech', 'xiaomi': 'tech', 'dyson': 'tech', 'philips': 'tech',
  'fnac': 'tech', 'darty': 'tech', 'boulanger': 'tech', 'ldlc': 'tech', 'back-market': 'tech',
  'cdiscount': 'tech', 'materiel-net': 'tech', 'micromania': 'tech',
  'booking': 'voyage', 'expedia': 'voyage', 'airbnb': 'voyage',
  'sephora': 'beaute', 'nocibe': 'beaute', 'nocibe-fr': 'beaute', 'yves-rocher': 'beaute',
  'marionnaud': 'beaute', 'aroma-zone': 'beaute',
  'ikea': 'maison', 'leroy-merlin': 'maison', 'conforama': 'maison',
  'maisons-du-monde': 'maison', 'but': 'maison', 'bhv': 'maison',
  'temu': 'shopping', 'amazon': 'shopping', 'aliexpress': 'shopping',
  'auchan': 'shopping', 'carrefour': 'shopping', 'leclerc': 'shopping',
  'rakuten': 'shopping', 'ebay': 'shopping', 'sarenza': 'shopping',
  'spartoo': 'shopping', 'trois-suisses': 'shopping',
};

function getCoverImage(storeSlug: string): string {
  const cat = STORE_CATEGORIES[storeSlug] || 'shopping';
  const images = COVER_IMAGES[cat] || COVER_IMAGES.shopping;
  return images[Math.floor(Math.random() * images.length)];
}

const TITLE_TEMPLATES = [
  (store: string, month: string) => `Code Promo ${store} (${month}) : Les Meilleures Réductions Vérifiées`,
  (store: string, month: string) => `${store} : Comment Économiser sur Vos Achats en ${month}`,
  (store: string, month: string) => `Soldes ${store} ${month} : Codes Promo et Bons Plans à Ne Pas Rater`,
  (store: string) => `Avis ${store} : Est-ce Vraiment Moins Cher ? Notre Analyse Complète`,
  (store: string) => `Top 10 Astuces Pour Payer Moins Cher sur ${store}`,
  (store: string) => `Code Promo ${store} Nouveaux Clients : Jusqu'à 30% de Réduction`,
  (store: string) => `Livraison Gratuite ${store} : Comment l'Obtenir à Chaque Commande`,
  (store: string) => `Les Erreurs à Éviter Avec un Code Promo ${store}`,
  (store: string, month: string) => `${store} : Guide Ultime des Réductions ${month}`,
  (store: string, month: string) => `Nouveautés ${store} ${month} : Meilleures Offres du Moment`,
  (store: string, month: string) => `Code Promo ${store} ${month} : Notre Sélection Exclusive`,
  (store: string) => `${store} vs Concurrents : Où Trouver les Meilleurs Prix`,
  (store: string) => `Comment Cumuler les Codes Promo ${store} Pour Économiser Plus`,
  (store: string, month: string) => `Bons Plans ${store} ${month} : Réductions Testées et Approuvées`,
  (store: string) => `Guide d'Achat ${store} : Les Catégories les Moins Chères`,
];

async function callClaude(prompt: string, maxTokens: number = 8000): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errText.substring(0, 300)}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

function buildWritePrompt(storeName: string, storeSlug: string, title: string, month: string): string {
  return `Act as a highly experienced, slightly cynical, but incredibly helpful deal-hunter and frugal lifestyle expert. Your target audience consists of smart shoppers in France, Canada, Belgium, and Luxembourg. You are writing an article for LockCoupon.com, a coupon and savings blog.

Your ultimate goal is to bypass AI detection NOT by spinning words, but by writing with profound "Human Variability" (High Burstiness and High Perplexity) and genuine E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).

Adhere STRICTLY to the following rules:

1. THE PERSONA & TONE:
- Write in native, conversational, and slightly informal French suitable for your specific Francophone audience.
- Speak directly to the reader using "je" (I) and "vous" (you).
- Sound like a real person who actually tests promo codes, gets frustrated when they don't work, and gets thrilled when they save money.
- Inject brief, realistic personal anecdotes (e.g., "J'ai passé 20 minutes hier à tester ce code...", "Mon portefeuille me remercie...").
- Write numbers in letters sometimes ("vingt-trois euros") and digits other times ("23€") — mix it up unpredictably.

2. STRUCTURAL VARIABILITY (BURSTINESS):
- Drastically vary your sentence length. Write a very long, flowing sentence that explains a complex condition with dashes and parentheses. Then follow it with a two-word sentence. Like this.
- Use formatting organically: em-dashes (—) for afterthoughts, <strong> for emphasis, and very short paragraphs (1-3 sentences max).
- Some sections should be 2 paragraphs, others 5. Never uniform.
- Start sentences with "Et", "Mais", "Parce que", "Sauf que" sometimes.

3. THE ANTI-AI DICTIONARY (BANNED WORDS):
- NEVER use these: "En conclusion", "Il est important de noter que", "Dans ce monde en constante évolution", "Naviguer dans le paysage", "Cependant", "En fin de compte", "Dévoiler", "N'hésitez pas à", "Force est de constater", "Il convient de", "Il est indéniable", "Cela étant dit", "Dans un monde où", "De nos jours", "En effet".
- Start paragraphs directly with the action or the thought, not with a transition word.

4. CONTENT DEPTH & VALUE:
- Don't just list coupons or deals. Explain HOW the retailer's pricing strategy works.
- Mention the failures. Acknowledge that some codes expire or have hidden terms (this builds massive trust).
- Give insider tips that only a real shopper would know.

5. PERPLEXITY (UNPREDICTABLE WORD CHOICES):
- Replace common words with unexpected but correct synonyms: not "utiliser" but "dégainer", "miser sur", "recourir à"
- Use French idioms: "ça vaut le détour", "faut pas se voiler la face", "on ne va pas se mentir", "ça crève les yeux"
- Mix familiar and elevated vocabulary in the same sentence
- Use metaphors for prices and savings ("mon portefeuille a fait un infarctus", "les prix fondent comme neige au soleil")

6. FORMAT — HTML ONLY:
- No backticks, no markdown, no html/head/body, no H1
- <h2> for 6-8 sections (informal, question-style titles)
- <h3> for sub-sections when needed
- <p> paragraphs of varying lengths
- <strong> for promo codes and key emphasis
- <ul><li> for occasional lists
- <a href="/codes-promo/${storeSlug}"> internal links (use 3 times)
- <a href="/boutiques"> (use 1 time)
- <a href="/top-codes-promo"> (use 1 time)
- One HTML table of the best codes
- <blockquote> for 1-2 insider tips

7. SEO KEYWORDS (use naturally): "code promo ${storeName.toLowerCase()}", "réduction ${storeName.toLowerCase()}", "bon plan ${storeName.toLowerCase()}", "promo ${storeName.toLowerCase()} ${month}"

8. MINIMUM 2000 mots. Obligatoire.

9. STRUCTURE: accroche personnelle, tableau des codes, guide d'utilisation détaillé, astuces d'initié, meilleures périodes d'achat, erreurs courantes, FAQ (4-5 questions)

SUJET : "${title}"
BOUTIQUE : ${storeName}
MOIS : ${month}

Commence directement avec le HTML. Pas de préambule.`;
}

function buildHumanizePrompt(htmlContent: string): string {
  return `Tu es un expert en réécriture humaine. Prends cet article HTML et RÉÉCRIS-LE pour maximiser la variabilité humaine.

OBJECTIF : Rendre le texte INDÉTECTABLE par GPTZero, Originality.ai, et tous les détecteurs IA.

MODIFICATIONS OBLIGATOIRES :

PERPLEXITÉ — Rends chaque phrase IMPRÉVISIBLE :
- Remplace 40% des mots courants par des synonymes INATTENDUS mais naturels
- Ajoute 8-10 expressions idiomatiques françaises dans tout l'article
- Mélange registre familier et soutenu dans la même phrase ("Ce stratagème, franchement, il déchire")
- Choisis TOUJOURS le 2ème ou 3ème mot le plus probable, jamais le 1er

BURSTINESS — Varie RADICALEMENT le rythme :
- Insère 10+ phrases de 2-4 mots : "Bref.", "Résultat ?", "Ça pique.", "Vrai de vrai.", "Pas faux.", "Et voilà."
- Insère 5+ phrases de 35+ mots avec virgules, tirets et parenthèses
- JAMAIS deux phrases de longueur similaire qui se suivent
- Certains paragraphes : 1 phrase. D'autres : 6 phrases.
- Commence des phrases par "Et", "Mais", "Parce que", "Sauf que"

PRÉSERVE ABSOLUMENT :
- Tout le HTML (h2, h3, p, strong, a, ul, li, table, blockquote, etc.)
- Tous les liens href exactement comme ils sont
- Tous les codes promo dans <strong>
- La longueur totale (garde la même taille ou plus long)

Renvoie UNIQUEMENT le HTML réécrit. Pas de backticks. Pas d'explications.

ARTICLE :

${htmlContent}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }

  try {
    const { data: stores } = await supabase.from('stores').select('name, slug').order('name');
    if (!stores || stores.length === 0) {
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const store = stores[Math.floor(Math.random() * stores.length)];
    const templateIdx = Math.floor(Math.random() * TITLE_TEMPLATES.length);
    const title = TITLE_TEMPLATES[templateIdx](store.name, month);
    const storeSlug = store.slug;
    const coverImage = getCoverImage(storeSlug);

    // ═══ STEP 1: Write article with human persona prompt ═══
    const writePrompt = buildWritePrompt(store.name, storeSlug, title, month);
    const rawArticle = await callClaude(writePrompt, 8000);

    if (!rawArticle || rawArticle.length < 500) {
      return NextResponse.json({ error: 'Article too short', length: rawArticle.length }, { status: 500 });
    }

    const cleanRaw = rawArticle
      .replace(/```html\n?/g, '').replace(/```\n?/g, '')
      .replace(/^<!DOCTYPE.*$/gm, '')
      .replace(/<\/?html[^>]*>/g, '').replace(/<\/?head[^>]*>/g, '').replace(/<\/?body[^>]*>/g, '')
      .trim();

    // ═══ STEP 2: Humanize — boost perplexity & burstiness ═══
    const humanizePrompt = buildHumanizePrompt(cleanRaw);
    const humanizedArticle = await callClaude(humanizePrompt, 8000);

    let finalContent = cleanRaw;
    if (humanizedArticle && humanizedArticle.length > cleanRaw.length * 0.7) {
      finalContent = humanizedArticle
        .replace(/```html\n?/g, '').replace(/```\n?/g, '')
        .replace(/^<!DOCTYPE.*$/gm, '')
        .replace(/<\/?html[^>]*>/g, '').replace(/<\/?head[^>]*>/g, '').replace(/<\/?body[^>]*>/g, '')
        .trim();
    }

    const excerpt = finalContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').substring(0, 155).trim() + '...';
    const wordCount = finalContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

    const slug = title
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      .substring(0, 90);

    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).maybeSingle();
    const finalSlug = existing ? slug + '-' + Date.now().toString(36) : slug;

    const { error: dbError } = await supabase.from('blog_posts').insert({
      title,
      slug: finalSlug,
      excerpt,
      content: finalContent,
      cover_image: coverImage,
      author: 'LockCoupon',
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      return NextResponse.json({ error: 'Database error', detail: dbError.message, code: dbError.code }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      article: {
        title,
        slug: finalSlug,
        wordCount,
        humanized: humanizedArticle.length > cleanRaw.length * 0.7,
        url: 'https://www.lockcoupon.com/blog/' + finalSlug,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

5. Click **Commit changes**

Now test it:
```
https://www.lockcoupon.com/api/cron?secret=lockcoupon-cron-2026
