import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 120;
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

const PRIORITY_STORES = [
  'temu','amazon','aliexpress','shein','zalando','nike','adidas',
  'sephora','fnac','cdiscount','booking','asos','hm','decathlon',
  'ikea','darty','boulanger','la-redoute','puma','back-market',
];

const TOPICS = [
  (s: string, m: string) => `Codes promo ${s} : les meilleures offres de ${m}`,
  (s: string) => `${s} : notre guide complet pour ne jamais payer le prix fort`,
  (s: string, m: string) => `Comment economiser sur ${s} — nos astuces testees (${m})`,
  (s: string) => `On a teste les codes promo ${s} : voici ceux qui marchent vraiment`,
  (s: string, m: string) => `${s} : ${m}, le moment ideal pour acheter ?`,
  (s: string) => `Acheter malin sur ${s} : le guide ultime`,
  (s: string) => `${s} pas cher : 7 techniques que personne ne vous dit`,
  (s: string, m: string) => `Promotions ${s} ${m} : notre selection verifiee`,
  (s: string) => `Faut-il craquer pour les deals ${s} ? Notre avis honnete`,
  (s: string) => `${s} : comment notre equipe deniche les meilleurs codes`,
  (s: string, m: string) => `Les bons plans ${s} de ${m} que vous allez adorer`,
  (s: string) => `Reductions ${s} : ce que les autres sites ne vous disent pas`,
];

