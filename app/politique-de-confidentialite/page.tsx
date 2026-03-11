import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — LockCoupon',
  description: 'Politique de confidentialité de LockCoupon. Découvrez comment nous protégeons vos données personnelles.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
        <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-2">Politique de confidentialité</h1>
        <p className="text-muted text-[14px] mb-8">Dernière mise à jour : Mars 2026</p>

        <div className="text-muted text-[15px] leading-relaxed space-y-6">
          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">1. Introduction</h2>
            <p>Chez LockCoupon (accessible à l&apos;adresse https://lockcoupon.com), la protection de vos données personnelles est une priorité. Cette politique de confidentialité décrit les types d&apos;informations que nous collectons et comment nous les utilisons.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <p className="mt-2">
              <strong className="text-text-main">Données fournies volontairement :</strong> adresse email (lors de l&apos;inscription à la newsletter), nom et message (via le formulaire de contact).
            </p>
            <p className="mt-2">
              <strong className="text-text-main">Données collectées automatiquement :</strong> adresse IP, type de navigateur, pages visitées, durée de visite (via des cookies analytiques).
            </p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">3. Utilisation des données</h2>
            <p>Vos données sont utilisées pour : vous envoyer notre newsletter (si vous vous êtes inscrit), améliorer notre site et nos services, répondre à vos demandes de contact, et analyser le trafic du site de manière anonyme.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">4. Cookies</h2>
            <p>Notre site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur à tout moment.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">5. Partage des données</h2>
            <p>Nous ne vendons, n&apos;échangeons ni ne transférons vos données personnelles à des tiers, sauf si cela est nécessaire pour le fonctionnement de notre site (hébergement, analyse) ou si la loi l&apos;exige.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">6. Liens d&apos;affiliation</h2>
            <p>LockCoupon contient des liens d&apos;affiliation vers des sites marchands. Lorsque vous cliquez sur ces liens et effectuez un achat, nous pouvons recevoir une commission, sans coût supplémentaire pour vous. Cela nous permet de maintenir notre service gratuit.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">7. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : contact@lockcoupon.com</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">8. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.</p>
          </section>

          <section>
            <h2 className="text-text-main text-[20px] font-bold mb-3">9. Contact</h2>
            <p>Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter à contact@lockcoupon.com ou via notre <a href="/contact" className="text-primary hover:underline">page de contact</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
