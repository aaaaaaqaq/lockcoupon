import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';

export const revalidate = 60;

function monthYearCap(): string {
  const s = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateMetadata(): Metadata {
  return {
    title: `SHEIN Livraison Gratuite — Seuil & Codes (${monthYearCap()})`,
    description:
      'Livraison gratuite SHEIN : seuil de 29€, jours sans minimum, codes frais de port offerts. Délais, transporteurs et retours en France, vérifiés aujourd\u2019hui.',
    alternates: { canonical: 'https://www.lockcoupon.com/codes-promo/shein/livraison-gratuite' },
    openGraph: {
      title: 'SHEIN Livraison Gratuite — Le guide France',
      description: 'Seuils, codes et astuces vérifiés pour ne pas payer les frais de port SHEIN.',
      url: '/codes-promo/shein/livraison-gratuite',
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
    },
  };
}

export default async function SheinLivraisonGratuitePage() {
  const store = await getStoreBySlug('shein');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'À partir de quel montant la livraison SHEIN est-elle gratuite ?', acceptedAnswer: { '@type': 'Answer', text: 'La livraison standard SHEIN devient gratuite dès 29€ d\u2019achat en France métropolitaine. En dessous de ce seuil, comptez environ 4€ de frais de port. Le seuil peut être abaissé ou supprimé lors d\u2019opérations spéciales (jours livraison gratuite, événements promo).' } },
      { '@type': 'Question', name: 'Quels sont les délais de livraison SHEIN en France ?', acceptedAnswer: { '@type': 'Answer', text: 'La livraison standard prend 7 à 12 jours ouvrés, la livraison express 5 à 8 jours. Les commandes expédiées depuis les entrepôts européens de SHEIN arrivent en 3 à 6 jours.' } },
      { '@type': 'Question', name: 'Existe-t-il des jours de livraison gratuite sans minimum chez SHEIN ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui : SHEIN organise régulièrement des opérations « livraison gratuite » sans minimum d\u2019achat, souvent le dimanche ou lors des grands événements (anniversaire de la marque, 11.11, Black Friday). L\u2019information s\u2019affiche en bandeau sur le site et l\u2019application.' } },
      { '@type': 'Question', name: 'Un code livraison gratuite SHEIN se cumule-t-il avec un code promo ?', acceptedAnswer: { '@type': 'Answer', text: 'Un seul code par commande chez SHEIN. En revanche, la gratuité obtenue par le seuil de 29€ se cumule avec n\u2019importe quel code de réduction — c\u2019est la combinaison la plus avantageuse dans la majorité des cas.' } },
      { '@type': 'Question', name: 'Les retours SHEIN sont-ils gratuits ?', acceptedAnswer: { '@type': 'Answer', text: 'Le premier retour de chaque commande est gratuit pendant 35 jours (étiquette prépayée). Les retours suivants de la même commande sont facturés : groupez tous vos articles à renvoyer dans un seul colis.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'SHEIN', item: 'https://www.lockcoupon.com/codes-promo/shein' },
      { '@type': 'ListItem', position: 3, name: 'Livraison Gratuite', item: 'https://www.lockcoupon.com/codes-promo/shein/livraison-gratuite' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main>
        <section className="bg-[#1a1a1a] relative overflow-hidden">
          <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-16 text-center">
            <nav className="text-white/40 text-[13px] mb-4">
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/shein" className="hover:text-white/60">SHEIN</Link> → Livraison Gratuite
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              <span className="text-primary">SHEIN Livraison Gratuite</span> — {m}
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Seuil de 29€, jours sans minimum, codes frais de port offerts : le guide complet pour la France.
            </p>
            <p className="text-white/40 text-[13px] mt-4">✅ Codes vérifiés le {today}</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Comment obtenir la livraison gratuite chez SHEIN
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                La règle de base est simple : la livraison standard SHEIN est <strong>gratuite dès 29€ d&apos;achat</strong> vers la France métropolitaine. Sous ce seuil, les frais de port tournent autour de 4€ — soit près de 15% d&apos;un petit panier, de quoi annuler l&apos;intérêt d&apos;un code promo. La première décision à prendre avant de commander : atteindre le seuil ou attendre une opération sans minimum.
              </p>
              <p>
                Car SHEIN organise régulièrement des <strong>jours de livraison gratuite sans minimum</strong> : souvent le dimanche, et systématiquement pendant les grands rendez-vous de la marque (anniversaire fin mai-juin, 11.11, Black Friday). L&apos;information apparaît en bandeau sur le site et dans l&apos;application. Si votre panier fait 12€ et que rien ne presse, patienter jusqu&apos;au dimanche est souvent le meilleur « code promo » qui soit.
              </p>
              <p>
                Troisième levier : les codes et offres listés sur notre page <Link href="/codes-promo/shein" className="text-primary hover:underline">code promo SHEIN</Link> — certains combinent réduction et frais de port offerts, et l&apos;offre « livraison gratuite dès 29€ » y est suivie en permanence avec son statut vérifié.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Délais et modes de livraison SHEIN vers la France
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Mode</th>
                    <th className="px-4 py-3 text-center font-semibold">Délai</th>
                    <th className="px-4 py-3 text-center font-semibold">Prix</th>
                    <th className="px-4 py-3 text-center font-semibold">Transporteur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Standard</td>
                    <td className="px-4 py-3 text-center">7-12 jours ouvrés</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Gratuit dès 29€</td>
                    <td className="px-4 py-3 text-center">Colissimo / Mondial Relay</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Express</td>
                    <td className="px-4 py-3 text-center">5-8 jours ouvrés</td>
                    <td className="px-4 py-3 text-center">6-13€ (gratuit par palier)</td>
                    <td className="px-4 py-3 text-center">DHL / DPD</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Depuis entrepôt UE</td>
                    <td className="px-4 py-3 text-center">3-6 jours ouvrés</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Gratuit dès 29€</td>
                    <td className="px-4 py-3 text-center">Colissimo / Mondial Relay</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Point relais</td>
                    <td className="px-4 py-3 text-center">7-12 jours ouvrés</td>
                    <td className="px-4 py-3 text-center">Souvent le moins cher</td>
                    <td className="px-4 py-3 text-center">Mondial Relay</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Bon à savoir : de plus en plus de références sont expédiées depuis les <strong>entrepôts européens</strong> de SHEIN — le badge « expédition rapide » ou la mention d&apos;un délai court sur la fiche produit le signalent. Mêmes prix, mêmes codes, mais 3 à 6 jours de délai au lieu de 10. À panier égal, privilégiez ces références. Et comme chez Temu, la TVA est incluse dans le prix affiché : aucun frais de douane pour les commandes sous 150€.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Offres SHEIN actives — {m}
            </h2>
            <div className="space-y-3 mb-8">
              {coupons.slice(0, 6).map((c) => (
                <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-text-main text-[15px] font-semibold">{c.title}</p>
                    <p className="text-muted text-[12px] mt-1">{c.usage_count || 0} utilisations</p>
                  </div>
                  <Link href="/codes-promo/shein" className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-lg shrink-0">
                    Voir le code
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mb-10">
              <Link href="/codes-promo/shein" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                Tous les codes promo SHEIN →
              </Link>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              4 astuces pour ne jamais payer les frais de port SHEIN
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>1. Visez 29€, pas plus.</strong> Si votre panier est à 24€, ajoutez un basique à 5-6€ que vous auriez acheté de toute façon (chaussettes, accessoire) plutôt que de payer 4€ de port pour rien. Mais ne gonflez pas artificiellement un panier de 15€ : attendre un jour sans minimum est plus rentable.
              </p>
              <p>
                <strong>2. Groupez avec vos proches.</strong> Une commande commune passe le seuil instantanément et mutualise le suivi. SHEIN regroupe les articles dans un ou deux colis — partagez simplement le point relais.
              </p>
              <p>
                <strong>3. Choisissez le point relais.</strong> Mondial Relay est fiable, souvent moins cher que le domicile sous le seuil, et le colis vous attend au lieu de repartir en dépôt. C&apos;est aussi le canal des retours gratuits.
              </p>
              <p>
                <strong>4. Cumulez seuil + code promo.</strong> La gratuité par seuil n&apos;est pas un code : elle se cumule donc avec n&apos;importe quel code de réduction de notre page SHEIN, et avec vos points fidélité (100 points = 1€). Code -15% + livraison offerte + points : c&apos;est le trio gagnant sur un panier de 40-60€.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Livraison SHEIN France
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: 'À partir de combien la livraison SHEIN est-elle gratuite ?', a: 'Dès 29€ d\u2019achat en livraison standard vers la France métropolitaine. Sous ce seuil, comptez environ 4€ de frais.' },
                { q: 'Combien de temps prend une commande SHEIN ?', a: '7 à 12 jours ouvrés en standard, 5 à 8 en express, et 3 à 6 jours pour les articles expédiés depuis les entrepôts européens.' },
                { q: 'Y a-t-il des jours de livraison gratuite sans minimum ?', a: 'Oui, régulièrement — souvent le dimanche et pendant les grands événements SHEIN. L\u2019offre s\u2019affiche en bandeau sur le site et l\u2019application.' },
                { q: 'Le code livraison gratuite se cumule-t-il avec une réduction ?', a: 'Un seul code par commande, mais la gratuité par seuil (29€) se cumule avec tous les codes de réduction et les points fidélité.' },
                { q: 'Les retours SHEIN sont-ils gratuits ?', a: 'Le premier retour de chaque commande est gratuit sous 35 jours via étiquette prépayée ; les suivants sont facturés. Groupez vos renvois en un seul colis.' },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Voir aussi : <Link href="/codes-promo/shein" className="text-primary hover:underline">code promo SHEIN</Link>,{' '}
              <Link href="/codes-promo/temu/livraison-gratuite" className="text-primary hover:underline">livraison gratuite Temu</Link>,{' '}
              <Link href="/codes-promo/categorie/mode" className="text-primary hover:underline">codes promo mode</Link>,{' '}
              <Link href="/boutiques" className="text-primary hover:underline">toutes nos boutiques</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
