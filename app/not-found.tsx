import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="max-w-[600px] mx-auto px-4 py-24 text-center">
        <div className="text-[72px] font-extrabold text-primary mb-4">404</div>
        <h1 className="text-text-main text-[24px] font-bold mb-3">Page introuvable</h1>
        <p className="text-muted text-[15px] mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-bold text-[15px] px-6 py-3 rounded-lg transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </>
  );
}
