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

// ─── 3 different offer types for variety ──────────────────
const OFFER_TEMPLATES = [
  {
    title: '30% de réduction sur toute votre commande',
    description: 'Profitez de 30% de réduction immédiate sur l\'ensemble du site Temu, sans minimum d\'achat. Code valable pour les nouveaux clients comme pour les anciens. Cumulable avec les ventes flash en cours.',
    discount_value: '30',
    discount_type: 'percent' as const,
    type: 'code' as const,
    is_best: true,
    is_exclusive: true,
  },
  {
    title: '100€ de coupons offerts dès l\'inscription',
    description: 'Bénéficiez d\'un pack de 100€ de coupons à utiliser sur vos prochaines commandes Temu. Offre exclusive pour les nouveaux utilisateurs. Les coupons sont répartis en plusieurs réductions valables sur différentes catégories.',
    discount_value: '100',
    discount_type: 'euro' as const,
    type: 'code' as const,
    is_best: false,
    is_exclusive: true,
  },
  {
    title: '40% de réduction sur la catégorie Mode',
    description: 'Code exclusif pour profiter de 40% de réduction sur toute la catégorie Mode et accessoires. Vêtements homme, femme et enfant inclus. Stock limité, l\'offre peut s\'arrêter à tout moment.',
    discount_value: '40',
    discount_type: 'percent' as const,
    type: 'code' as const,
    is_best: false,
    is_exclusive: false,
  },
];

// ─── Pick N unique random items ────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
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

    // 2. Delete the existing top 3 Temu coupons (those marked as best/exclusive)
    // We delete the 3 most recent code-type coupons to replace them
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

    // 4. Build expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    // 5. Insert 3 new coupons
    const newCoupons = selectedCodes.map((code, i) => ({
      store_id: store.id,
      title: OFFER_TEMPLATES[i].title,
      code: code.toUpperCase(),
      description: OFFER_TEMPLATES[i].description,
      discount_value: OFFER_TEMPLATES[i].discount_value,
      discount_type: OFFER_TEMPLATES[i].discount_type,
      type: OFFER_TEMPLATES[i].type,
      expiry_date: expiryStr,
      is_best: OFFER_TEMPLATES[i].is_best,
      is_exclusive: OFFER_TEMPLATES[i].is_exclusive,
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
