import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com';

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
  'jennyfer': 'mode', 'celio': 'mode', 'jules': 'mode', 'promod': 'mode',
  'blancheporte': 'mode', 'bonprix': 'mode', 'daxon': 'mode', 'desigual': 'mode',
  'kaporal': 'mode', 'undiz': 'mode', 'stradivarius': 'mode', 'oysho': 'mode',
  'massimo-dutti': 'mode', 'petit-bateau': 'mode', 'vertbaudet': 'mode', 'camaieu': 'mode',
  'nike': 'sport', 'adidas': 'sport', 'puma': 'sport', 'new-balance': 'sport',
  'foot-locker': 'sport', 'decathlon': 'sport', 'reebok': 'sport', 'go-sport': 'sport',
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
  'geant-casino': 'shopping', 'rakuten': 'shopping', 'ebay': 'shopping',
  'cultura': 'shopping', 'nature-et-decouvertes': 'shopping', 'office-depot': 'shopping',
  'sarenza': 'shopping', 'spartoo': 'shopping', 'trois-suisses': 'shopping',
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

async function generateAndPublish(
  storeName: string,
  title: string,
  storeSlug: string,
  publishTime?: string
): Promise<{ success: boolean; title: string; slug?: string; wordCount?: number; error?: string }> {
  const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const year = new Date().getFullYear();
  const coverImage = getCoverImage(storeSlug);

  const prompt = `Tu es un rédacteur web français passionné par les bons plans et l'e-commerce. Tu écris pour LockCoupon.com, un site de codes promo. Tu n'es PAS une IA — tu es un vrai blogueur qui teste les codes et partage ses découvertes.

═══ RÈGLES NON NÉGOCIABLES ═══

1. LONGUEUR : L'article doit faire MINIMUM 2000 mots. C'est obligatoire. Sois exhaustif et détaillé.

2. LANGUE : Français 100% naturel. Ton conversationnel de blogueur :
   - Utilise "on", "vous", "franchement", "bon", "allez", "le truc c'est que"
   - Interpelle le lecteur : "Vous connaissez ce moment où...", "Imaginez un peu..."
   - Donne des opinions : "C'est clairement la meilleure offre", "Honnêtement, c'est pas ouf"
   - Ajoute des anecdotes : "La semaine dernière, j'ai testé...", "Un collègue m'a dit..."
   - Varie les phrases : courtes + longues + questions rhétoriques

3. PAS DE PHRASES IA : N'utilise JAMAIS :
   - "Dans le monde numérique d'aujourd'hui"
   - "Il est important de noter"
   - "En conclusion" / "Pour résumer"
   - "N'hésitez pas à" (trop formel)
   - "Il convient de souligner"

4. FORMAT HTML — NE PAS inclure de backticks, de balises html/head/body, ni le titre H1 :
   - <h2> pour les 6-8 sections principales (CHAQUE H2 doit contenir un mot-clé)
   - <h3> pour les sous-sections
   - <p> pour les paragraphes (au moins 3-4 phrases par paragraphe)
   - <strong> pour les points clés et codes promo
   - <ul><li> pour les listes
   - <blockquote> pour les astuces insider
   - <a href="/codes-promo/${storeSlug}"> pour les liens internes vers LockCoupon
   - Inclure au minimum un tableau HTML avec les meilleurs codes actuels

5. SEO — Intègre NATURELLEMENT ces mots-clés (densité 1.5-2.5%) :
   - "code promo ${storeName.toLowerCase()}"
   - "réduction ${storeName.toLowerCase()}"
   - "bon plan ${storeName.toLowerCase()}"
   - "promo ${storeName.toLowerCase()} ${month}"
   - "code ${storeName.toLowerCase()} ${year}"
   - "${storeName.toLowerCase()} moins cher"

6. STRUCTURE GAGNANTE (celle qui rank #1 sur Google) :
   Section 1 : Accroche + tableau récapitulatif des meilleurs codes du moment
   Section 2 : Guide pas-à-pas pour utiliser un code promo ${storeName}
   Section 3 : Astuces d'insider pour maximiser les économies (5-7 astuces détaillées)
   Section 4 : Les meilleures périodes pour acheter sur ${storeName} (calendrier)
   Section 5 : Erreurs courantes à éviter avec les codes promo
   Section 6 : ${storeName} vs alternatives — comparaison honnête
   Section 7 : FAQ (4-5 questions naturelles que les gens recherchent sur Google)

7. LIENS INTERNES :
   - Au moins 3 liens vers <a href="/codes-promo/${storeSlug}">la page codes promo ${storeName}</a>
   - 1 lien vers <a href="/boutiques">toutes nos boutiques</a>
   - 1 lien vers <a href="/top-codes-promo">notre top 20 des codes promo</a>

SUJET DE L'ARTICLE : "${title}"
BOUTIQUE : ${storeName} (${storeSlug})
MOIS : ${month}

Commence directement avec le HTML. Pas de backticks. Pas de commentaires. Minimum 2000 mots.`;

  try {
    console.log('Generating: ' + title);

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
      console.error('Claude API error for "' + title + '":', errText);
      return { success: false, title, error: 'Claude API ' + response.status + ': ' + errText.substring(0, 200) };
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    if (!content || content.length < 2000) {
      console.error('Content too short for "' + title + '": ' + (content?.length || 0) + ' chars');
      return { success: false, title, error: 'Content too short: ' + (content?.length || 0) + ' chars' };
    }

    const cleanContent = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^<!DOCTYPE.*$/gm, '')
      .replace(/<\/?html[^>]*>/g, '')
      .replace(/<\/?head[^>]*>/g, '')
      .replace(/<\/?body[^>]*>/g, '')
      .trim();

    const excerpt = cleanContent
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 155)
      .trim() + '...';

    const wordCount = cleanContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
    console.log('Word count for "' + title + '": ' + wordCount);

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 90);

    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    const finalSlug = existing ? slug + '-' + Date.now().toString(36) : slug;

    const { data: inserted, error: dbError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: finalSlug,
        excerpt,
        content: cleanContent,
        cover_image: coverImage,
        author: 'LockCoupon',
        is_published: true,
        created_at: publishTime || new Date().toISOString(),
        updated_at: publishTime || new Date().toISOString(),
      })
      .select('id, slug')
      .single();

    if (dbError) {
      console.error('Supabase INSERT error for "' + title + '":', dbError);
      return { success: false, title, error: 'DB: ' + dbError.message + ' (code: ' + dbError.code + ')' };
    }

    console.log('Published: ' + title + ' -> /blog/' + finalSlug + ' (' + wordCount + ' words)');
    return { success: true, title, slug: finalSlug, wordCount };
  } catch (e: any) {
    console.error('Exception for "' + title + '":', e);
    return { success: false, title, error: e.message };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error: 'ANTHROPIC_API_KEY is not set in Vercel environment variables',
      fix: 'Go to Vercel > Settings > Environment Variables > Add ANTHROPIC_API_KEY',
    }, { status: 500 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY not set - falling back to anon key (inserts may fail due to RLS)');
  }

  try {
    console.log('Auto-blog cron started');

    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('name, slug')
      .order('name');

    if (storesError || !stores || stores.length === 0) {
      return NextResponse.json({
        error: 'No stores found',
        detail: storesError?.message,
      }, { status: 404 });
    }

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const results = [];
    const usedStores = new Set<string>();
    const usedTemplates = new Set<number>();

    const today = new Date();
    const publishHours = [7, 10, 13, 17, 20];

    for (let i = 0; i < 5; i++) {
      let store = stores[Math.floor(Math.random() * stores.length)];
      let attempts = 0;
      while (usedStores.has(store.slug) && attempts < 30) {
        store = stores[Math.floor(Math.random() * stores.length)];
        attempts++;
      }
      usedStores.add(store.slug);

      let templateIdx = Math.floor(Math.random() * TITLE_TEMPLATES.length);
      let tAttempts = 0;
      while (usedTemplates.has(templateIdx) && tAttempts < 20) {
        templateIdx = Math.floor(Math.random() * TITLE_TEMPLATES.length);
        tAttempts++;
      }
      usedTemplates.add(templateIdx);

      const title = TITLE_TEMPLATES[templateIdx](store.name, month);

      const publishDate = new Date(today);
      publishDate.setHours(publishHours[i], Math.floor(Math.random() * 45), 0, 0);
      const publishTime = publishDate.toISOString();

      const result = await generateAndPublish(store.name, title, store.slug, publishTime);
      results.push(result);

      if (i < 4) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log('Done: ' + successCount + ' published, ' + failCount + ' failed');

    return NextResponse.json({
      success: true,
      published: successCount,
      failed: failCount,
      articles: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fatal cron error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack?.substring(0, 500) },
      { status: 500 }
    );
  }
}
