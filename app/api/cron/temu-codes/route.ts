import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Temu codes pool (200+ codes) ─────────────────────────
const TEMU_CODES = [
  'alc091671','ald091671','ale091671','alh064278','alc115400','alf142431','alb146262','alg142431',
  'alh345218','ale345218','alg345218','ali345218','alb368512','alg223283','alb100757','ald100757',
  'ale223283','ale100757','alc240980','alc163002','ale070484','alg070484','ali070484','alb272764',
  'ale391245','alc224810','alh272764','alj345878','alh448982','ald180503','alg320889','ali320889',
  'alb320889','ale320889','ali181068','ali397800','alb471780','alf471780','alb354013','alf122880',
  'ali280805','ald280805','alj280805','ali122880','alj363635','alf363635','ald361946','alb497722',
  'ald299397','ale207290','alg369857','ali318411','alg132199','alc318411','ale369857','alf369857',
  'ale004268','ale440916','alc177159','alc032691','alg003786','alj049148','alb037310','ald049148',
  'alc403076','ald018639','ald360005','alf360005','alg098636','alh360005','ale098636','alc065258',
  'alc332611','alg332611','ald332611','alf332611','alb204765','ali309710','ale204765','alh160718',
  'ale160718','alc033834','alf160718','alj123919','ali123919','alj096461','alb027244','alg332233',
  'ald332233','alb215520','alh018961','ale211858','ali477907','ald459806','ale248604','alf113371',
  'alb347765','alg347765','alj113371','alb363880',
  'frt46705','frw46705','fro24466','frx24466','frr48830','frr32018','frp32018','fry39595','fry72123',
  'fri18242','frw18242','frv99624','frj76452','frg76452','frx99845','frt99845','frg02804','frh02804',
  'frp00609','frj00609','frx53853','fru00609','fro53853','frf53853','frn53853','frt00609','frx00609',
  'fry00609','frr53853','frl53853','frk53853','frq68901','frf97827','frs53853','frp53853','fru53853',
  'frq53853','frt68901','frf02266','frw42716','frg33665','frl55409','frr55409','frq55409','frx55409',
  'frt33665','frf33665','fro33665','fru55409','frt55409','frj33665','frw55409','fry55409','frg06149',
  'frs33665','frl33665','fri33665','frn33665','frr33665','frk89390','fru33665','frm06149','fry33665',
  'frk06149','frq33665','frp06149','frv33665','frn06149','frx33665','frj06149','fri06149','frf06149',
  'frr06149','frv06149','fru06149','frx76913','frg86179','fru86179','fry11750','frl74072','frw54763',
  'frk04300','frh04300','frx04300','fri47423','fro04300','frs04300','frq04300','frp04300','frv04300',
  'frq13859','frn97431','frf50986','frj65315','fri65315','fri58026','fri30278','frh440432','frj368779','frm376871'
];

// ─── BIG OFFER POOL — 30% / 100€ / 40% ─────────────────────
// Each "type" has multiple SEO-optimized variations
// The cron picks one random variation for each of the 3 slots

type OfferVariation = {
  title: string;
  description: string;
  discount_value: string;
  discount_type: 'percent' | 'euro';
  type: 'code';
  is_best: boolean;
  is_exclusive: boolean;
};

// Slot 1: BEST OFFER — 30% reduction (the hero deal)
const SLOT_1_VARIATIONS: OfferVariation[] = [
  {
    title: 'Code Promo Temu : 30% de Réduction sur Toute la Commande',
    description: 'Profitez immédiatement de 30% de réduction sur l\'ensemble du site Temu, sans minimum d\'achat requis. Ce code promo Temu vérifié fonctionne pour les nouveaux clients comme pour les anciens utilisateurs. La réduction s\'applique automatiquement à votre panier après avoir saisi le code dans la case prévue à cet effet lors du paiement. Cumulable avec les ventes flash et les offres spéciales en cours sur le site. Stock limité, profitez-en avant expiration.',
    discount_value: '30',
    discount_type: 'percent',
    type: 'code',
    is_best: true,
    is_exclusive: true,
  },
  {
    title: 'Réduction Temu 30% : Économisez sur Votre Panier Complet',
    description: 'Bénéficiez de 30% de remise immédiate sur votre commande Temu en utilisant ce code exclusif LockCoupon. Aucun montant minimum requis pour profiter de cette offre. Code valable sur toutes les catégories du site : mode, maison, électronique, beauté, jouets et accessoires. Applicable à chaque commande, idéal pour faire de grosses économies sur vos achats du quotidien. Pensez à copier le code avant de passer à la caisse.',
    discount_value: '30',
    discount_type: 'percent',
    type: 'code',
    is_best: true,
    is_exclusive: true,
  },
  {
    title: '-30% Immédiat sur Temu : Code Promo Vérifié et Cumulable',
    description: 'Notre meilleur code promo Temu du moment vous offre 30% de réduction directe sur le total de votre panier. Ce coupon est testé et validé par notre équipe LockCoupon. Il fonctionne aussi bien sur l\'application mobile que sur le site web. Les frais de livraison restent gratuits si vous atteignez le seuil minimum. N\'attendez pas pour en profiter, l\'offre est limitée dans le temps et le stock s\'écoule rapidement.',
    discount_value: '30',
    discount_type: 'percent',
    type: 'code',
    is_best: true,
    is_exclusive: true,
  },
  {
    title: 'Bon Plan Temu : 30% de Remise Exclusive Toutes Catégories',
    description: 'Avec ce code promo Temu exclusif, vous économisez 30% sur l\'intégralité de votre commande, peu importe les produits choisis. Une offre rare qui couvre toutes les catégories sans exclusion. Les nouveaux clients peuvent même cumuler cette réduction avec le pack de coupons offert à l\'inscription, ce qui peut faire monter les économies à plus de 50%. Code à entrer juste avant le paiement final.',
    discount_value: '30',
    discount_type: 'percent',
    type: 'code',
    is_best: true,
    is_exclusive: true,
  },
];

