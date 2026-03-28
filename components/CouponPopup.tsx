'use client';

import { useState, useRef, useEffect } from 'react';
import { Coupon } from '@/lib/supabase';

interface CouponPopupProps {
  coupon: Coupon | null;
  onClose: () => void;
}

export default function CouponPopup({ coupon, onClose }: CouponPopupProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLSpanElement>(null);

  // Reset copied state when coupon changes
  useEffect(() => {
    setCopied(false);
  }, [coupon]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!coupon) return null;

  const handleCopy = async () => {
    if (!coupon.code) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
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
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGoToStore = () => {
    if (coupon.url) {
      window.open(coupon.url, '_blank', 'noopener,noreferrer');
    }
  };

  const discountDisplay = () => {
    if (coupon.discount_type === 'free') return 'GRATUIT';
    if (coupon.discount_type === 'percent') return `${coupon.discount_value}%`;
    if (coupon.discount_type === 'euro') return `${coupon.discount_value}€`;
    if (coupon.discount_type === 'cashback') return `${coupon.discount_value}% cashback`;
    return coupon.discount_value || '—';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Popup */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-primary-light/50 px-6 py-5 text-center border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-text-main hover:bg-black/5 transition-colors text-[18px]"
            aria-label="Fermer"
          >
            ✕
          </button>

          <span className="text-primary text-[36px] font-extrabold leading-none">
            {discountDisplay()}
          </span>

          <h3 className="text-text-main text-[15px] font-semibold leading-snug mt-2 px-4">
            {coupon.title}
          </h3>

          {coupon.is_verified && (
            <span className="inline-flex items-center gap-1 text-success text-[12px] mt-2">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              Code vérifié
            </span>
          )}
        </div>

        {/* Code Section */}
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
                <span
                  ref={codeRef}
                  className="text-text-main text-[22px] font-mono font-bold tracking-wider select-all"
                >
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
              Aucun code nécessaire — la réduction s'applique automatiquement.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* Primary: Go to store — user clicks manually, no auto-redirect */}
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

        {/* Footer info */}
        {coupon.expiry_date && (
          <div className="px-6 pb-4 text-center">
            <span className="text-muted text-[11px]">
              ⏳ Expire le {new Date(coupon.expiry_date).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
