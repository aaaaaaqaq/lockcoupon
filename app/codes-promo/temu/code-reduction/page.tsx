import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';
import { bestDiscountLabel } from '@/lib/discount';

export const revalidate = 60;

function monthYearCap(): string {
  const s = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateMetadata(): Metadata {
  return {
    title: `Code Réduction Temu Valide — ${monthYearCap()}`,
    description:
      'Code réduction Temu testé aujourd\u2019hui : nouveaux clients, clients existants, packs coupons. Pourquoi certains codes échouent et lesquels fonctionnent vraiment.',
    alternates: { canonical: 'https://www.lockcoupon.com/codes-promo/temu/code-reduction' },
    openGraph: {
      title: 'Code Réduction Temu — Codes testés et valides',
      description: 'Les codes de réduction Temu vérifiés en caisse, avec leurs conditions exactes. Mis à jour plusieurs fois par jour.',
      url: '/codes-promo/temu/code-reduction',
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
    },
  };
}

export default async function TemuCodeReductionPage() {
  const store = await getStoreBySlug('temu');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const best = bestDiscountLabel(coupons);
  const codeCount = coupons.filter((c) => c.type === 'code').length;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Quel est le meilleur code réduction Temu en ce moment ?', acceptedAnswer: { '@type': 'Answer', text: `${best ? `La meilleure réduction Temu vérifiée atteint ${best}.` : 'Les meilleures réductions Temu du moment sont listées sur cette page.'} Les offres sont classées par intérêt : la plus forte figure en tête de liste avec ses conditions exactes (nouveau client, palier de panier, application).` } },
      { '@type': 'Question', name: 'Pourquoi mon code réduction Temu ne fonctionne pas ?', acceptedAnswer: { '@type': 'Answer', text: 'Trois causes dominent : le code est réservé aux nouveaux comptes et le vôtre a déjà commandé ; le code appartient à un pack à paliers et votre panier n\u2019atteint pas le minimum ; ou le code est exclusif à l\u2019application mobile. Vérifiez la condition affichée sous chaque code.' } },
      { '@type': 'Question', name: 'Les codes réduction Temu se cumulent-ils ?', acceptedAnswer: { '@type': 'Answer', text: 'Un seul code promo par commande, mais il se cumule avec les coupons de votre compte (roue de bienvenue, packs) et les ventes flash. L\u2019application choisit automatiquement la combinaison si plusieurs avantages sont actifs.' } },
      { '@type': 'Question', name: 'Existe-t-il des codes Temu pour les clients existants ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, mais ils sont plus rares que les offres de bienvenue : codes poussés par notification dans l\u2019application, coupons de relance après un panier abandonné, et codes publics ponctuels. Cette page les liste dès qu\u2019ils sont vérifiés.' } },
      { '@type': 'Question', name: 'Où entrer le code réduction sur Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Dans le panier, à l\u2019étape du paiement : champ « Code promo » (ou « Coupon ») juste au-dessus du récapitulatif. Sur l\u2019application, le champ se trouve sous la liste des articles, avant la validation du paiement.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Temu', item: 'https://www.lockcoupon.com/codes-promo/temu' },
      { '@type': 'ListItem', position: 3, name: 'Code Réduction', item: 'https://www.lockcoupon.com/codes-promo/temu/code-reduction' },
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
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/temu" className="hover:text-white/60">Temu</Link> → Code Réduction
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              <span className="text-primary">Code Réduction Temu</span> — {m}
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              {codeCount > 0 ? `${codeCount} codes de réduction testés en caisse` : 'Les codes de réduction Temu testés en caisse'}{best ? `, jusqu'à ${best}` : ''} — avec la condition exacte de chacun.
            </p>
            <p className="text-white/40 text-[13px] mt-4">✅ Codes vérifiés le {today}</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Pourquoi la moitié des codes réduction Temu « ne marchent pas »
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Tapez « code réduction Temu » sur un moteur de recherche et vous tombez sur des dizaines de codes recopiés de site en site, sans date ni condition. Le problème n&apos;est pas que Temu bloque les codes : c&apos;est que chaque code appartient à une <strong>famille</strong> précise, avec un public et des conditions propres. Un code « nouveau client » échouera toujours sur un compte qui a déjà commandé. Un bon « -25€ dès 120€ » restera muet sur un panier de 60€. Un code exclusif à l&apos;application ne passera jamais depuis le navigateur.
              </p>
              <p>
                Notre méthode est différente : chaque code de réduction publié sur cette page est testé sur un vrai panier avant publication, re-vérifié plusieurs fois par jour, et étiqueté avec sa famille exacte. Vous savez avant de copier si le code correspond à votre situation — c&apos;est ce qui fait la différence entre un code « valide » sur le papier et une réduction réellement appliquée en caisse.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Comparatif : les familles de codes réduction Temu
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Famille de code</th>
                    <th className="px-4 py-3 text-center font-semibold">Réduction typique</th>
                    <th className="px-4 py-3 text-center font-semibold">Condition</th>
                    <th className="px-4 py-3 text-center font-semibold">Où l&apos;utiliser</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Nouveau client</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Jusqu&apos;à -50%</td>
                    <td className="px-4 py-3 text-center">Compte jamais utilisé</td>
                    <td className="px-4 py-3 text-center">App ou site</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Pack coupons (paliers)</td>
                    <td className="px-4 py-3 text-center">-10€ à -25€ par bon</td>
                    <td className="px-4 py-3 text-center">Minimum par palier</td>
                    <td className="px-4 py-3 text-center">App surtout</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Client existant</td>
                    <td className="px-4 py-3 text-center">-5% à -20%</td>
                    <td className="px-4 py-3 text-center">Ponctuel, tous comptes</td>
                    <td className="px-4 py-3 text-center">App ou site</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Affilié / influenceur</td>
                    <td className="px-4 py-3 text-center">Variable</td>
                    <td className="px-4 py-3 text-center">Souvent = parrainage déguisé</td>
                    <td className="px-4 py-3 text-center">Prudence</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Codes réduction Temu actifs — {m}
            </h2>
            <div className="space-y-3 mb-8">
              {coupons.slice(0, 8).map((c) => (
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
              Mode d&apos;emploi : appliquer un code réduction Temu sans erreur
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Étape 1 — copiez le bon code.</strong> Choisissez ci-dessus un code dont la famille correspond à votre situation : nouveau compte, client existant, ou pack à paliers si votre panier est conséquent. Le code se copie en un clic.
              </p>
              <p>
                <strong>Étape 2 — passez par l&apos;application.</strong> Les prix sont identiques entre site et application, mais l&apos;app donne accès à davantage de coupons cumulables (roue de bienvenue, ventes flash horaires). Remplissez votre panier normalement.
              </p>
              <p>
                <strong>Étape 3 — collez le code au paiement.</strong> Le champ « Code promo » se trouve dans le récapitulatif, juste avant la validation. La réduction s&apos;affiche immédiatement sur le total. Si rien ne se passe, vérifiez le palier minimum et la famille du code — puis essayez le code suivant de la liste, plusieurs codes actifs coexistent presque toujours.
              </p>
              <p>
                <strong>Étape 4 — vérifiez le prix réel.</strong> Dernier réflexe : les prix barrés Temu sont parfois théâtraux. Comparez le prix final (code appliqué) avec la même référence sur une autre <Link href="/codes-promo/categorie/marketplace" className="text-primary hover:underline">marketplace</Link> — AliExpress ou Amazon vendent parfois le même article. La vraie réduction, c&apos;est celle sur le prix du marché, pas sur le prix barré.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Code réduction Temu
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: 'Quel est le meilleur code réduction Temu aujourd\u2019hui ?', a: `${best ? `La meilleure réduction vérifiée atteint ${best}. ` : ''}Les offres de cette page sont classées par intérêt : la plus forte est en tête de liste, avec ses conditions détaillées.` },
                { q: 'Pourquoi mon code est-il refusé ?', a: 'Vérifiez la famille du code : réservé nouveaux clients, palier de panier non atteint, ou exclusivité application. Ce sont les trois causes qui expliquent la quasi-totalité des refus.' },
                { q: 'Peut-on cumuler plusieurs codes Temu ?', a: 'Un seul code promo par commande, mais il se cumule avec les coupons du compte (roue, packs) et les ventes flash. L\u2019application applique automatiquement la meilleure combinaison.' },
                { q: 'Les codes influenceurs TikTok sont-ils fiables ?', a: 'Rarement : la plupart sont des liens de parrainage déguisés qui ne réduisent rien pour vous. Préférez les codes testés en caisse, avec conditions affichées, comme ceux de cette page.' },
                { q: 'À quelle fréquence cette page est-elle mise à jour ?', a: `Plusieurs fois par jour : les codes expirés sont retirés et les nouveaux apparaissent en tête de liste. Dernière vérification : le ${today}.` },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Voir aussi : <Link href="/codes-promo/temu/nouveau-client" className="text-primary hover:underline">code promo Temu nouveau client</Link>,{' '}
              <Link href="/codes-promo/temu/cadeau-gratuit" className="text-primary hover:underline">cadeau gratuit Temu</Link>,{' '}
              <Link href="/codes-promo/temu/livraison-gratuite" className="text-primary hover:underline">livraison gratuite Temu</Link>,{' '}
              <Link href="/codes-promo/temu/parrainage" className="text-primary hover:underline">parrainage Temu</Link>,{' '}
              <Link href="/codes-promo/categorie/marketplace" className="text-primary hover:underline">codes promo marketplaces</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
