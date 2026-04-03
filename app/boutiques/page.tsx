import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllStores } from '@/lib/supabase';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Toutes les boutiques — Codes promo | LockCoupon',
  description: 'Retrouvez toutes les boutiques avec codes promo et réductions vérifiées sur LockCoupon. Plus de 98 enseignes françaises avec des réductions mises à jour chaque jour.',
  alternates: {
    canonical: '/boutiques',
  },
};

export default async function BoutiquesPage() {
  const stores = await getAllStores();

  // Group stores by first letter
  const grouped: Record<string, typeof stores> = {};
  stores.forEach((store) => {
    const letter = store.name[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(store);
  });
  const sortedLetters = Object.keys(grouped).sort();

  return (
    <>
      <Navbar />

      <section className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12 text-center">
          <h1 className="text-white text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-tight mb-3">
            Toutes nos <span className="text-primary">boutiques</span>
          </h1>
          <p className="text-white/50 text-[14px] md:text-[16px]">
            {stores.length} boutiques avec codes promo vérifiés
          </p>
        </div>
      </section>

      {/* Letter navigation */}
      <div className="bg-white border-b border-border sticky top-[64px] z-40">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {sortedLetters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold text-muted hover:bg-primary hover:text-white transition-colors shrink-0"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-4 py-6">
        {sortedLetters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="mb-8">
            <h2 className="text-primary text-[24px] font-extrabold mb-4 border-b border-border pb-2">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {grouped[letter].map((store) => (
                <Link
                  key={store.id}
                  href={`/codes-promo/${store.slug}`}
                  className="bg-white border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-12 h-12 rounded-xl object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[20px] font-bold group-hover:scale-105 transition-transform shadow-sm"
                      style={{ backgroundColor: store.logo_color || '#C0392B' }}
                    >
                      {store.logo_letter || store.name[0]}
                    </div>
                  )}
                  <span className="text-text-main text-[12px] font-semibold text-center leading-tight">
                    {store.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
}
