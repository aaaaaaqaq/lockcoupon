'use client';

import { useEffect, useCallback } from 'react';
import { Coupon, Store } from '@/lib/supabase';

interface CouponPopupProps {
  coupon: Coupon | null;
  store: Store;
  onClose: () => void;
  onCopy: () => void;
}

export default function CouponPopup({ coupon, store, onClose, onCopy }: CouponPopupProps) {
  const copyCode = useCallback(() => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code).then(() => {
        onCopy();
      });
    }
  }, [coupon, onCopy]);

  // Auto-copy on open
  useEffect(() => {
    if (coupon?.code) {
      const t = setTimeout(copyCode, 500);
      return () => clearTimeout(t);
    }
  }, [coupon, copyCode]);

  if (!coupon) return null;

  function daysUntil(dateStr: string | null): number {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden animate-scale-in">
        {/* Red header bar */}
        <div className="bg-primary px-6 py-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: store.logo_color || '#E87A2A' }}
          >
            {store.logo_letter || store.name[0]}
          </div>
          <div>
            <div className="text-white font-bold text-[16px]">{store.name}</div>
            {coupon.expiry_date && (
              <div className="text-white/70 text-[12px]">
                Expire dans {daysUntil(coupon.expiry_date)} jours
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/70 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="text-text-main text-[18px] font-bold mb-5 leading-snug">
            {coupon.title}
          </h3>

          {/* Code box */}
          {coupon.code ? (
            <div className="flex items-stretch rounded-lg border-2 border-dashed border-success overflow-hidden mb-5">
              <div className="flex-1 bg-green-50 px-4 py-3 text-center">
                <span className="text-text-main text-[20px] font-mono font-extrabold tracking-widest">
                  {coupon.code}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="bg-success hover:bg-green-700 text-white font-bold text-[14px] px-5 transition-colors shrink-0"
              >
                COPIER
              </button>
            </div>
          ) : (
            <div className="bg-bg rounded-lg px-4 py-3 text-center text-muted text-[14px] mb-5">
              Aucun code nécessaire — réduction appliquée automatiquement
            </div>
          )}

          {/* Go to site button */}
          <a
            href={coupon.affiliate_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-primary hover:bg-primary-dark text-white text-center font-bold text-[15px] py-3.5 rounded-lg transition-colors"
          >
            Accéder au site →
          </a>
        </div>
      </div>
    </div>
  );
}
