import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Conditions d'utilisation — LockCoupon",
  description: "Conditions générales d'utilisation du site LockCoupon.com.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
        <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-2">Conditions d&apos;utilisation</h1>
        <p className="text-muted text-[14px] mb-8">Dernière mise à jour : Mars 2026</p>

        <div className="text-muted text-[15px] leading-relaxed space-y-6">
          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">1. Acceptation des conditions</h2>
            <p>En accédant et en utilisant le site LockCoupon (https://lockcoupon.com), vous acceptez d&apos;être lié par les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">2. Description du service</h2>
            <p>LockCoupon est une plateforme gratuite qui référence des codes promo, réductions et bons plans pour des boutiques en ligne. Nous faisons notre possible pour vérifier les codes publiés, mais nous ne pouvons garantir leur validité à tout moment, les marchands pouvant modifier ou supprimer leurs offres sans préavis.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">3. Liens d&apos;affiliation</h2>
            <p>Notre site contient des liens d&apos;affiliation. Lorsque vous cliquez sur un lien et effectuez un achat sur le site du marchand, LockCoupon peut percevoir une commission. Cette commission ne modifie en rien le prix que vous payez.</p>
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
            <h2 className="text-text-main text-[20px] font-bold mb-3">6. Comportement de l&apos;utilisateur</h2>
            <p>En utilisant notre site, vous vous engagez à ne pas : utiliser le site à des fins illégales, tenter de compromettre la sécurité du site, publier du contenu frauduleux ou trompeur, ou utiliser des robots ou scripts automatisés.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">7. Newsletter</h2>
            <p>En vous inscrivant à notre newsletter, vous consentez à recevoir des emails promotionnels de notre part. Vous pouvez vous désabonner à tout moment en cliquant sur le lien de désabonnement présent dans chaque email.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">8. Modification des conditions</h2>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page. Nous vous encourageons à consulter régulièrement cette page.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">9. Droit applicable</h2>
            <p>Les présentes conditions sont régies par le droit applicable. Tout litige relatif à l&apos;utilisation de ce site sera soumis aux tribunaux compétents.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">10. Contact</h2>
            <p>Pour toute question concernant ces conditions, veuillez nous contacter à contact@lockcoupon.com ou via notre <a href="/contact" className="text-primary hover:underline">page de contact</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
