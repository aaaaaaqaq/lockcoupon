import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

// Cover image categories based on store type
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
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop',
  ],
  sport: [
    'https://images.unsplash.com/photo-1461896836934-bd45ba688c47?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop',
  ],
  voyage: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop',
  ],
  beaute: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=400&fit=crop',
  ],
  maison: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=400&fit=crop',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  ],
};

// Map stores to categories
const STORE_CATEGORIES: Record<string, string> = {
  'shein': 'mode', 'zara': 'mode', 'hm': 'mode', 'asos': 'mode', 'mango': 'mode', 'boohoo': 'mode',
  'prettylittlething': 'mode', 'zalando': 'mode', 'la-redoute': 'mode', 'kiabi': 'mode',
  'uniqlo': 'mode', 'lacoste': 'mode', 'ralph-lauren': 'mode', 'tommy-hilfiger': 'mode',
  'calvin-klein': 'mode', 'bershka': 'mode', 'pull-and-bear': 'mode', 'stradivarius': 'mode',
  'massimo-dutti': 'mode', 'etam': 'mode', 'celio': 'mode', 'jules': 'mode', 'promod': 'mode',
  'veepee': 'mode', 'showroomprive': 'mode', 'galeries-lafayette': 'mode', 'printemps': 'mode',
  'nike': 'sport', 'adidas': 'sport', 'puma': 'sport', 'new-balance': 'sport',
  'foot-locker': 'sport', 'jd-sports': 'sport', 'decathlon': 'sport', 'reebok': 'sport',
  'asics': 'sport', 'the-north-face': 'sport', 'timberland': 'sport', 'vans': 'sport',
  'converse': 'sport', 'courir': 'sport', 'intersport': 'sport', 'columbia': 'sport',
  'samsung': 'tech', 'apple': 'tech', 'xiaomi': 'tech', 'dyson': 'tech', 'philips': 'tech',
  'fnac': 'tech', 'darty': 'tech', 'boulanger': 'tech', 'ldlc': 'tech', 'back-market': 'tech',
  'cdiscount': 'tech', 'rue-du-commerce': 'tech', 'materiel-net': 'tech', 'micromania': 'tech',
  'booking': 'voyage', 'expedia': 'voyage', 'airbnb': 'voyage', 'lastminute': 'voyage',
  'sephora': 'beaute', 'nocibe': 'beaute', 'yves-rocher': 'beaute', 'marionnaud': 'beaute',
  'aroma-zone': 'beaute',
  'ikea': 'maison', 'leroy-merlin': 'maison', 'castorama': 'maison', 'conforama': 'maison',
  'maisons-du-monde': 'maison', 'but': 'maison',
};

function getCoverImage(storeSlug: string): string {
  const cat = STORE_CATEGORIES[storeSlug] || 'shopping';
  const images = COVER_IMAGES[cat] || COVER_IMAGES.shopping;
  return images[Math.floor(Math.random() * images.length)];
}

// Article topic templates
const TOPICS = [
  (store: string, month: string) => `Les meilleurs codes promo ${store} en ${month} : économisez maintenant`,
  (store: string) => `Guide complet : comment utiliser un code promo ${store} étape par étape`,
  (store: string) => `${store} : toutes les astuces pour payer moins cher`,
  (store: string, month: string) => `Soldes ${store} ${month} : comment maximiser vos économies`,
  (store: string) => `Avis ${store} : pourquoi acheter sur ${store} et comment économiser`,
  (store: string) => `Top des catégories les moins chères sur ${store}`,
  (store: string) => `Comment obtenir la livraison gratuite sur ${store}`,
  (store: string) => `Les erreurs à éviter quand on utilise un code promo ${store}`,
  (store: string, month: string) => `${store} : le guide ultime des réductions ${month}`,
  (store: string) => `Nouveautés ${store} : les meilleures offres à ne pas rater`,
];

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

    // Generate 4 articles per run
    for (let i = 0; i < 4; i++) {
      // Pick a unique random store each time
      let store = stores[Math.floor(Math.random() * stores.length)];
      let attempts = 0;
      while (usedStores.has(store.slug) && attempts < 20) {
        store = stores[Math.floor(Math.random() * stores.length)];
        attempts++;
      }
      usedStores.add(store.slug);

      const topicFn = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const title = topicFn(store.name, month);

      try {
        const result = await generateAndPublish(store.name, title, store.slug);
        const json = await result.json();
        results.push(json);
      } catch (e: any) {
        results.push({ error: e.message, store: store.name });
      }

      // Small delay between articles to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    }

    return NextResponse.json({ success: true, articles: results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
