import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
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
    const year = new Date().getFullYear();

    // Pick ONE random store
    const store = stores[Math.floor(Math.random() * stores.length)];
    const templateIdx = Math.floor(Math.random() * TITLE_TEMPLATES.length);
    const title = TITLE_TEMPLATES[templateIdx](store.name, month);
    const storeSlug = store.slug;
    const coverImage = getCoverImage(storeSlug);

    const prompt = `Tu es un rédacteur web français passionné par les bons plans. Tu écris pour LockCoupon.com. Tu n'es PAS une IA — tu es un vrai blogueur.

RÈGLES :
1. MINIMUM 2000 mots. Obligatoire.
2. Français naturel, conversationnel : "on", "vous", "franchement", "le truc c'est que"
3. Interpelle le lecteur, donne des opinions, ajoute des anecdotes
4. N'utilise JAMAIS : "Dans le monde numérique", "Il est important de noter", "En conclusion", "N'hésitez pas à"
5. FORMAT HTML uniquement (pas de backticks, pas de html/head/body, pas de H1) :
   - <h2> pour 6-8 sections (chaque H2 contient un mot-clé)
   - <h3> pour sous-sections
   - <p> paragraphes de 3-4 phrases minimum
   - <strong> pour les codes promo
   - <ul><li> pour les listes
   - <blockquote> pour les astuces
   - <a href="/codes-promo/${storeSlug}"> liens internes
   - Un tableau HTML des meilleurs codes

6. SEO mots-clés naturels : "code promo ${store.name.toLowerCase()}", "réduction ${store.name.toLowerCase()}", "bon plan ${store.name.toLowerCase()}", "promo ${store.name.toLowerCase()} ${month}", "${store.name.toLowerCase()} moins cher"

7. Structure : accroche + tableau codes, guide utilisation, astuces insider, meilleures périodes, erreurs à éviter, comparaison, FAQ (4-5 questions)

8. Liens : 3x vers /codes-promo/${storeSlug}, 1x vers /boutiques, 1x vers /top-codes-promo

SUJET : "${title}"
BOUTIQUE : ${store.name}

Commence directement avec le HTML.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: 'Claude API error', status: response.status, detail: errText.substring(0, 300) }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    if (!content || content.length < 500) {
      return NextResponse.json({ error: 'Content too short', length: content.length }, { status: 500 });
    }

    const cleanContent = content
      .replace(/```html\n?/g, '').replace(/```\n?/g, '')
      .replace(/^<!DOCTYPE.*$/gm, '')
      .replace(/<\/?html[^>]*>/g, '').replace(/<\/?head[^>]*>/g, '').replace(/<\/?body[^>]*>/g, '')
      .trim();

    const excerpt = cleanContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').substring(0, 155).trim() + '...';
    const wordCount = cleanContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

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
      content: cleanContent,
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
        url: 'https://www.lockcoupon.com/blog/' + finalSlug,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
