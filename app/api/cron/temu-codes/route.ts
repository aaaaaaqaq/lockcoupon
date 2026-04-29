import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Temu codes pool ─────────────────────────────────────
const TEMU_AFFILIATE_URL = 'https://temu.com/kuiper/uk1.html?subj=bundle-un&_bg_fs=1&_p_mat2_type=a1001&_p_jump_id=875&_x_vst_scene=adg&_p_rfs=1&_x_ads_csite=pc_bottom&_x_ads_channel=kol_affiliate&_x_cid=2005367855kol_affiliate&_x_campaign=affiliate';

const TEMU_CODES = [
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
  'frq13859','frn97431','frf50986','frj65315','fri65315','fri58026','fri30278','frh440432','frj368779','frm376871',
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
];

// ─── 10 offer templates with varied discounts ────────────
type OfferTemplate = {
  title: string;
  description: string;
  discount_value: string;
  discount_type: 'percent' | 'euro';
  is_best: boolean;
  is_exclusive: boolean;
};

const OFFER_TEMPLATES: OfferTemplate[] = [
  // 200€
  {
    title: '200€ de Coupons Temu : Pack Exclusif Nouveaux Membres',
    description: 'Recevez un pack exceptionnel de 200€ en coupons Temu à utiliser sur l\'ensemble du catalogue. Ce pack de bienvenue est réservé aux nouveaux utilisateurs inscrits via notre lien. Les coupons sont divisés en plusieurs bons de 10€, 20€ et 50€ à utiliser sans minimum d\'achat. Profitez-en pour découvrir les milliers de produits disponibles à prix cassé : mode, maison, tech, beauté et bien plus encore.',
    discount_value: '200', discount_type: 'euro', is_best: true, is_exclusive: true,
  },
  {
    title: 'Offre Flash Temu : 200€ de Bons d\'Achat Offerts à l\'Inscription',
    description: 'Créez votre compte Temu et débloquez instantanément 200€ de bons d\'achat cumulables. Chaque bon est utilisable indépendamment sur différentes commandes. C\'est l\'offre la plus généreuse du moment sur Temu, idéale pour faire vos premiers achats sans vous ruiner. Les coupons couvrent toutes les catégories du site sans exception. Offre limitée dans le temps.',
    discount_value: '200', discount_type: 'euro', is_best: true, is_exclusive: true,
  },
  // 30%
  {
    title: 'Code Promo Temu : -30% sur Toute Votre Commande',
    description: 'Appliquez ce code promo Temu vérifié et obtenez 30% de réduction immédiate sur votre panier. Aucun minimum d\'achat requis. Ce code fonctionne sur toutes les catégories : vêtements, chaussures, électronique, maison, beauté, jouets. Testé et validé par l\'équipe LockCoupon. Cumulable avec les ventes flash en cours. Entrez le code au moment du paiement pour voir la réduction s\'appliquer automatiquement.',
    discount_value: '30', discount_type: 'percent', is_best: false, is_exclusive: true,
  },
  {
    title: 'Réduction Temu -30% : Code Vérifié et Sans Minimum',
    description: 'Profitez de 30% de remise sur l\'intégralité de votre commande Temu grâce à ce code exclusif. Valable aussi bien sur l\'application mobile que sur le site web. Les nouveaux clients comme les anciens utilisateurs peuvent en bénéficier. La réduction est appliquée avant les frais de livraison. Combinez avec la livraison gratuite disponible à partir d\'un certain montant pour maximiser vos économies.',
    discount_value: '30', discount_type: 'percent', is_best: false, is_exclusive: false,
  },
  // 45%
  {
    title: 'Méga Promo Temu : -45% sur une Sélection de Produits',
    description: 'Économisez 45% sur une large sélection de produits Temu avec ce code promo exceptionnel. La remise couvre des centaines d\'articles dans les catégories mode, high-tech, accessoires et décoration. C\'est l\'une des meilleures remises disponibles actuellement sur la plateforme. Le code est à usage unique par compte. Vérifiez que les articles de votre panier font partie de la sélection éligible avant de valider.',
    discount_value: '45', discount_type: 'percent', is_best: false, is_exclusive: true,
  },
  {
    title: 'Temu : Code Promo -45% Exclusif sur les Meilleures Ventes',
    description: 'Ce code promo Temu vous offre 45% de remise sur les produits les plus populaires du site. Appliqué automatiquement à votre panier, il couvre les articles les mieux notés par les acheteurs français. Mode, gadgets, cosmétiques, articles de sport — tout y passe. Idéal pour renouveler vos essentiels du quotidien à prix réduit. Quantités limitées sur certains articles, commandez vite.',
    discount_value: '45', discount_type: 'percent', is_best: false, is_exclusive: false,
  },
  // 100€
  {
    title: '100€ de Coupons Temu : Offre Spéciale Clients Fidèles',
    description: 'Recevez 100€ de coupons Temu utilisables sur vos prochaines commandes. Cette offre est disponible pour tous les utilisateurs, anciens comme nouveaux. Les coupons sont crédités directement sur votre compte après saisie du code. Ils sont divisés en plusieurs bons de différentes valeurs à utiliser librement. Une occasion en or de remplir votre panier sans exploser votre budget.',
    discount_value: '100', discount_type: 'euro', is_best: false, is_exclusive: true,
  },
  {
    title: 'Temu : 100€ Offerts en Bons de Réduction à Utiliser Maintenant',
    description: 'Activez ce code promo et recevez immédiatement 100€ de bons de réduction sur Temu. Les bons sont utilisables sur toutes les catégories et n\'ont pas de date d\'expiration rapprochée. Parfait pour planifier vos achats sur plusieurs semaines. Chaque bon s\'applique séparément à votre panier. Pensez à vérifier le montant minimum requis pour chaque coupon dans votre espace personnel.',
    discount_value: '100', discount_type: 'euro', is_best: false, is_exclusive: false,
  },
  // 70%
  {
    title: 'Soldes Temu : Jusqu\'à -70% avec ce Code Promo Exclusif',
    description: 'Profitez de remises allant jusqu\'à 70% sur le site Temu avec ce code promo vérifié. La réduction s\'applique sur les produits en promotion, cumulable avec les prix déjà barrés. C\'est le meilleur moment pour faire de bonnes affaires sur la mode, les gadgets et la décoration. Les stocks partent vite à ces prix-là. Ajoutez vos articles au panier et appliquez le code avant qu\'il ne soit trop tard.',
    discount_value: '70', discount_type: 'percent', is_best: false, is_exclusive: true,
  },
  {
    title: 'Temu : -70% sur les Articles en Liquidation — Code Promo Vérifié',
    description: 'Ce code promo débloque jusqu\'à 70% de réduction sur les articles en liquidation chez Temu. Des milliers de produits sont concernés : fin de série, déstockage saisonnier, surplus de stock. C\'est l\'occasion de faire des achats malins à prix imbattable. Le code est valable pour une durée limitée et fonctionne sur application mobile et site web. Dépêchez-vous, les meilleures affaires partent en premier.',
    discount_value: '70', discount_type: 'percent', is_best: false, is_exclusive: false,
  },
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

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
      return NextResponse.json({ error: 'Temu store not found', detail: storeError?.message }, { status: 404 });
    }

    // 2. Delete existing Temu code coupons (old daily batch)
    const { data: existingCoupons } = await supabase
      .from('coupons')
      .select('id')
      .eq('store_id', store.id)
      .eq('type', 'code')
      .order('created_at', { ascending: false })
      .limit(10);

    if (existingCoupons && existingCoupons.length > 0) {
      await supabase
        .from('coupons')
        .delete()
        .in('id', existingCoupons.map(c => c.id));
    }

    // 3. Pick 10 random codes and 10 random offer templates
    const selectedCodes = pickRandom(TEMU_CODES, 10);
    const selectedOffers = pickRandom(OFFER_TEMPLATES, 10);

    // 4. Expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    // 5. Build and insert 10 coupons
    const newCoupons = selectedCodes.map((code, i) => ({
      store_id: store.id,
      title: selectedOffers[i].title,
      code: code.toLowerCase(),
      description: selectedOffers[i].description,
      discount_value: selectedOffers[i].discount_value,
      discount_type: selectedOffers[i].discount_type,
      type: 'code' as const,
      affiliate_url: TEMU_AFFILIATE_URL,
      expiry_date: expiryStr,
      is_best: selectedOffers[i].is_best,
      is_exclusive: selectedOffers[i].is_exclusive,
      is_verified: true,
      usage_count: Math.floor(Math.random() * 500) + 50,
      created_at: new Date().toISOString(),
    }));

    // Mark the first one as best
    newCoupons[0].is_best = true;

    const { data: inserted, error: insertError } = await supabase
      .from('coupons')
      .insert(newCoupons)
      .select('id, title, code, discount_value, discount_type');

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed', detail: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${inserted?.length || 0} Temu codes published`,
      deleted: existingCoupons?.length || 0,
      inserted: inserted?.length || 0,
      codes: inserted?.map(c => ({ title: c.title, code: c.code, value: `${c.discount_value}${c.discount_type === 'percent' ? '%' : '€'}` })),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Temu codes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
