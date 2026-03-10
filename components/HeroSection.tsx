'use client';

import { Store, Coupon } from '@/lib/supabase';

interface HeroProps {
  store: Store;
  coupons: Coupon[];
  onOpenBest: () => void;
}

export default function HeroSection({ store, coupons, onOpenBest }: HeroProps) {
  const totalCodes = coupons.length;
  const bestCoupon = coupons.find((c) => c.is_best);
  const now = new Date();
  const monthNames = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
  ];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  function daysUntil(dateStr: string | null): number {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  return (
    <section className="relative bg-[#1a1a1a] overflow-hidden">
      {/* Red gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="text-white/50 text-[13px] mb-6">
          Accueil &rsaquo; Boutiques &rsaquo;{' '}
          <span className="text-white/80">{store.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Badge + Logo row */}
            <div className="flex items-center gap-4 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-[13px] font-medium px-3 py-1.5 rounded-full">
                🔥 Mis à jour aujourd&apos;hui
              </span>

              {/* Store logo */}
              <div className="relative">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white text-[32px] font-bold shadow-lg"
                  style={{ backgroundColor: store.logo_color || '#E87A2A' }}
                >
                  {store.logo_letter || store.name[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-white text-[32px] md:text-[40px] font-extrabold leading-tight mb-2">
              Code promo <span className="text-primary">{store.name}</span>
            </h1>
            <p className="text-white/60 text-[15px] mb-6">
              {totalCodes} réductions vérifiées · {currentMonth} {currentYear}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 md:gap-10">
              <div className="text-center">
                <div className="text-white text-[28px] font-extrabold">{totalCodes}</div>
                <div className="text-white/50 text-[12px] mt-0.5">Codes actifs</div>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div className="text-center">
                <div className="text-white text-[28px] font-extrabold">50k+</div>
                <div className="text-white/50 text-[12px] mt-0.5">Utilisateurs</div>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div className="text-center">
                <div className="text-white text-[28px] font-extrabold">98%</div>
                <div className="text-white/50 text-[12px] mt-0.5">Taux succès</div>
              </div>
            </div>
          </div>

          {/* Floating best offer card — desktop only */}
          {bestCoupon && (
            <div className="hidden lg:block w-[300px] shrink-0">
              <div className="bg-white rounded-xl shadow-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-primary mb-3">
                  <span>⭐</span> MEILLEURE OFFRE
                </div>
                <div className="text-primary text-[56px] font-extrabold leading-none mb-1">
                  {bestCoupon.discount_value || '30'}
                  <span className="text-[28px]">
                    {bestCoupon.discount_type === 'percent' ? '%' : '€'}
                  </span>
                </div>
                <p className="text-muted text-[14px] mb-5">
                  de réduction pour les<br />nouveaux clients
                </p>
                <button
                  onClick={onOpenBest}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3 rounded-lg transition-colors mb-3"
                >
                  Obtenir le code →
                </button>
                {bestCoupon.expiry_date && (
                  <p className="text-muted text-[12px]">
                    📅 Expire dans {daysUntil(bestCoupon.expiry_date)} jours
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
