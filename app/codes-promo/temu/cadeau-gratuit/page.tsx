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
    title: `Temu Cadeau Gratuit — Comment ça marche (${monthYearCap()})`,
    description:
      'Cadeau gratuit Temu : roue de bienvenue, parrainage, jeux de l\u2019application. Ce qui est réel, ce qui est piège, et comment recevoir vos cadeaux sans frais.',
    alternates: { canonical: 'https://www.lockcoupon.com/codes-promo/temu/cadeau-gratuit' },
    openGraph: {
      title: 'Temu Cadeau Gratuit — Le guide complet',
      description: 'Roue cadeaux, parrainage, jeux Temu : comment obtenir de vrais cadeaux gratuits, vérifié par LockCoupon.',
      url: '/codes-promo/temu/cadeau-gratuit',
      siteName: 'LockCoupon',
      locale: 'fr_FR',
      type: 'website',
    },
  };
}

export default async function TemuCadeauGratuitPage() {
  const store = await getStoreBySlug('temu');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Les cadeaux gratuits Temu sont-ils réels ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, les programmes officiels (roue de bienvenue, cadeaux de parrainage, jeux de l\u2019application comme Fish Land) distribuent de vrais produits gratuits. En revanche, ils exigent presque toujours une action : inviter des amis, jouer quotidiennement ou effectuer une première commande.' } },
      { '@type': 'Question', name: 'Comment obtenir un cadeau gratuit sur Temu sans parrainage ?', acceptedAnswer: { '@type': 'Answer', text: 'Trois options sans inviter personne : la roue à coupons offerte à la création du compte, les articles à prix quasi nul réservés aux nouveaux clients, et les jeux quotidiens de l\u2019application qui créditent des coupons et petits produits gratuits.' } },
      { '@type': 'Question', name: 'Combien d\u2019amis faut-il inviter pour un cadeau Temu ?', acceptedAnswer: { '@type': 'Answer', text: 'Cela dépend de l\u2019opération : les campagnes classiques demandent 3 à 8 nouveaux utilisateurs. Les derniers paliers sont volontairement plus lents à remplir — c\u2019est le principe du jeu. Les cadeaux les plus accessibles se débloquent avec 2-3 filleuls réellement nouveaux sur Temu.' } },
      { '@type': 'Question', name: 'La livraison des cadeaux gratuits Temu est-elle payante ?', acceptedAnswer: { '@type': 'Answer', text: 'Non : les cadeaux débloqués via les programmes officiels sont expédiés avec la livraison standard gratuite de Temu, souvent regroupés avec une commande en cours. Aucun paiement n\u2019est demandé pour recevoir un cadeau légitime.' } },
      { '@type': 'Question', name: 'Un site externe qui promet des cadeaux Temu est-il fiable ?', acceptedAnswer: { '@type': 'Answer', text: 'Prudence : les cadeaux gratuits Temu ne se réclament QUE dans l\u2019application officielle. Tout site tiers qui demande vos identifiants ou un paiement pour « débloquer un cadeau Temu » est une arnaque.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Temu', item: 'https://www.lockcoupon.com/codes-promo/temu' },
      { '@type': 'ListItem', position: 3, name: 'Cadeau Gratuit', item: 'https://www.lockcoupon.com/codes-promo/temu/cadeau-gratuit' },
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
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/temu" className="hover:text-white/60">Temu</Link> → Cadeau Gratuit
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              <span className="text-primary">Temu Cadeau Gratuit</span> — {m}
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Roue de bienvenue, parrainage, jeux de l&apos;appli : ce qui donne de VRAIS cadeaux, et comment les recevoir.
            </p>
            <p className="text-white/40 text-[13px] mt-4">✅ Codes vérifiés le {today}</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Les cadeaux gratuits Temu : réels, mais pas magiques
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Oui, Temu distribue réellement des produits gratuits — c&apos;est même l&apos;un des piliers de sa stratégie d&apos;acquisition. Écouteurs, accessoires, gadgets, articles ménagers : les cadeaux débloqués via les programmes officiels sont expédiés gratuitement, comme n&apos;importe quelle commande. Mais soyons clairs sur la mécanique : rien n&apos;est « gratuit sans rien faire ». Chaque cadeau se gagne par une action qui rapporte de nouveaux utilisateurs ou de l&apos;engagement à la plateforme — inviter des amis, jouer chaque jour dans l&apos;application, ou effectuer une première commande.
              </p>
              <p>
                Cette page fait le tri entre les programmes légitimes, vérifiés par notre équipe en {m}, et les fausses promesses qui circulent sur les réseaux sociaux. Règle absolue avant de commencer : les cadeaux Temu se réclament <strong>uniquement dans l&apos;application officielle</strong>. Aucun site tiers, aucun lien WhatsApp « débloque ton cadeau ici » ne doit jamais vous demander vos identifiants ou un paiement.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Comparatif : les 4 façons d&apos;obtenir un cadeau gratuit Temu
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Méthode</th>
                    <th className="px-4 py-3 text-center font-semibold">Effort</th>
                    <th className="px-4 py-3 text-center font-semibold">Valeur du cadeau</th>
                    <th className="px-4 py-3 text-center font-semibold">Pour qui</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Roue de bienvenue</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Aucun</td>
                    <td className="px-4 py-3 text-center">Coupons jusqu&apos;à -100€</td>
                    <td className="px-4 py-3 text-center">Nouveaux comptes</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Parrainage (inviter des amis)</td>
                    <td className="px-4 py-3 text-center">Moyen à élevé</td>
                    <td className="px-4 py-3 text-center">Produits gratuits + crédits</td>
                    <td className="px-4 py-3 text-center">Tous les comptes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Jeux de l&apos;appli (Fish Land…)</td>
                    <td className="px-4 py-3 text-center">Quotidien, faible</td>
                    <td className="px-4 py-3 text-center">Petits produits + coupons</td>
                    <td className="px-4 py-3 text-center">Utilisateurs réguliers</td>
                  </tr>
                  <tr className="border-b border-border bg-bg">
                    <td className="px-4 py-3 font-medium">Codes promo vérifiés</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">Aucun</td>
                    <td className="px-4 py-3 text-center">Jusqu&apos;à -50% sur commande</td>
                    <td className="px-4 py-3 text-center">Selon le code</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>1. La roue de bienvenue.</strong> À la création d&apos;un compte, l&apos;application propose une roue à coupons : le lot est toujours gagnant et crédite un pack de bons de réduction fractionnés (par paliers de panier). Ce n&apos;est pas un produit physique, mais c&apos;est le « cadeau » le plus simple à obtenir — trente secondes, aucune invitation.
              </p>
              <p>
                <strong>2. Le parrainage.</strong> Le vrai programme de cadeaux physiques : vous partagez votre lien, et lorsque des personnes <em>réellement nouvelles</em> sur Temu créent un compte (et parfois passent une première commande), vous débloquez des produits gratuits par paliers. Comptez 3 à 8 filleuls selon les opérations. Les derniers pourcentages de la jauge se remplissent plus lentement — c&apos;est voulu, la plateforme calibre la difficulté. Notre conseil : visez les paliers intermédiaires, au rendement bien meilleur, et arrêtez-vous quand la jauge stagne.
              </p>
              <p>
                <strong>3. Les jeux quotidiens.</strong> Fish Land, arrosage de plantes, check-ins : quelques minutes par jour créditent coupons et petits articles gratuits, ajoutés à votre prochaine commande. Rentable uniquement si vous commandez déjà régulièrement sur Temu — n&apos;achetez jamais « pour ne pas perdre » un avantage de jeu.
              </p>
              <p>
                <strong>4. Les codes promo.</strong> Pas un cadeau à proprement parler, mais le levier le plus fiable : les <Link href="/codes-promo/temu" className="text-primary hover:underline">codes promo Temu vérifiés</Link> de notre page principale réduisent directement le panier, sans parrainage ni jeu. Combinez un code avec la roue de bienvenue pour une première commande, c&apos;est la combinaison la plus rentable.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Offres Temu actives — {m}
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
              Les pièges à éviter avec les « cadeaux gratuits »
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Les faux liens de cadeau.</strong> Des groupes WhatsApp, Telegram et TikTok diffusent des liens « réclame ton cadeau Temu » pointant vers des sites de phishing. Temu ne distribue jamais de cadeaux hors de son application officielle. Si un lien vous demande votre mot de passe Temu, vos coordonnées bancaires ou un « frais de dossier », fermez la page.
              </p>
              <p>
                <strong>Le parrainage en boucle fermée.</strong> Se parrainer soi-même avec un deuxième compte sur le même téléphone ou la même adresse viole les conditions de Temu : la plateforme croise appareil, adresse de livraison et moyen de paiement, et annule les cadeaux (voire les comptes). Un filleul ne compte que s&apos;il est réellement nouveau.
              </p>
              <p>
                <strong>Le coût caché du temps.</strong> Les jeux et jauges de parrainage sont conçus pour maximiser votre temps passé dans l&apos;application. Fixez-vous une limite : si un palier exige d&apos;inviter 8 personnes pour un gadget à 6€, un simple <Link href="/codes-promo/temu/code-reduction" className="text-primary hover:underline">code de réduction Temu</Link> sur votre prochaine commande sera plus rentable que la chasse au cadeau.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Cadeau gratuit Temu
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: 'Les cadeaux gratuits Temu sont-ils réels ?', a: 'Oui — roue de bienvenue, parrainage et jeux de l\u2019application distribuent de vrais coupons et produits. Chaque programme exige en revanche une action : inviter, jouer ou commander.' },
                { q: 'Comment avoir un cadeau sans inviter d\u2019amis ?', a: 'La roue de bienvenue (nouveaux comptes), les articles quasi gratuits réservés aux premiers achats et les jeux quotidiens de l\u2019appli fonctionnent sans aucun parrainage.' },
                { q: 'Combien de filleuls faut-il pour débloquer un cadeau ?', a: 'Selon les opérations : 2-3 pour les paliers accessibles, jusqu\u2019à 8 pour les gros lots. Seuls les utilisateurs réellement nouveaux sur Temu comptent.' },
                { q: 'Doit-on payer la livraison d\u2019un cadeau Temu ?', a: 'Non. Les cadeaux légitimes partent en livraison standard gratuite, souvent regroupés avec votre commande en cours. Tout « frais de livraison » demandé hors de l\u2019appli est une arnaque.' },
                { q: 'Le cadeau gratuit se cumule-t-il avec un code promo ?', a: 'Oui : les cadeaux et crédits de parrainage sont indépendants des codes. Vous pouvez appliquer un code vérifié de notre page Temu sur la commande qui accompagne votre cadeau.' },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Voir aussi : <Link href="/codes-promo/temu/code-reduction" className="text-primary hover:underline">code réduction Temu</Link>,{' '}
              <Link href="/codes-promo/temu/nouveau-client" className="text-primary hover:underline">code promo Temu nouveau client</Link>,{' '}
              <Link href="/codes-promo/temu/parrainage" className="text-primary hover:underline">parrainage Temu</Link>,{' '}
              <Link href="/codes-promo/temu/livraison-gratuite" className="text-primary hover:underline">livraison gratuite Temu</Link>,{' '}
              <Link href="/codes-promo/categorie/marketplace" className="text-primary hover:underline">codes promo marketplaces</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
