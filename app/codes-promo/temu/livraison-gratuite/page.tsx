import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Temu Livraison Gratuite — Code Promo Juin 2026',
  description: 'Temu livraison gratuite en France : codes promo, seuils, délais. Tout savoir pour ne pas payer les frais de port.',
  alternates: { canonical: '/codes-promo/temu/livraison-gratuite' },
  openGraph: {
    title: 'Temu Livraison Gratuite — Codes Promo',
    description: 'Codes promo livraison gratuite Temu vérifiés. Expédition France.',
    url: '/codes-promo/temu/livraison-gratuite',
    siteName: 'LockCoupon',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function TemuLivraisonGratuitePage() {
  const store = await getStoreBySlug('temu');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'La livraison Temu est-elle gratuite en France ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, Temu propose la livraison standard gratuite vers la France pour la majorité des commandes, sans montant minimum. Les délais sont de 7 à 15 jours ouvrables.' } },
      { '@type': 'Question', name: 'Quels sont les délais de livraison Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'La livraison standard Temu vers la France prend entre 7 et 15 jours ouvrables. Une option express (3-7 jours) est parfois disponible moyennant un supplément.' } },
      { '@type': 'Question', name: 'Quels transporteurs Temu utilise en France ?', acceptedAnswer: { '@type': 'Answer', text: 'Temu utilise principalement Colissimo, Mondial Relay et La Poste pour les livraisons en France métropolitaine.' } },
      { '@type': 'Question', name: 'Y a-t-il des frais de douane sur les commandes Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Pour les commandes inférieures à 150€, il n\'y a pas de frais de douane supplémentaires. La TVA est incluse dans le prix affiché sur Temu.' } },
      { '@type': 'Question', name: 'Comment suivre ma commande Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Vous pouvez suivre votre commande directement dans l\'application Temu ou sur le site web, section "Mes commandes". Un numéro de suivi est fourni dès l\'expédition.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Temu', item: 'https://www.lockcoupon.com/codes-promo/temu' },
      { '@type': 'ListItem', position: 3, name: 'Livraison Gratuite', item: 'https://www.lockcoupon.com/codes-promo/temu/livraison-gratuite' },
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
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/temu" className="hover:text-white/60">Temu</Link> → Livraison Gratuite
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              <span className="text-primary">Temu Livraison Gratuite</span> — {m}
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Tout savoir sur la livraison Temu en France : frais, délais, codes promo.
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              La livraison Temu est-elle vraiment gratuite ?
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Oui — et c&apos;est l&apos;un des gros atouts de Temu. La livraison standard vers la France métropolitaine est gratuite pour la grande majorité des articles, sans montant minimum de commande. C&apos;est un avantage considérable quand on compare avec d&apos;autres marketplaces qui facturent 3 à 8€ de frais de port.
              </p>
              <p>
                Bon, il y a quand même des nuances. Certains articles volumineux ou lourds peuvent occasionner des frais de livraison supplémentaires. Et si vous optez pour la livraison express (3 à 7 jours au lieu de 7 à 15), un supplément est parfois demandé. Mais dans 90% des cas, vous ne payez rien pour la livraison.
              </p>
              <p>
                Pour les commandes depuis les entrepôts européens de Temu (oui, ils en ont maintenant), les délais sont encore plus courts : 3 à 7 jours ouvrables, toujours en livraison gratuite. Vérifiez la mention &quot;Expédié depuis l&apos;UE&quot; sur les produits concernés.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Délais de livraison Temu vers la France
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-center font-semibold">Délai</th>
                    <th className="px-4 py-3 text-center font-semibold">Prix</th>
                    <th className="px-4 py-3 text-center font-semibold">Transporteur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Standard</td>
                    <td className="px-4 py-3 text-center">7-15 jours</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Gratuit</td>
                    <td className="px-4 py-3 text-center">Colissimo / La Poste</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Express</td>
                    <td className="px-4 py-3 text-center">3-7 jours</td>
                    <td className="px-4 py-3 text-center">2-5€</td>
                    <td className="px-4 py-3 text-center">DHL / DPD</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Depuis entrepôt UE</td>
                    <td className="px-4 py-3 text-center">3-7 jours</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Gratuit</td>
                    <td className="px-4 py-3 text-center">Mondial Relay</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Codes promo Temu livraison — {m}
            </h2>
            <div className="space-y-3 mb-8">
              {coupons.slice(0, 6).map((c) => (
                <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-text-main text-[15px] font-semibold">{c.title}</p>
                    <p className="text-muted text-[12px] mt-1">{c.usage_count || 0} utilisations</p>
                  </div>
                  <Link href="/codes-promo/temu" className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-lg shrink-0">
                    Voir le code
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mb-10">
              <Link href="/codes-promo/temu" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                Tous les codes promo Temu →
              </Link>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Astuces pour optimiser votre livraison Temu
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Regroupez vos achats.</strong> Même si la livraison est gratuite, commander plusieurs articles en une seule commande réduit le nombre de colis et les risques de perte. Temu regroupe souvent les articles dans un même colis quand c&apos;est possible.
              </p>
              <p>
                <strong>Choisissez le bon point de livraison.</strong> Mondial Relay est souvent plus fiable que la livraison à domicile pour les petits colis. Vous récupérez votre colis dans un point relais proche, et pas de risque de le rater.
              </p>
              <p>
                <strong>Surveillez le suivi.</strong> Activez les notifications dans l&apos;app Temu pour être prévenu quand votre colis arrive en France. Les délais sont généralement respectés, mais les pics de commandes (11.11, Black Friday) peuvent rallonger les délais de 2-3 jours.
              </p>
              <p>
                <strong>Politique de retour.</strong> Les retours sont gratuits pendant 90 jours via Mondial Relay. Temu fournit une étiquette prépayée. Pour les articles à moins de 5€, ils offrent souvent un remboursement sans retour du produit — moins de galère pour tout le monde.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Douanes et TVA : pas de surprise
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Depuis juillet 2021, Temu inclut la TVA dans les prix affichés pour les commandes à destination de l&apos;Union européenne. Aucun frais de douane supplémentaire pour les commandes inférieures à 150€. Vous payez ce que vous voyez, point final.
              </p>
              <p>
                Pour les commandes supérieures à 150€, des droits de douane peuvent s&apos;appliquer. Notre conseil : si votre panier dépasse ce seuil, divisez en deux commandes séparées. C&apos;est légal et ça vous évite des frais imprévus.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Livraison Temu France
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: 'La livraison Temu est-elle gratuite en France ?', a: 'Oui, la livraison standard est gratuite pour la majorité des commandes, sans minimum d\'achat.' },
                { q: 'Combien de temps prend la livraison Temu ?', a: '7 à 15 jours ouvrables en standard, 3 à 7 jours depuis les entrepôts européens.' },
                { q: 'Quels transporteurs utilise Temu ?', a: 'Colissimo, Mondial Relay, La Poste, et parfois DHL/DPD pour l\'express.' },
                { q: 'Y a-t-il des frais de douane ?', a: 'Non pour les commandes sous 150€. La TVA est déjà incluse dans le prix affiché.' },
                { q: 'Comment suivre ma commande ?', a: 'Dans l\'app Temu, section "Mes commandes". Un numéro de suivi est fourni dès l\'expédition.' },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Voir aussi : <Link href="/codes-promo/temu/nouveau-client" className="text-primary hover:underline">codes promo Temu nouveau client</Link>,{' '}
              <Link href="/codes-promo/temu/parrainage" className="text-primary hover:underline">parrainage Temu</Link>,{' '}
              <Link href="/boutiques" className="text-primary hover:underline">toutes nos boutiques</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
