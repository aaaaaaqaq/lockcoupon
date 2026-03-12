import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

const COVER_IMAGES: Record<string, string[]> = {
  mode: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop',
  ],
  sport: [
    'https://images.unsplash.com/photo-1461896836934-bd45ba688c47?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
  ],
  voyage: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
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
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&h=400&fit=crop',
  ],
};

const STORE_CATEGORIES: Record<string, string> = {
  'shein': 'mode', 'zara': 'mode', 'hm': 'mode', 'asos': 'mode', 'mango': 'mode', 'boohoo': 'mode',
  'prettylittlething': 'mode', 'zalando': 'mode', 'la-redoute': 'mode', 'kiabi': 'mode',
  'uniqlo': 'mode', 'lacoste': 'mode', 'ralph-lauren': 'mode', 'tommy-hilfiger': 'mode',
  'calvin-klein': 'mode', 'bershka': 'mode', 'pull-and-bear': 'mode', 'etam': 'mode',
  'veepee': 'mode', 'showroomprive': 'mode', 'galeries-lafayette': 'mode', 'printemps': 'mode',
  'nike': 'sport', 'adidas': 'sport', 'puma': 'sport', 'new-balance': 'sport',
  'foot-locker': 'sport', 'jd-sports': 'sport', 'decathlon': 'sport', 'reebok': 'sport',
  'asics': 'sport', 'the-north-face': 'sport', 'timberland': 'sport', 'vans': 'sport',
  'converse': 'sport', 'courir': 'sport', 'intersport': 'sport',
  'samsung': 'tech', 'apple': 'tech', 'xiaomi': 'tech', 'dyson': 'tech', 'philips': 'tech',
  'fnac': 'tech', 'darty': 'tech', 'boulanger': 'tech', 'ldlc': 'tech', 'back-market': 'tech',
  'cdiscount': 'tech', 'rue-du-commerce': 'tech', 'materiel-net': 'tech', 'micromania': 'tech',
  'booking': 'voyage', 'expedia': 'voyage', 'airbnb': 'voyage', 'lastminute': 'voyage',
  'sephora': 'beaute', 'nocibe': 'beaute', 'yves-rocher': 'beaute', 'marionnaud': 'beaute',
  'ikea': 'maison', 'leroy-merlin': 'maison', 'castorama': 'maison', 'conforama': 'maison',
  'maisons-du-monde': 'maison', 'but': 'maison',
};

function getCoverImage(storeSlug: string): string {
  const cat = STORE_CATEGORIES[storeSlug] || 'shopping';
  const images = COVER_IMAGES[cat] || COVER_IMAGES.shopping;
  return images[Math.floor(Math.random() * images.length)];
}

const TOPICS = [
  (store: string, month: string) => `Les meilleurs codes promo ${store} en ${month}`,
  (store: string) => `Guide complet : comment utiliser un code promo ${store}`,
  (store: string) => `${store} : toutes les astuces pour payer moins cher`,
  (store: string, month: string) => `Soldes ${store} ${month} : maximisez vos économies`,
  (store: string) => `Avis ${store} : pourquoi acheter et comment économiser`,
  (store: string) => `Top des catégories les moins chères sur ${store}`,
  (store: string) => `Comment obtenir la livraison gratuite sur ${store}`,
  (store: string) => `Les erreurs à éviter avec un code promo ${store}`,
  (store: string, month: string) => `${store} : guide ultime des réductions ${month}`,
  (store: string) => `Nouveautés ${store} : les meilleures offres à ne pas rater`,
];

// ─── Generate one article and save to DB ─────────────────
async function generateAndPublish(storeName: string, title: string, storeSlug: string, publishTime?: string): Promise<{ success: boolean; title: string; error?: string }> {
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const coverImage = getCoverImage(storeSlug);

  const prompt = `Tu es un rédacteur web français expérimenté qui écrit pour un blog de codes promo et bons plans. Écris un article de blog en HTML pour le site LockCoupon.com.

RÈGLES IMPORTANTES:
- Écris UNIQUEMENT en français, naturel et fluide, comme un vrai blogueur français
- NE PAS écrire comme un robot ou une IA — utilise un ton conversationnel, amical
- Varie la longueur des phrases — mélange phrases courtes et longues
- Ajoute des opinions personnelles et des recommandations
- Utilise "on", "vous", des questions rhétoriques pour engager le lecteur
- Parfois commence des phrases par "Bon,", "Allez,", "Franchement,"
- L'article doit faire environ 800-1200 mots
- Inclus des mots-clés SEO naturellement: "code promo ${storeName}", "réduction ${storeName}", "bon plan ${storeName}", "promo ${storeName} ${month}"
- NE METS PAS le titre H1 dans le contenu
- Inclus un lien: <a href="/codes-promo/${storeSlug}">Voir tous les codes promo ${storeName}</a>

STRUCTURE HTML:
- <h2> pour les sections principales (3-5 sections)
- <h3> pour les sous-sections si nécessaire
- <p> pour les paragraphes
- <strong> pour les points importants
- <a href="/codes-promo/${storeSlug}"> pour les liens internes
- <ul><li> pour les listes
- <blockquote> pour les astuces

SUJET: "${title}"

Commence directement avec le HTML, sans backticks ni commentaires.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, title, error: `API error: ${err}` };
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    if (!content) {
      return { success: false, title, error: 'Empty response' };
    }

    const cleanContent = content.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    const excerpt = cleanContent.replace(/<[^>]+>/g, '').substring(0, 160).trim() + '...';

    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/g, '')
      .substring(0, 80)
      + '-' + Date.now().toString(36);

    const { error } = await supabase.from('blog_posts').insert({
      title,
      slug,
      excerpt,
      content: cleanContent,
      cover_image: coverImage,
      author: 'LockCoupon',
      is_published: true,
      created_at: publishTime || new Date().toISOString(),
      updated_at: publishTime || new Date().toISOString(),
    });

    if (error) {
      return { success: false, title, error: error.message };
    }

    return { success: true, title };
  } catch (e: any) {
    return { success: false, title, error: e.message };
  }
}

// ─── Main cron handler ───────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: stores } = await supabase.from('stores').select('name, slug').order('name');
    if (!stores || stores.length === 0) {
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const results = [];
    const usedStores = new Set<string>();

    // Publish times: 8AM, 12PM, 4PM, 8PM
    const today = new Date();
    const publishHours = [8, 12, 16, 20];

    for (let i = 0; i < 4; i++) {
      let store = stores[Math.floor(Math.random() * stores.length)];
      let attempts = 0;
      while (usedStores.has(store.slug) && attempts < 20) {
        store = stores[Math.floor(Math.random() * stores.length)];
        attempts++;
      }
      usedStores.add(store.slug);

      const topicFn = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const title = topicFn(store.name, month);

      // Set publish time to different hours today
      const publishDate = new Date(today);
      publishDate.setHours(publishHours[i], Math.floor(Math.random() * 30), 0, 0);
      const publishTime = publishDate.toISOString();

      const result = await generateAndPublish(store.name, title, store.slug, publishTime);
      results.push(result);

      await new Promise(r => setTimeout(r, 2000));
    }

    return NextResponse.json({ success: true, articles: results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
