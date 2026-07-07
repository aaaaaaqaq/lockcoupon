import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingSitemap, notifyGoogle } from '@/lib/google-indexing';
import { submitIndexNow } from '@/lib/indexnow';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
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

// ─── Opening hook pool: 20 structurally diverse intros ──────────────────────
// Each hook is a function that returns 2-3 sentences of raw HTML.
// They vary in: register (anecdote / stat / question / provocation / scene-setting).
// NEVER add "Vous connaissez ce moment où" — that phrase is banned.
const OPENING_HOOKS: Array<(s: string, m: string) => string> = [
  (s) => `<p>Franchement, on va pas se mentir : trouver un vrai bon plan sur ${s}, c'est souvent la croix et la bannière. On passe des heures à chercher, on finit sur des forums à moitié morts, et les codes qu'on trouve sont expirés depuis six mois. C'est pour ça qu'on a décidé de faire le travail à votre place.</p>`,
  (s, m) => `<p>En ${m}, ${s} reste l'une des boutiques les plus recherchées par les acheteurs français. Sauf que entre les prix affichés et ce que vous payez vraiment, il y a souvent un écart qui fait mal au portefeuille. Notre équipe a creusé, testé, et voilà ce qu'on a trouvé.</p>`,
  (s) => `<p>On a une règle chez LockCoupon : on ne publie pas un code promo tant qu'on ne l'a pas testé. ${s}, on connaît bien. Alors avant de vous lancer dans vos achats ce mois-ci, lisez ça — ça va vous faire économiser.</p>`,
  (s) => `<p>Un collègue m'a envoyé un screenshot l'autre jour : il avait payé le même article ${s} 34 % plus cher que moi. Même produit, même taille, même livraison. La différence ? Un code promo et un peu de méthode. C'est exactement ce qu'on partage ici.</p>`,
  (s) => `<p>Petit test : tapez "code promo ${s}" dans Google. Vous allez trouver des dizaines de sites avec des codes. La plupart ne fonctionnent pas. Quelques-uns si. On a fait ce tri pour vous — et on vous explique aussi pourquoi certains codes marchent et d'autres non.</p>`,
  (s, m) => `<p>${s} en ${m}, c'est un peu comme les soldes : si vous savez où regarder, vous faites des affaires. Si vous foncez tête baissée, vous payez plein pot. Après avoir passé plusieurs heures sur la plateforme ce mois-ci, voici notre bilan honnête.</p>`,
  (s) => `<p>Soyons directs : tout le monde ne paie pas le même prix sur ${s}. Ceux qui utilisent des codes promo, des alertes et les bonnes techniques paient souvent 15 à 30 % de moins. Ce guide, c'est pour rejoindre ce groupe-là.</p>`,
  (s) => `<p>Notre équipe surveille ${s} depuis plusieurs mois. On note les hausses de prix, les promotions récurrentes, les périodes creuses. Ce mois-ci, on partage tout ce qu'on a observé — avec les codes qui fonctionnent vraiment au moment où vous lisez ces lignes.</p>`,
  (s) => `<p>Trois minutes. C'est le temps qu'il faut pour appliquer un code promo ${s} et économiser parfois plus de vingt euros sur une commande. Si vous n'avez pas encore cette habitude, ce guide va changer ça.</p>`,
  (s, m) => `<p>Le marché des codes promo en France a changé. Les bons plans sont de plus en plus éphémères, les conditions de plus en plus strictes. En ${m}, voici ce qui marche vraiment chez ${s} — et ce qui ne vaut plus la peine d'être essayé.</p>`,
  (s) => `<p>On teste beaucoup de boutiques chez LockCoupon. ${s} fait partie de celles qui reviennent régulièrement dans nos tops — mais pas pour les raisons qu'on croit. Les vraies économies ne sont pas là où la plupart des gens regardent. Explications.</p>`,
  (s) => `<p>Il y a deux types d'acheteurs sur ${s} : ceux qui paient le prix affiché, et ceux qui savent que ce prix est rarement définitif. Si vous lisez cet article, vous faites déjà partie de la deuxième catégorie. Reste à utiliser les bons outils.</p>`,
  (s, m) => `<p>On a reçu plusieurs messages ce mois-ci de lecteurs qui cherchaient des bons plans ${s} valides en ${m}. Plutôt que de répondre au cas par cas, on a décidé de faire un guide complet. Voilà ce qu'il faut savoir.</p>`,
  (s) => `<p>Le problème avec la plupart des guides sur ${s}, c'est qu'ils sont écrits par des gens qui n'ont jamais vraiment commandé là-bas. Chez LockCoupon, on passe commande. On teste les codes. On chronomètre les livraisons. Ce que vous lisez ici, c'est du concret.</p>`,
  (s) => `<p>Avant de parler codes promo, un fait : ${s} pratique des prix qui varient régulièrement selon les périodes, les stocks et les segments de clientèle. Comprendre cette mécanique, c'est la première étape pour en profiter. La suite, c'est ce guide.</p>`,
  (s) => `<p>On ne va pas vous vendre du rêve. Tous les codes promo ${s} ne fonctionnent pas à chaque commande. Certains ont des conditions, des minimums d'achat, des catégories exclues. On vous dit lesquels valent vraiment le coup — et comment les utiliser sans mauvaises surprises.</p>`,
  (s, m) => `<p>Ce mois de ${m}, ${s} a lancé plusieurs promotions qu'on a décortiquées pour vous. Certaines sont des vraies opportunités. D'autres sont du marketing habillé en bonne affaire. Notre équipe a fait le tri — voici le résultat.</p>`,
  (s) => `<p>Acheter sur ${s} sans code promo en 2026, c'est un peu comme prendre le train sans vérifier les tarifs Prem's. Ça arrive, mais c'est évitable. Ce guide compile tout ce qu'on sait sur les réductions disponibles en ce moment.</p>`,
  (s) => `<p>La question qu'on nous pose souvent : "Est-ce que ça vaut vraiment le coup d'aller chercher un code promo avant chaque achat ?" Pour ${s}, la réponse courte est oui. La réponse longue, c'est cet article.</p>`,
  (s) => `<p>On suit ${s} depuis longtemps. On connaît les pics de promo, les périodes à éviter, les types d'offres qui reviennent. Tout ça condensé dans un guide pratique — sans blabla inutile, juste ce dont vous avez besoin pour économiser.</p>`,
];