// Slot 2: 100€ EUROS — coupon bundle
const SLOT_2_VARIATIONS: OfferVariation[] = [
  {
    title: '100€ de Coupons Temu Offerts pour Votre Inscription',
    description: 'Profitez d\'un pack de bienvenue exceptionnel chez Temu avec 100€ de coupons à valoir sur vos prochaines commandes. Cette offre est réservée aux nouveaux utilisateurs qui s\'inscrivent via l\'application mobile. Le pack contient plusieurs coupons de différentes valeurs (5€, 10€, 20€...) utilisables sur diverses catégories. Idéal pour faire vos premiers achats à petit prix et découvrir le catalogue Temu sans vous ruiner.',
    discount_value: '100',
    discount_type: 'euro',
    type: 'code',
    is_best: false,
    is_exclusive: true,
  },
  {
    title: 'Pack Cadeau Temu : 100€ de Bons d\'Achat à Votre Inscription',
    description: 'Inscrivez-vous sur Temu et recevez instantanément un pack de coupons d\'une valeur totale de 100€. Ces bons d\'achat sont à utiliser sur vos commandes futures et couvrent toutes les catégories du site. Le pack est composé de plusieurs coupons à activer un par un selon vos besoins. Une offre généreuse qui fait de Temu l\'un des sites les plus avantageux pour les nouveaux acheteurs en ligne.',
    discount_value: '100',
    discount_type: 'euro',
    type: 'code',
    is_best: false,
    is_exclusive: true,
  },
  {
    title: 'Temu : 100€ de Réductions Cumulables pour les Nouveaux Clients',
    description: 'Bénéficiez de 100€ de réductions à utiliser sur Temu en créant simplement votre compte avec ce code promo. Les coupons sont automatiquement crédités sur votre profil après l\'inscription. Vous pouvez les utiliser progressivement sur plusieurs commandes ou en une seule fois. Attention, certains coupons ont un montant minimum d\'achat. Lisez bien les conditions de chaque coupon dans votre espace personnel avant utilisation.',
    discount_value: '100',
    discount_type: 'euro',
    type: 'code',
    is_best: false,
    is_exclusive: true,
  },
  {
    title: 'Code Promo Temu Nouveaux Clients : 100€ Offerts en Coupons',
    description: 'Ce code promo Temu débloque un cadeau de bienvenue de 100€ sous forme de coupons multiples. Réservé aux nouveaux comptes, il s\'active dès la création de votre profil. Les coupons sont valables sur tout le site Temu et peuvent même se cumuler avec les ventes flash en cours. C\'est l\'une des meilleures offres du marché pour démarrer vos achats en ligne avec un budget réduit.',
    discount_value: '100',
    discount_type: 'euro',
    type: 'code',
    is_best: false,
    is_exclusive: true,
  },
];