// ─── The mega prompt for 1500+ word articles ─────────────
function buildPrompt(storeName: string, storeSlug: string, title: string, month: string): string {
  return `Tu es un redacteur shopping francais chevronné qui travaille pour LockCoupon.com, un site de codes promo. Tu ecris comme un VRAI blogueur passionne, pas comme une IA.

PERSONNALITE :
- Tu fais partie de l'equipe LockCoupon. Utilise "nous", "notre equipe", "on a teste"
- Tu es direct, parfois drole, toujours authentique
- Tu donnes ton VRAI avis, y compris les points negatifs
- Tu racontes des experiences concretes ("La semaine derniere, on a commande sur ${storeName}...")
- Tu compares avec d'autres sites concurrents

STYLE D'ECRITURE — ULTRA IMPORTANT :
- Alterne phrases courtes percutantes et phrases longues detaillees
- Commence certains paragraphes par : "Bon.", "Soyons honnetes.", "Petit secret.", "Entre nous.", "OK,", "Resultat ?", "Le truc,", "Attention.", "Pour etre franc,"
- JAMAIS ces expressions : "En conclusion", "Il est important de noter", "N'hesitez pas", "Dans cet article", "Decouvrez", "Il convient de", "Force est de constater", "En somme", "En definitive", "Il va sans dire"
- Utilise des parentheses pour des apartes (comme si tu parlais a un pote)
- Pose des questions au lecteur : "Vous connaissez ce moment ou...?"
- Mets des exemples de prix reels : "un t-shirt a 12,99 euros au lieu de 29,99 euros"
- Ajoute des anecdotes personnelles : "L'autre jour, un collegue m'a montre..."

LONGUEUR OBLIGATOIRE :
Tu DOIS ecrire un article d'au minimum 1500 mots. Developpe en profondeur chaque section. Ne resume PAS. Chaque section H2 doit contenir au moins 3-4 paragraphes detailles. C'est un article pilier SEO, pas un resume.

STRUCTURE HTML OBLIGATOIRE :

1. Introduction engageante (2-3 paragraphes, accroche forte, contexte)

2. Section H2 : Presentation de ${storeName} et pourquoi c'est populaire (3-4 paragraphes)

3. Section H2 : Les types de codes promo disponibles chez ${storeName} (avec sous-sections H3 pour chaque type : pourcentage, euros, livraison, cashback)

4. Section H2 : Nos astuces exclusives pour maximiser les economies (5-6 astuces detaillees avec exemples concrets de prix)

5. Section H2 : Tableau comparatif (OBLIGATOIRE) — Compare ${storeName} avec 3-4 concurrents sur : livraison, retours, types de promo, programme fidelite. Utilise ce format HTML exact :
<table style="width:100%;border-collapse:collapse;margin:20px 0">
<thead><tr style="background:#1a1a1a;color:white"><th style="padding:12px;text-align:left">Critere</th><th style="padding:12px;text-align:center">${storeName}</th><th style="padding:12px;text-align:center">[Concurrent 1]</th><th style="padding:12px;text-align:center">[Concurrent 2]</th></tr></thead>
<tbody>
<tr style="border-bottom:1px solid #eee"><td style="padding:10px">...</td><td style="padding:10px;text-align:center">...</td><td style="padding:10px;text-align:center">...</td><td style="padding:10px;text-align:center">...</td></tr>
</tbody></table>

6. Section H2 : Notre verdict final (2-3 paragraphes, avis honnete avec points positifs ET negatifs)

7. Section FAQ (OBLIGATOIRE) — Exactement 5 questions/reponses detaillees en HTML :
<div style="margin-top:30px">
<h2>Questions frequentes sur les codes promo ${storeName}</h2>
<h3>Question ici ?</h3>
<p>Reponse detaillee de 3-4 phrases minimum...</p>
</div>

LIENS INTERNES (OBLIGATOIRE — exactement 2) :
- <a href="/codes-promo/${storeSlug}">nos codes promo ${storeName} verifies</a>
- <a href="/boutiques">toutes nos boutiques partenaires</a>
Place-les naturellement dans le texte.

MOTS-CLES SEO (integre-les naturellement) :
- "code promo ${storeName}"
- "reduction ${storeName}"
- "bon plan ${storeName}"
- "${storeName} ${month}"
- "economiser sur ${storeName}"

RAPPEL CRITIQUE :
- PAS de titre H1
- Minimum 1500 mots — developpe CHAQUE section en profondeur
- Commence DIRECTEMENT par le HTML
- Ne mets pas de blocs de code autour du HTML
- Inclus le tableau comparatif et la FAQ obligatoirement

SUJET : "${title}"

Ecris maintenant un article massif et detaille.`;
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
    const { data: allStores } = await supabase.from('stores').select('name, slug');
    if (!allStores || allStores.length === 0) {
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }

    const priorityAvailable = allStores.filter(s => PRIORITY_STORES.includes(s.slug));
    const storePool = priorityAvailable.length > 0 ? priorityAvailable : allStores;

    // Avoid stores posted about in last 3 days
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('title')
      .gte('created_at', new Date(Date.now() - 3 * 86400000).toISOString());

    const recentNames = (recentPosts || []).map(p => p.title.toLowerCase());

    let store = storePool[Math.floor(Math.random() * storePool.length)];
    let tries = 0;
    while (recentNames.some(t => t.includes(store.name.toLowerCase())) && tries < 20) {
      store = storePool[Math.floor(Math.random() * storePool.length)];
      tries++;
    }

    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const topicFn = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const title = topicFn(store.name, month);
    const prompt = buildPrompt(store.name, store.slug, title, month);

    // Call Claude API with high max_tokens for long articles
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
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
    const content = rawContent.replace(/```html\n?/gi, '').replace(/```\n?/g, '').replace(/^[\s\n]+/, '').trim();

    const plainText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).length;
    const excerpt = plainText.substring(0, 155) + '...';

    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 75)
      + '-' + Date.now().toString(36);

    const cat = STORE_CAT[store.slug] || 'general';
    const coverList = COVERS[cat] || COVERS.general;
    const coverImage = coverList[Math.floor(Math.random() * coverList.length)];

    const { error: dbError } = await supabase.from('blog_posts').insert({
      title, slug, excerpt, content, cover_image: coverImage,
      author: 'LockCoupon', is_published: true, updated_at: new Date().toISOString(),
    });

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      title,
      store: store.name,
      slug,
      words: wordCount,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
