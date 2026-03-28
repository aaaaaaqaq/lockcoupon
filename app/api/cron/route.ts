import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Cover images by category ────────────────────────────
const COVERS: Record<string, string[]> = {
  mode: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=450&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=900&h=450&fit=crop',
  ],
  sport: [
    'https://images.unsplash.com/photo-1461896836934-bd45ba688c47?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&h=450&fit=crop',
  ],
  voyage: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=450&fit=crop',
  ],
  beaute: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&h=450&fit=crop',
  ],
  maison: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&h=450&fit=crop',
  ],
  general: [
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900&h=450&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=450&fit=crop',
  ],
};

const STORE_CAT: Record<string, string> = {
  'shein':'mode','zara':'mode','hm':'mode','asos':'mode','mango':'mode','zalando':'mode',
  'la-redoute':'mode','kiabi':'mode','uniqlo':'mode','bershka':'mode','veepee':'mode',
  'prettylittlething':'mode','boohoo':'mode','etam':'mode','lacoste':'mode',
  'nike':'sport','adidas':'sport','puma':'sport','decathlon':'sport','new-balance':'sport',
  'foot-locker':'sport','reebok':'sport','the-north-face':'sport','timberland':'sport',
  'samsung':'tech','apple':'tech','xiaomi':'tech','fnac':'tech','darty':'tech',
  'boulanger':'tech','ldlc':'tech','back-market':'tech','cdiscount':'tech',
  'booking':'voyage','expedia':'voyage','airbnb':'voyage','lastminute':'voyage',
  'sephora':'beaute','nocibe':'beaute','yves-rocher':'beaute','marionnaud':'beaute',
  'ikea':'maison','leroy-merlin':'maison','conforama':'maison','but':'maison',
  'temu':'general','amazon':'general','aliexpress':'general','ebay':'general','rakuten':'general',
};

// Priority stores for articles
const PRIORITY_STORES = [
  'temu', 'amazon', 'aliexpress', 'shein', 'zalando', 'nike', 'adidas',
  'sephora', 'fnac', 'cdiscount', 'booking', 'asos', 'hm', 'decathlon',
  'ikea', 'darty', 'boulanger', 'la-redoute', 'puma', 'back-market',
];

// ─── Topic generators ────────────────────────────────────
const TOPICS = [
  (s: string, m: string) => `Codes promo ${s} : les meilleures offres de ${m}`,
  (s: string) => `${s} : notre guide pour ne jamais payer le prix fort`,
  (s: string, m: string) => `Comment économiser sur ${s} — nos astuces testées (${m})`,
  (s: string) => `On a testé les codes promo ${s} : voici ceux qui marchent`,
  (s: string, m: string) => `${s} : ${m}, le moment idéal pour acheter ?`,
  (s: string) => `Acheter malin sur ${s} : le guide complet`,
  (s: string) => `${s} pas cher : 7 techniques que personne ne vous dit`,
  (s: string, m: string) => `Promotions ${s} ${m} : notre sélection vérifiée`,
  (s: string) => `Faut-il craquer pour les deals ${s} ? Notre avis honnête`,
  (s: string) => `${s} : comment notre équipe déniche les meilleurs codes`,
  (s: string, m: string) => `Les bons plans ${s} de ${m} que vous allez adorer`,
  (s: string) => `Réductions ${s} : ce que les autres sites ne vous disent pas`,
];

