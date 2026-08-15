import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Comment LockCoupon protège vos données personnelles : collecte, utilisation, cookies, droits RGPD et sécurité de vos informations.',
  alternates: {
    canonical: 'https://www.lockcoupon.com/politique-de-confidentialite',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <nav aria-label="Fil d'Ariane" className="max-w-[800px] mx-auto px-4 pt-6">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">Politique de confidentialité</li>
          </ol>
        </nav>

        <article className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
          <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-2">Politique de confidentialité</h1>
          <p className="text-muted text-[14px] mb-8">Dernière mise à jour : Mars 2026</p>

          <div className="text-muted text-[15px] leading-relaxed space-y-6">
            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">1. Introduction</h2>
              <p>Chez LockCoupon (accessible à l&apos;adresse https://www.lockcoupon.com), la protection de vos données personnelles est une priorité. Cette politique de confidentialité décrit les types d&apos;informations que nous collectons, comment nous les utilisons et les mesures que nous prenons pour les protéger.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">2. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <p className="mt-2">
                <strong className="text-text-main">Données fournies volontairement :</strong> adresse email (lors de l&apos;inscription à la newsletter), nom et message (via le <Link href="/contact" className="text-primary hover:underline">formulaire de contact</Link>), et informations saisies lors de la <Link href="/ajouter-code" className="text-primary hover:underline">soumission d&apos;un code promo</Link>.
              </p>
              <p className="mt-2">
                <strong className="text-text-main">Données collectées automatiquement :</strong> adresse IP, type de navigateur, pages visitées, durée de visite (via des cookies analytiques).
              </p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">3. Utilisation des données</h2>
              <p>Vos données sont utilisées pour : vous envoyer notre newsletter (si vous vous êtes inscrit), améliorer notre site et nos services, répondre à vos demandes de contact, analyser le trafic du site de manière anonyme, et personnaliser votre expérience de navigation.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">4. Cookies</h2>
              <p>Notre site utilise des cookies essentiels pour son bon fonctionnement et des cookies analytiques pour comprendre comment les visiteurs interagissent avec notre site. Les cookies analytiques nous aident à améliorer la qualité de nos services. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur à tout moment.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">5. Partage des données</h2>
              <p>Nous ne vendons, n&apos;échangeons ni ne transférons vos données personnelles à des tiers, sauf si cela est nécessaire pour le fonctionnement de notre site (hébergement via Vercel, base de données Supabase) ou si la loi l&apos;exige.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">6. Liens d&apos;affiliation</h2>
              <p>LockCoupon contient des liens d&apos;affiliation vers des sites marchands. Lorsque vous cliquez sur ces liens et effectuez un achat, nous pouvons recevoir une commission, sans coût supplémentaire pour vous. Cela nous permet de maintenir notre service gratuit. Pour plus de détails, consultez nos <Link href="/conditions-utilisation" className="text-primary hover:underline">conditions d&apos;utilisation</Link>.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">7. Conservation des données</h2>
              <p>Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités décrites dans cette politique. Les données de newsletter sont conservées jusqu&apos;à votre désabonnement. Les données de contact sont conservées pendant 12 mois après votre dernier échange avec notre équipe.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">8. Vos droits (RGPD)</h2>
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation du traitement et de portabilité de vos données. Vous avez également le droit de retirer votre consentement à tout moment. Pour exercer ces droits, contactez-nous à : partnerships@lockcoupon.com</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">9. Sécurité</h2>
              <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Notre site utilise le protocole HTTPS pour chiffrer les communications.</p>
            </section>

            <section>
              <h2 className="text-text-main text-[20px] font-bold mb-3">10. Contact</h2>
              <p>Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter à partnerships@lockcoupon.com ou via notre <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.</p>
            </section>
          </div>

          {/* Cross-links (issue 8) */}
          <nav aria-label="Liens associés" className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3 text-[13px]">
            <Link href="/conditions-utilisation" className="text-primary hover:underline font-semibold">→ Conditions d&apos;utilisation</Link>
            <Link href="/a-propos" className="text-primary hover:underline font-semibold">→ À propos</Link>
            <Link href="/contact" className="text-primary hover:underline font-semibold">→ Contact</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