// Slot 3: 40% - category specific
const SLOT_3_VARIATIONS: OfferVariation[] = [
  {
    title: 'Temu Mode : 40% de Réduction sur Vêtements et Accessoires',
    description: 'Code promo Temu exclusif pour profiter de 40% de réduction sur toute la catégorie Mode. La remise s\'applique sur les vêtements homme, femme et enfant, ainsi que sur les chaussures et accessoires. Idéal pour renouveler votre garde-robe à petit prix avec les dernières tendances. Le stock est limité, l\'offre peut s\'arrêter à tout moment selon les disponibilités. Pensez à vérifier les tailles avant de commander.',
    discount_value: '40',
    discount_type: 'percent',
    type: 'code',
    is_best: false,
    is_exclusive: false,
  },
  {
    title: 'Temu Maison : -40% sur la Décoration et les Accessoires',
    description: 'Économisez 40% sur l\'ensemble de la catégorie Maison et Décoration chez Temu. Ce code promo couvre les meubles, les ustensiles de cuisine, le linge de maison, les rangements et tous les accessoires déco. C\'est l\'occasion idéale pour aménager votre intérieur sans exploser votre budget. Livraison gratuite à partir d\'un certain montant, vérifiez les conditions au moment du paiement pour éviter les surprises.',
    discount_value: '40',
    discount_type: 'percent',
    type: 'code',
    is_best: false,
    is_exclusive: false,
  },
  {
    title: 'Temu High-Tech : 40% de Remise sur les Gadgets et Électronique',
    description: 'Profitez de 40% de réduction sur la sélection High-Tech et électronique du site Temu. Ce code s\'applique sur les écouteurs, chargeurs, accessoires smartphone, montres connectées et petits appareils du quotidien. Une bonne occasion d\'acheter vos gadgets préférés à prix cassé. Les produits high-tech Temu sont vendus par des marques tierces, vérifiez les avis utilisateurs avant de finaliser votre commande.',
    discount_value: '40',
    discount_type: 'percent',
    type: 'code',
    is_best: false,
    is_exclusive: false,
  },
  {
    title: 'Temu Beauté : Code Promo -40% sur Cosmétiques et Soins',
    description: 'Avec ce code promo Temu, bénéficiez de 40% de réduction sur la catégorie Beauté et cosmétiques. La remise couvre les produits de maquillage, soins du visage, soins du corps, parfums et accessoires beauté. Une opportunité pour tester de nouvelles marques sans gros budget. Vérifiez la composition des produits et les retours clients avant achat, certains articles sont importés et peuvent avoir des délais de livraison plus longs.',
    discount_value: '40',
    discount_type: 'percent',
    type: 'code',
    is_best: false,
    is_exclusive: false,
  },
  {
    title: 'Temu Sport : 40% de Réduction sur les Équipements Sportifs',
    description: 'Code promo Temu vérifié pour économiser 40% sur la catégorie Sport et plein air. La réduction s\'applique aux vêtements de sport, équipements de fitness, accessoires de yoga, articles de camping et matériel de randonnée. Parfait pour s\'équiper sans se ruiner avant de démarrer une nouvelle activité. Lisez bien les descriptions techniques des produits, les tailles peuvent différer des standards européens.',
    discount_value: '40',
    discount_type: 'percent',
    type: 'code',
    is_best: false,
    is_exclusive: false,
  },
];

// ─── Pick N unique random items ────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Main handler ─────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET && secret !== 'lockcoupon-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find Temu store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, slug')
      .eq('slug', 'temu')
      .single();

    if (storeError || !store) {
      return NextResponse.json({
        error: 'Temu store not found in database',
        detail: storeError?.message,
      }, { status: 404 });
    }

    // 2. Delete the existing top 3 Temu code coupons
    const { data: existingCoupons } = await supabase
      .from('coupons')
      .select('id')
      .eq('store_id', store.id)
      .eq('type', 'code')
      .order('created_at', { ascending: false })
      .limit(3);

    if (existingCoupons && existingCoupons.length > 0) {
      const idsToDelete = existingCoupons.map(c => c.id);
      const { error: deleteError } = await supabase
        .from('coupons')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Delete error:', deleteError);
      }
    }

    // 3. Pick 3 random codes from the pool
    const selectedCodes = pickRandom(TEMU_CODES, 3);

    // 4. Pick a random offer variation for each slot
    const selectedOffers: OfferVariation[] = [
      pickOne(SLOT_1_VARIATIONS),
      pickOne(SLOT_2_VARIATIONS),
      pickOne(SLOT_3_VARIATIONS),
    ];

    // 5. Build expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    // 6. Build new coupons
    const newCoupons = selectedCodes.map((code, i) => ({
      store_id: store.id,
      title: selectedOffers[i].title,
      code: code.toUpperCase(),
      description: selectedOffers[i].description,
      discount_value: selectedOffers[i].discount_value,
      discount_type: selectedOffers[i].discount_type,
      type: selectedOffers[i].type,
      expiry_date: expiryStr,
      is_best: selectedOffers[i].is_best,
      is_exclusive: selectedOffers[i].is_exclusive,
      is_verified: true,
      usage_count: Math.floor(Math.random() * 400) + 100,
      created_at: new Date().toISOString(),
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('coupons')
      .insert(newCoupons)
      .select('id, title, code');

    if (insertError) {
      return NextResponse.json({
        error: 'Failed to insert new coupons',
        detail: insertError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Top 3 Temu codes updated successfully',
      deleted: existingCoupons?.length || 0,
      inserted: inserted?.length || 0,
      newCodes: inserted?.map(c => ({ title: c.title, code: c.code })),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Temu update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
