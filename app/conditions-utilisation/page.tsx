import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du site LockCoupon.com : règles d'usage, liens d'affiliation, propriété intellectuelle et responsabilité.",
  alternates: {
    canonical: 'https://www.lockcoupon.com/conditions-utilisation',
  },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <nav aria-label="Fil d'Ariane" className="max-w-[800px] mx-auto px-4 pt-6">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">Conditions d&apos;utilisation</li>
          </ol>
        </nav>

        <article className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
          <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-2">Conditions d&apos;utilisation</h1>
          <p className="text-muted text-[14px] mb-8">Dernière mise à jour : Mars 2026</p>

          <div className="text-muted text-[15px] leading-relaxed space-y-6">
            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">1. Acceptation des conditions</h2>
              <p>En accédant et en utilisant le site LockCoupon (https://www.lockcoupon.com), vous acceptez d&apos;être lié par les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">2. Description du service</h2>
              <p>LockCoupon est une plateforme gratuite qui référence des codes promo, réductions et bons plans pour des boutiques en ligne. Nous faisons notre possible pour vérifier les codes publiés, mais nous ne pouvons garantir leur validité à tout moment, les marchands pouvant modifier ou supprimer leurs offres sans préavis. Consultez nos <Link href="/boutiques" className="text-primary hover:underline">boutiques partenaires</Link> pour voir toutes les enseignes disponibles.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">3. Liens d&apos;affiliation</h2>
              <p>Notre site contient des liens d&apos;affiliation. Lorsque vous cliquez sur un lien et effectuez un achat sur le site du marchand, LockCoupon peut percevoir une commission. Cette commission ne modifie en rien le prix que vous payez. Ce modèle nous permet de maintenir un service entièrement gratuit pour tous nos utilisateurs.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">4. Propriété intellectuelle</h2>
              <p>L&apos;ensemble du contenu de ce site (textes, logos, images, design) est la propriété de LockCoupon ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est interdite.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">5. Limitation de responsabilité</h2>
              <p>LockCoupon ne peut être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation de notre site, y compris mais sans s&apos;y limiter : l&apos;expiration ou la non-validité d&apos;un code promo, les transactions effectuées sur des sites tiers, et toute interruption temporaire du service.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">6. Soumission de codes promo</h2>
              <p>Les utilisateurs peuvent <Link href="/ajouter-code" className="text-primary hover:underline">soumettre des codes promo</Link> via notre formulaire dédié. Chaque code soumis est vérifié par notre équipe avant publication. LockCoupon se réserve le droit de refuser ou de retirer tout code ne respectant pas nos critères de qualité.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">7. Comportement de l&apos;utilisateur</h2>
              <p>En utilisant notre site, vous vous engagez à ne pas : utiliser le site à des fins illégales, tenter de compromettre la sécurité du site, publier du contenu frauduleux ou trompeur, ou utiliser des robots ou scripts automatisés.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">8. Newsletter</h2>
              <p>En vous inscrivant à notre newsletter, vous consentez à recevoir des emails promotionnels de notre part. Vous pouvez vous désabonner à tout moment en cliquant sur le lien de désabonnement présent dans chaque email.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">9. Modification des conditions</h2>
              <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page. Nous vous encourageons à consulter régulièrement cette page.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">10. Droit applicable</h2>
              <p>Les présentes conditions sont régies par le droit français. Tout litige relatif à l&apos;utilisation de ce site sera soumis aux tribunaux compétents en France.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">11. Contact</h2>
              <p>Pour toute question concernant ces conditions, veuillez nous contacter à partnerships@lockcoupon.com ou via notre <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.</p>
            </section>
          </div>

          {/* Cross-links (issue 8) */}
          <nav aria-label="Liens associés" className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3 text-[13px]">
            <Link href="/politique-de-confidentialite" className="text-primary hover:underline font-semibold">→ Politique de confidentialité</Link>
            <Link href="/a-propos" className="text-primary hover:underline font-semibold">→ À propos</Link>
            <Link href="/contact" className="text-primary hover:underline font-semibold">→ Contact</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