// ─── The mega prompt for 1500+ word articles ─────────────
function buildPrompt(storeName: string, storeSlug: string, title: string, month: string): string {
  // Pick a random opening hook — guarantees structural diversity across articles
  const hookFn = OPENING_HOOKS[Math.floor(Math.random() * OPENING_HOOKS.length)];
  const openingHook = hookFn(storeName, month);

  return `Tu es un redacteur shopping francais chevronné qui travaille pour LockCoupon.com, un site de codes promo. Tu ecris comme un VRAI blogueur passionne, jamais comme une IA.

PERSONNALITE :
- Tu fais partie de l'equipe LockCoupon. Utilise "nous", "notre equipe", "on a teste"
- Tu es direct, parfois drole, toujours authentique
- Tu donnes ton VRAI avis, y compris les points negatifs
- Tu racontes des experiences concretes ("La semaine derniere, on a commande sur ${storeName}...")
- Tu compares avec d'autres sites concurrents

STYLE D'ECRITURE — ULTRA IMPORTANT :
- Alterne phrases courtes percutantes et phrases longues detaillees
- Commence certains paragraphes par : "Bon.", "Soyons honnetes.", "Petit secret.", "Entre nous.", "OK,", "Resultat ?", "Le truc,", "Attention.", "Pour etre franc,"
- JAMAIS ces expressions : "En conclusion", "Il est important de noter", "N'hesitez pas", "Dans cet article", "Decouvrez", "Il convient de", "Force est de constater", "En somme", "En definitive", "Il va sans dire", "Vous connaissez ce moment ou"
- Utilise des parentheses pour des apartes (comme si tu parlais a un pote)
- Mets des exemples de prix reels : "un t-shirt a 12,99 euros au lieu de 29,99 euros"
- Ajoute des anecdotes personnelles : "L'autre jour, un collegue m'a montre..."

LONGUEUR OBLIGATOIRE :
Tu DOIS ecrire un article d'au minimum 1500 mots. Developpe en profondeur chaque section. Ne resume PAS. Chaque section H2 doit contenir au moins 3-4 paragraphes detailles. C'est un article pilier SEO, pas un resume.

STRUCTURE HTML OBLIGATOIRE :

1. Introduction engageante (2-3 paragraphes)
COMMENCE l'introduction EXACTEMENT par ce bloc HTML fourni (ne le modifie pas, copie-le mot pour mot) :
${openingHook}
Puis continue avec 1-2 paragraphes de contexte supplementaires dans le meme esprit.

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

    // ── Anti-duplicate guard ──────────────────────────────────────────
    // The old behavior regenerated the same topic with a new timestamp
    // suffix after 3 days, creating 2-5 near-identical articles competing
    // in Google (cannibalization). Now: try up to 10 store+topic combos,
    // skip any whose slug base already exists in blog_posts.
    const slugBase = (t: string) => t
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 75);

    let title = '';
    let found = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidateStore = attempt === 0 ? store : storePool[Math.floor(Math.random() * storePool.length)];
      const topicFn = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const candidateTitle = topicFn(candidateStore.name, month);
      const { data: dup } = await supabase
        .from('blog_posts')
        .select('id')
        .like('slug', `${slugBase(candidateTitle)}%`)
        .limit(1);
      if (!dup || dup.length === 0) {
        store = candidateStore;
        title = candidateTitle;
        found = true;
        break;
      }
    }
    if (!found) {
      return NextResponse.json({ skipped: 'all candidate topics already covered — no duplicate created' });
    }

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
        temperature: 1.0,
        system: `Tu es Marc, redacteur senior chez LockCoupon.com. Tu as 8 ans d'experience en shopping en ligne et tu ecris pour de vraies personnes, pas pour des algorithmes. Ton style est direct, personnel, parfois ironique. Tu n'utilises JAMAIS de formules IA generiques. Chaque article que tu produis est unique dans sa structure et son accroche.`,
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

    // ── Notify Google immediately after publishing ──────────────────────────
    const newPostUrl = `https://www.lockcoupon.com/blog/${slug}`;
    const storePageUrl = `https://www.lockcoupon.com/codes-promo/${store.slug}`;
    await pingSitemap();
    await notifyGoogle([newPostUrl, 'https://www.lockcoupon.com/blog']);

    // ── IndexNow: submit new post + related store page to Bing/Yandex ────────
    await submitIndexNow([newPostUrl, storePageUrl, 'https://www.lockcoupon.com/blog']);

    return NextResponse.json({
      success: true,
      title,
      store: store.name,
      slug,
      words: wordCount,
      indexed: newPostUrl,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