// ─── The humanized prompt ────────────────────────────────
function buildPrompt(storeName: string, storeSlug: string, title: string, month: string): string {
  return `Tu es un rédacteur shopping français chevronné qui travaille pour LockCoupon.com, un site de codes promo. Tu écris comme un VRAI blogueur passionné, pas comme une IA.

PERSONNALITÉ :
- Tu fais partie de l'équipe LockCoupon. Utilise "nous", "notre équipe", "on a testé"
- Tu es direct, parfois drôle, toujours authentique
- Tu donnes ton VRAI avis, y compris les points négatifs
- Tu racontes des expériences concrètes ("La semaine dernière, on a commandé sur ${storeName}...")

STYLE D'ÉCRITURE — ULTRA IMPORTANT :
- Alterne phrases courtes percutantes et phrases longues détaillées
- Commence certains paragraphes par : "Bon.", "Soyons honnêtes.", "Petit secret.", "Entre nous.", "OK,", "Résultat ?", "Le truc,"
- JAMAIS ces expressions : "En conclusion", "Il est important de noter", "N'hésitez pas", "Dans cet article", "Découvrez", "Il convient de", "Force est de constater", "En somme", "En définitive"
- Utilise des parenthèses pour des apartés (comme si tu parlais à un pote)
- Pose des questions au lecteur : "Vous connaissez ce moment où...?"
- Mets des exemples de prix réels : "un t-shirt à 12,99€ au lieu de 29,99€"

STRUCTURE HTML :
- <h2> pour 4-5 sections principales
- <h3> pour les sous-sections
- <p> pour les paragraphes (VARIE leur longueur)
- <strong> pour les infos clés
- <ul><li> pour les listes pratiques (max 5 items)
- <blockquote> pour UNE astuce exclusive (style "conseil d'initié")

LIENS INTERNES (OBLIGATOIRE — en inclure exactement 2) :
- Lien 1 : <a href="/codes-promo/${storeSlug}">nos codes promo ${storeName} vérifiés</a>
- Lien 2 : <a href="/boutiques">toutes nos boutiques partenaires</a>
Place-les naturellement dans le texte, pas à la fin.

MOTS-CLÉS SEO (intègre-les naturellement, pas de bourrage) :
- "code promo ${storeName}"
- "réduction ${storeName}"
- "bon plan ${storeName}"
- "${storeName} ${month}"
- "économiser sur ${storeName}"

CONSIGNES TECHNIQUES :
- PAS de titre H1 (il est géré séparément)
- Article de 700-900 mots
- Commence DIRECTEMENT par le HTML, pas de backticks, pas de commentaires
- Pas de "```html" ni de "```"

SUJET : "${title}"

Écris maintenant.`;
}

// ─── Main handler ────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key configured' }, { status: 500 });

  try {
    // Get stores, prefer priority stores
    const { data: allStores } = await supabase.from('stores').select('name, slug');
    if (!allStores || allStores.length === 0) {
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }

    // Filter to priority stores that exist in DB
    const priorityAvailable = allStores.filter(s => PRIORITY_STORES.includes(s.slug));
    const storePool = priorityAvailable.length > 0 ? priorityAvailable : allStores;

    // Check what we posted recently to avoid duplicates
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('title')
      .gte('created_at', new Date(Date.now() - 3 * 86400000).toISOString());

    const recentStoreNames = (recentPosts || []).map(p => {
      const match = PRIORITY_STORES.find(slug => {
        const store = allStores.find(s => s.slug === slug);
        return store && p.title.toLowerCase().includes(store.name.toLowerCase());
      });
      return match;
    }).filter(Boolean);

    // Pick a store not posted about recently
    let store = storePool[Math.floor(Math.random() * storePool.length)];
    let tries = 0;
    while (recentStoreNames.includes(store.slug) && tries < 15) {
      store = storePool[Math.floor(Math.random() * storePool.length)];
      tries++;
    }

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const topicFn = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const title = topicFn(store.name, month);
    const prompt = buildPrompt(store.name, store.slug, title, month);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Claude API: ${errText}` }, { status: 500 });
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '';
    if (!rawContent) return NextResponse.json({ error: 'Empty response from Claude' }, { status: 500 });

    // Clean output
    const content = rawContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[\s\n]+/, '')
      .trim();

    // Generate excerpt (first 160 chars of plain text)
    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const excerpt = plainText.substring(0, 155) + '...';

    // Generate unique slug
    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 75)
      + '-' + Date.now().toString(36);

    // Pick cover image
    const cat = STORE_CAT[store.slug] || 'general';
    const coverList = COVERS[cat] || COVERS.general;
    const coverImage = coverList[Math.floor(Math.random() * coverList.length)];

    // Save to DB
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

    return NextResponse.json({
      success: true,
      title,
      store: store.name,
      slug,
      words: plainText.split(/\s+/).length,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
