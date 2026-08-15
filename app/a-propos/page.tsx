import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'LockCoupon est la plateforme française de codes promo vérifiés. Découvrez notre mission, notre fonctionnement et notre engagement qualité.',
  alternates: {
    canonical: 'https://www.lockcoupon.com/a-propos',
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="max-w-[800px] mx-auto px-4 pt-6">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">À propos</li>
          </ol>
        </nav>

        <article className="max-w-[800px] mx-auto px-4 py-10 md:py-16">
          <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-6">À propos de LockCoupon</h1>

          <div className="text-muted text-[15px] leading-relaxed space-y-5">
            <p>
              <strong className="text-text-main">LockCoupon</strong> est votre destination de confiance pour trouver les meilleurs codes promo et réductions vérifiées en France. Notre mission est simple : vous faire économiser de l&apos;argent sur vos achats en ligne, sans effort et en toute confiance.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Notre mission</h2>
            <p>
              Chaque jour, notre équipe recherche, vérifie et met à jour les codes promo des plus grandes boutiques en ligne françaises et internationales. Nous nous assurons que chaque code publié sur notre site est fonctionnel et à jour. Les codes expirés sont automatiquement retirés pour vous garantir la meilleure expérience possible.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Comment ça marche ?</h2>
            <p>
              C&apos;est simple et 100% gratuit. Trouvez la boutique qui vous intéresse parmi nos{' '}
              <Link href="/boutiques" className="text-primary hover:underline">partenaires</Link>.
              Choisissez le code promo ou l&apos;offre qui correspond à votre besoin.
              Copiez le code en un clic et appliquez-le lors de votre achat.
              Profitez de votre réduction !
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Nos engagements qualité</h2>
            <p>
              LockCoupon se distingue par la rigueur de sa vérification. Chaque code promo est testé manuellement ou automatiquement avant d&apos;être publié. Nous affichons le nombre d&apos;utilisations pour chaque offre, ce qui vous permet de choisir en toute transparence. Quand un code cesse de fonctionner, il est retiré de la liste lors de nos passages de vérification quotidiens.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Nos chiffres</h2>
            <p>
              Avec des centaines de codes promo actifs sur près de 100 boutiques suivies quotidiennement, LockCoupon est la plateforme de référence pour les acheteurs malins en France. Consultez notre{' '}
              <Link href="/top-codes-promo" className="text-primary hover:underline">top 20 des codes promo</Link>{' '}
              pour découvrir les offres les plus populaires du moment.
            </p>

            <h2 className="text-text-main text-[24px] font-bold mt-8 mb-3">Nous contacter</h2>
            <p>
              Vous avez une question, une suggestion ou un partenariat à proposer ? N&apos;hésitez pas à nous écrire via notre{' '}
              <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.
              Vous pouvez aussi nous envoyer un email directement à partnerships@lockcoupon.com.
            </p>
          </div>

          {/* Cross-links (issue 8) */}
          <nav aria-label="Pages associées" className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3 text-[13px]">
            <Link href="/boutiques" className="text-primary hover:underline font-semibold">→ Toutes les boutiques</Link>
            <Link href="/top-codes-promo" className="text-primary hover:underline font-semibold">→ Top codes promo</Link>
            <Link href="/guide-achat" className="text-primary hover:underline font-semibold">→ Guide d&apos;achat</Link>
            <Link href="/blog" className="text-primary hover:underline font-semibold">→ Blog</Link>
            <Link href="/contact" className="text-primary hover:underline font-semibold">→ Contact</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
