'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FilterTabs from '@/components/FilterTabs';
import CouponCard from '@/components/CouponCard';
import CouponPopup from '@/components/CouponPopup';
import Toast from '@/components/Toast';
import { Store, Coupon } from '@/lib/supabase';

interface StorePageClientProps {
  store: Store;
  coupons: Coupon[];
}

export default function StorePageClient({ store, coupons }: StorePageClientProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [popupCoupon, setPopupCoupon] = useState<Coupon | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const counts = {
    all: coupons.length,
    code: coupons.filter((c) => c.type === 'code').length,
    cashback: coupons.filter((c) => c.type === 'cashback').length,
    bon: coupons.filter((c) => c.type === 'bon').length,
  };

  const filtered =
    activeFilter === 'all'
      ? coupons
      : coupons.filter((c) => c.type === activeFilter);

  const openPopup = useCallback((coupon: Coupon) => {
    setPopupCoupon(coupon);
  }, []);

  const openBestOffer = useCallback(() => {
    const best = coupons.find((c) => c.is_best);
    if (best) setPopupCoupon(best);
  }, [coupons]);

  const handleCopy = useCallback(() => {
    setToastVisible(true);
  }, []);

  return (
    <>
      <Navbar />
      <HeroSection store={store} coupons={coupons} onOpenBest={openBestOffer} />
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

      {/* Coupon list */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} onOpenPopup={openPopup} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-[16px]">Aucun coupon trouvé dans cette catégorie.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-10">
        <div className="max-w-[1200px] mx-auto px-4 py-8 text-center text-muted text-[13px]">
          © {new Date().getFullYear()} LockCoupon.com — Tous droits réservés.
        </div>
      </footer>

      {/* Popup */}
      <CouponPopup
        coupon={popupCoupon}
        store={store}
        onClose={() => setPopupCoupon(null)}
        onCopy={handleCopy}
      />

      {/* Toast */}
      <Toast
        message="Code copié dans le presse-papiers !"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
