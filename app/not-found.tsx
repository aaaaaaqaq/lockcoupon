import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="max-w-[600px] mx-auto px-4 py-24 text-center">
        <div className="text-[72px] font-extrabold text-primary mb-4">404</div>
        <h1 className="text-text-main text-[24px] font-bold mb-3">Page introuvable</h1>
        <p className="text-muted text-[15px] mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Pas de souci, vous pouvez retrouver nos codes promo et bons plans depuis les liens ci-dessous.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-6 py-3 rounded-lg transition-colors"
        >
          Retour à l&apos;accueil
        </Link>

        {/* Additional internal links to help users and SEO (issue 8) */}
        <nav aria-label="Pages populaires" className="mt-12 pt-8 border-t border-border">
          <h2 className="text-text-main text-[18px] font-bold mb-4">Pages populaires</h2>
          <div className="flex flex-wrap justify-center gap-3 text-[13px]">
            <Link href="/boutiques" className="text-primary hover:underline font-semibold">Toutes les boutiques</Link>
            <Link href="/top-codes-promo" className="text-primary hover:underline font-semibold">Top codes promo</Link>
            <Link href="/guide-achat" className="text-primary hover:underline font-semibold">Guide d&apos;achat</Link>
            <Link href="/blog" className="text-primary hover:underline font-semibold">Blog</Link>
            <Link href="/contact" className="text-primary hover:underline font-semibold">Contact</Link>
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}
