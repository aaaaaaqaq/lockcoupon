import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getAllStores } from '@/lib/supabase';

export const revalidate = 60; // ISR: rebuild every 60s

export default async function HomePage() {
  const stores = await getAllStores();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-white text-[36px] md:text-[48px] font-extrabold leading-tight mb-4">
            Codes promo &amp; réductions<br />
            <span className="text-primary">vérifiées</span> chaque jour
          </h1>
          <p className="text-white/60 text-[16px] md:text-[18px] max-w-xl mx-auto">
            Économisez sur vos achats avec nos codes promo testés et mis à jour quotidiennement.
          </p>
        </div>
      </section>

      {/* Store grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-text-main text-[24px] font-extrabold mb-6">
          Boutiques populaires
        </h2>

        {stores.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-[18px] mb-2">Aucune boutique disponible</p>
            <p className="text-[14px]">Ajoutez des boutiques dans Supabase pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/codes-promo/${store.slug}`}
                className="bg-white border border-border rounded-xl p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[24px] font-bold group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: store.logo_color || '#C0392B' }}
                >
                  {store.logo_letter || store.name[0]}
                </div>
                <span className="text-text-main text-[14px] font-semibold text-center">
                  {store.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-10">
        <div className="max-w-[1200px] mx-auto px-4 py-8 text-center text-muted text-[13px]">
          © {new Date().getFullYear()} LockCoupon.com — Tous droits réservés.
        </div>
      </footer>
    </>
  );
}
