'use client';

import { useState, useEffect } from 'react';
import { Coupon } from '@/lib/supabase';
import { SUPABASE_URL } from '@/lib/supabase';

interface CouponPopupProps {
  coupon: Coupon | null;
  store: { name: string; logo_url: string | null; slug: string } | null;
  onClose: () => void;
  onCopy: () => void;
}

export default function CouponPopup({ coupon, store, onClose, onCopy }: CouponPopupProps) {
  const [copied, setCopied] = useState(false);

  // Reset copied state when coupon changes
  useEffect(() => {
    setCopied(false);
  }, [coupon]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ✅ NO auto-redirect useEffect — user clicks manually

  if (!coupon) return null;

  function daysUntil(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diff / 86400000));
    return `${days}j restants`;
  }

  const handleCopy = async () => {
    if (!coupon.code) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = coupon.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGoToStore = () => {
    if (coupon.affiliate_url) {
      window.open(coupon.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with store info */}
        <div className="relative bg-primary-light/40 px-6 py-5 text-center border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-text-main hover:bg-black/5 transition-colors text-[18px]"
            aria-label="Fermer"
          >
            ✕
          </button>

          {/* Store logo + name */}
          <div className="flex items-center justify-center gap-3 mb-3">
            {store?.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-10 h-10 rounded-lg object-contain bg-white"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: store?.name?.length ? '#6366f1' : '#94a3b8' }}
              >
                {store?.name?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-text-main text-[16px] font-bold">
              {store?.name}
            </span>
          </div>

          {/* Discount */}
          <div className="text-primary text-[32px] font-extrabold leading-none">
            {coupon.discount_type === 'free' && 'GRATUIT'}
            {coupon.discount_type === 'percent' && `${coupon.discount_value}%`}
            {coupon.discount_type === 'euro' && `${coupon.discount_value}€`}
            {coupon.discount_type === 'cashback' && `${coupon.discount_value}% cashback`}
          </div>

          <h3 className="text-text-main text-[14px] font-semibold leading-snug mt-2 px-2">
            {coupon.title}
          </h3>

          {coupon.is_verified && (
            <span className="inline-flex items-center gap-1 text-success text-[12px] mt-2">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              Code vérifié
            </span>
          )}

          {coupon.expiry_date && (
            <div className="text-muted text-[11px] mt-1">
              ⏳ Expire dans {daysUntil(coupon.expiry_date)}
            </div>
          )}
        </div>

        {/* Code section */}
        <div className="px-6 py-6">
          {coupon.code ? (
            <>
              <p className="text-muted text-[13px] text-center mb-3">
                Copiez le code ci-dessous puis cliquez sur « Aller sur la boutique »
              </p>

              {/* Code display + copy */}
              <div
                onClick={handleCopy}
                className="relative flex items-center justify-between border-2 border-dashed border-primary/40 rounded-xl px-5 py-4 cursor-pointer hover:border-primary transition-colors group bg-primary-light/20"
              >
                <span className="text-text-main text-[22px] font-mono font-bold tracking-wider select-all">
                  {coupon.code}
                </span>

                <span
                  className={`shrink-0 ml-3 text-[13px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                    copied
                      ? 'bg-success/10 text-success'
                      : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                  }`}
                >
                  {copied ? '✓ Copié !' : 'Copier'}
                </span>
              </div>
            </>
          ) : (
            <p className="text-muted text-[14px] text-center">
              Aucun code nécessaire — la réduction s&apos;applique automatiquement.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* Go to store — manual click only, NO auto-redirect */}
          <button
            onClick={handleGoToStore}
            className="w-full h-[48px] bg-primary text-white font-bold text-[15px] rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Aller sur la boutique
            <span className="text-[18px]">↗</span>
          </button>

          <button
            onClick={onClose}
            className="w-full h-[40px] text-muted text-[13px] hover:text-text-main transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
