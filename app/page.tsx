import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllStores } from '@/lib/supabase';

export const revalidate = 60;

export default async function HomePage() {
  const stores = await getAllStores();

  return (
    <>
      <Navbar />

      <section className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-16 text-center">
          <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-tight mb-3">
            Économisez avec les <span className="text-primary">meilleurs codes promo</span>
          </h1>
          <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto mb-6">
            Codes promo vérifiés &amp; mis à jour chaque jour. 100% gratuit.
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-[13px] font-medium">🏪 {stores.length}+ boutiques</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-[13px] font-medium">🔥 Mis à jour aujourd&apos;hui</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-[13px] font-medium">✅ 98% taux de succès</div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold">Boutiques populaires</h2>
          <span className="text-muted text-[13px]">{stores.length} boutiques</span>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-[18px] mb-2">Aucune boutique disponible</p>
            <p className="text-[14px]">Ajoutez des boutiques depuis le panneau admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/codes-promo/${store.slug}`}
                className="bg-white border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white text-[20px] md:text-[24px] font-bold group-hover:scale-105 transition-transform shadow-sm"
                    style={{ backgroundColor: store.logo_color || '#C0392B' }}
                  >
                    {store.logo_letter || store.name[0]}
                  </div>
                )}
                <span className="text-text-main text-[12px] md:text-[14px] font-semibold text-center leading-tight">
                  {store.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
