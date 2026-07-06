import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStoreBySlug, getCouponsByStoreId } from '@/lib/supabase';


export const revalidate = 60;

const month = () => new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

function monthYearCap(): string {
  const s = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateMetadata(): Metadata {
  return {
  title: `Code Promo Temu Nouveau Client — ${monthYearCap()}`,
  description: 'Code promo Temu nouveau client : jusqu\'à 90% sur votre première commande. Offres vérifiées pour les nouveaux utilisateurs.',
  alternates: { canonical: 'https://www.lockcoupon.com/codes-promo/temu/nouveau-client' },
  openGraph: {
    title: 'Code Promo Temu Nouveau Client',
    description: 'Offres exclusives Temu pour les nouveaux clients. Codes vérifiés.',
    url: '/codes-promo/temu/nouveau-client',
    siteName: 'LockCoupon',
    locale: 'fr_FR',
    type: 'website',
  },
  };
}

export default async function TemuNouveauClientPage() {
  const store = await getStoreBySlug('temu');
  if (!store) notFound();
  const coupons = await getCouponsByStoreId(store.id);
  const m = month();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Comment obtenir un code promo Temu nouveau client ?', acceptedAnswer: { '@type': 'Answer', text: 'Pour obtenir un code promo Temu nouveau client, rendez-vous sur LockCoupon et copiez l\'un de nos codes vérifiés. Créez ensuite un nouveau compte Temu et appliquez le code lors de votre première commande.' } },
      { '@type': 'Question', name: 'Quel est le montant de la réduction Temu première commande ?', acceptedAnswer: { '@type': 'Answer', text: 'Les réductions Temu pour les nouveaux clients varient de 30% à 90% selon les offres en cours. Certains codes offrent également la livraison gratuite sur la première commande.' } },
      { '@type': 'Question', name: 'Peut-on cumuler le code nouveau client avec d\'autres promotions ?', acceptedAnswer: { '@type': 'Answer', text: 'En général, le code nouveau client Temu ne se cumule pas avec d\'autres codes promo. Cependant, il est souvent cumulable avec les promotions de prix affichées sur les produits.' } },
      { '@type': 'Question', name: 'Le code promo Temu nouveau client a-t-il une date d\'expiration ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, les codes promo nouveau client Temu ont une durée de validité limitée. Consultez régulièrement LockCoupon pour les offres les plus récentes et vérifiées.' } },
      { '@type': 'Question', name: 'Que faire si mon code Temu nouveau client ne fonctionne pas ?', acceptedAnswer: { '@type': 'Answer', text: 'Vérifiez que vous utilisez bien un nouveau compte Temu. Si le code est expiré, essayez un autre code disponible sur LockCoupon. Nos offres sont mises à jour quotidiennement.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.lockcoupon.com' },
      { '@type': 'ListItem', position: 2, name: 'Temu', item: 'https://www.lockcoupon.com/codes-promo/temu' },
      { '@type': 'ListItem', position: 3, name: 'Nouveau Client', item: 'https://www.lockcoupon.com/codes-promo/temu/nouveau-client' },
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
              <Link href="/" className="hover:text-white/60">Accueil</Link> → <Link href="/codes-promo/temu" className="hover:text-white/60">Temu</Link> → Nouveau Client
            </nav>
            <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
              Code Promo <span className="text-primary">Temu Nouveau Client</span>
            </h1>
            <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
              Offres exclusives pour votre première commande — {m}
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-4">
              Pourquoi les nouveaux clients Temu sont privilégiés
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                Temu investit massivement pour conquérir de nouveaux clients en France. Résultat : les offres de bienvenue sont parmi les plus généreuses du marché e-commerce. On parle de réductions allant de 30% à 90% sur votre première commande, parfois avec la livraison gratuite en bonus.
              </p>
              <p>
                Soyons honnêtes : ces offres existent parce que Temu sait que si vous êtes satisfait de votre première commande, vous reviendrez. C&apos;est un investissement marketing, pas de la charité. Mais pour vous, c&apos;est tout bénéfice. Un code promo Temu nouveau client peut transformer une commande de 50€ en une facture de 15€. Ça vaut le coup d&apos;en profiter.
              </p>
              <p>
                Notre équipe chez <Link href="/" className="text-primary hover:underline">LockCoupon</Link> vérifie chaque jour les codes promo Temu pour s&apos;assurer qu&apos;ils fonctionnent. Voici les offres actuelles pour les nouveaux clients.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              {coupons.length} codes promo Temu disponibles en {m}
            </h2>
            <div className="space-y-3 mb-8">
              {coupons.slice(0, 8).map((c) => (
                <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-text-main text-[15px] font-semibold">{c.title}</p>
                    {c.expiry_date && <p className="text-muted text-[12px] mt-1">Expire le {new Date(c.expiry_date).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <Link href="/codes-promo/temu" className="bg-primary hover:bg-primary-dark text-white text-[13px] font-bold px-4 py-2 rounded-lg shrink-0">
                    Voir le code
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mb-10">
              <Link href="/codes-promo/temu" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-colors">
                Voir tous les codes Temu →
              </Link>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Comment utiliser un code Temu première commande
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Étape 1 :</strong> Rendez-vous sur cette page ou sur notre <Link href="/codes-promo/temu" className="text-primary hover:underline">page codes promo Temu</Link> et copiez le code qui vous intéresse.
              </p>
              <p>
                <strong>Étape 2 :</strong> Créez un nouveau compte sur Temu. Utilisez une adresse e-mail qui n&apos;a jamais été associée à un compte Temu. L&apos;application mobile offre souvent des avantages supplémentaires pour les nouveaux inscrits.
              </p>
              <p>
                <strong>Étape 3 :</strong> Ajoutez vos articles au panier et rendez-vous à l&apos;étape de paiement. Collez votre code promo dans le champ &quot;Code promo&quot; ou &quot;Coupon&quot;. La réduction s&apos;applique immédiatement.
              </p>
              <p>
                <strong>Astuce de pro :</strong> Téléchargez l&apos;application Temu plutôt que d&apos;utiliser le site web. Les offres nouveau client sont souvent plus avantageuses sur l&apos;app, avec parfois des jeux et des récompenses bonus réservés aux nouveaux utilisateurs.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-4">
              Ce qu&apos;il faut savoir avant votre première commande Temu
            </h2>
            <div className="text-muted text-[14px] md:text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Livraison :</strong> La livraison standard vers la France est gratuite pour la plupart des commandes. Comptez entre 7 et 15 jours ouvrables. Les transporteurs utilisés sont principalement Colissimo, Mondial Relay et La Poste.
              </p>
              <p>
                <strong>Douanes :</strong> Pour les commandes inférieures à 150€, aucun frais de douane supplémentaire. La TVA est incluse dans le prix affiché. Pas de mauvaise surprise à la livraison.
              </p>
              <p>
                <strong>Retours :</strong> Temu offre une politique de retour de 90 jours. Les retours sont gratuits via Mondial Relay avec une étiquette prépayée. En pratique, pour les petits montants, Temu propose souvent un remboursement sans retour du produit.
              </p>
              <p>
                <strong>Qualité :</strong> Soyons francs — la qualité varie d&apos;un produit à l&apos;autre. Consultez les avis avec photos, privilégiez les produits avec plus de 4,5/5 étoiles, et commencez par de petites commandes pour tester. Les articles basiques (accessoires, rangement, gadgets) offrent généralement le meilleur rapport qualité-prix.
              </p>
            </div>

            <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mt-10 mb-6">
              Questions fréquentes — Code promo Temu nouveau client
            </h2>
            <div className="space-y-3 mb-8">
              {[
                { q: 'Comment obtenir un code promo Temu nouveau client ?', a: 'Rendez-vous sur LockCoupon, copiez un code vérifié, puis créez un nouveau compte Temu et appliquez-le lors de votre première commande.' },
                { q: 'Quel est le montant de la réduction première commande ?', a: 'Les réductions varient de 30% à 90% selon les offres. Certains codes offrent aussi la livraison gratuite.' },
                { q: 'Peut-on cumuler le code avec d\'autres promos ?', a: 'Le code nouveau client ne se cumule généralement pas avec d\'autres codes, mais il est cumulable avec les prix réduits affichés.' },
                { q: 'Le code a-t-il une date d\'expiration ?', a: 'Oui, les codes ont une durée limitée. Consultez LockCoupon pour les offres les plus récentes.' },
                { q: 'Que faire si le code ne fonctionne pas ?', a: 'Vérifiez que vous utilisez un nouveau compte. Si le code est expiré, essayez un autre code sur LockCoupon.' },
              ].map((item, i) => (
                <details key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 text-text-main text-[15px] font-semibold cursor-pointer hover:bg-bg">{item.q}</summary>
                  <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="text-muted text-[14px] leading-relaxed">
              Découvrez aussi nos <Link href="/codes-promo/temu/livraison-gratuite" className="text-primary hover:underline">codes livraison gratuite Temu</Link>,
              notre guide <Link href="/codes-promo/temu/parrainage" className="text-primary hover:underline">parrainage Temu</Link>,
              et parcourez <Link href="/boutiques" className="text-primary hover:underline">toutes nos boutiques</Link> pour trouver d&apos;autres bons plans.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
