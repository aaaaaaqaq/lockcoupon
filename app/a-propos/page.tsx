import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'À propos — LockCoupon',
  description: 'Découvrez LockCoupon, votre plateforme de codes promo vérifiés et de réductions exclusives.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
        <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-6">À propos de LockCoupon</h1>

        <div className="prose prose-lg text-muted text-[15px] leading-relaxed space-y-5">
          <p>
            <strong className="text-text-main">LockCoupon</strong> est votre destination de confiance pour trouver les meilleurs codes promo et réductions vérifiées. Notre mission est simple : vous faire économiser de l&apos;argent sur vos achats en ligne.
          </p>

          <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Notre mission</h2>
          <p>
            Chaque jour, notre équipe recherche, vérifie et met à jour les codes promo des plus grandes boutiques en ligne. Nous nous assurons que chaque code publié sur notre site est fonctionnel et à jour.
          </p>

          <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Comment ça marche ?</h2>
          <p>
            C&apos;est simple et 100% gratuit :
          </p>
          <p>
            1. Trouvez la boutique qui vous intéresse parmi nos partenaires.<br />
            2. Choisissez le code promo ou l&apos;offre qui correspond à votre besoin.<br />
            3. Copiez le code et appliquez-le lors de votre achat.<br />
            4. Profitez de votre réduction !
          </p>

          <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Nos chiffres</h2>
          <p>
            Avec des centaines de codes promo actifs, des milliers d&apos;utilisateurs satisfaits et un taux de succès de 98%, LockCoupon est la plateforme de référence pour les acheteurs malins.
          </p>

          <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Nous contacter</h2>
          <p>
            Vous avez une question, une suggestion ou un partenariat à proposer ? N&apos;hésitez pas à nous écrire via notre <a href="/contact" className="text-primary hover:underline">page de contact</a>.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
