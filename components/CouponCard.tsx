'use client';

import { useState } from 'react';
import { Coupon } from '@/lib/supabase';

interface CouponCardProps {
  coupon: Coupon;
  onOpenPopup: (coupon: Coupon) => void;
}

export default function CouponCard({ coupon, onOpenPopup }: CouponCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  function daysUntil(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diff / 86400000));
    return `${days}j restants`;
  }

  const discountDisplay = () => {
    if (coupon.discount_type === 'free') return { value: 'FREE', unit: '' };
    if (coupon.discount_type === 'percent') return { value: `${coupon.discount_value}%`, unit: '' };
    if (coupon.discount_type === 'euro') return { value: `${coupon.discount_value}€`, unit: '' };
    if (coupon.discount_type === 'cashback') return { value: `${coupon.discount_value}%`, unit: 'cashback' };
    return { value: coupon.discount_value || '—', unit: '' };
  };

  const { value, unit } = discountDisplay();

  const typeLabel = () => {
    if (coupon.type === 'code') return 'Code promo';
    if (coupon.type === 'cashback') return 'Cashback';
    return 'Bon plan';
  };

  const partialCode = coupon.code ? coupon.code.slice(-2).toUpperCase() : '';

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
      <div className="flex items-stretch">
        {/* Left — Discount */}
        <div className="w-[100px] sm:w-[120px] shrink-0 flex flex-col items-center justify-center border-r border-border bg-primary-light/50 py-4 px-2">
          <span className="text-primary text-[28px] sm:text-[34px] font-extrabold leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-primary/70 text-[10px] font-bold mt-1 uppercase">{unit}</span>
          )}
        </div>

        {/* Middle — Info */}
        <div className="flex-1 min-w-0 px-4 py-3 sm:py-4 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-primary text-[11px] font-bold uppercase tracking-wide">
              {typeLabel()}
            </span>
            {coupon.is_best && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                ⭐ Meilleure offre
              </span>
            )}
            {coupon.is_exclusive && (
              <span className="bg-accent/30 text-text-main text-[10px] font-bold px-2 py-0.5 rounded-full">
                Exclusif
              </span>
            )}
          </div>

          <h3 className="text-text-main text-[14px] sm:text-[15px] font-semibold leading-snug mb-2 line-clamp-2">
            {coupon.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-[12px] text-muted">
            {coupon.expiry_date && (
              <span>⏳ {daysUntil(coupon.expiry_date)}</span>
            )}
            {coupon.is_verified && (
              <span className="flex items-center gap-1 text-success">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Vérifié
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setDetailsOpen(!detailsOpen); }}
              className="hover:text-text-main transition-colors flex items-center gap-1"
            >
              Détails et commentaires ({coupon.usage_count || 0}) <span className="text-[10px]">{detailsOpen ? '▲' : '▼'}</span>
            </button>
          </div>

          {detailsOpen && (
            <div className="mt-3 pt-3 border-t border-border text-[13px] text-muted leading-relaxed">
              {coupon.description ? (
                <p>{coupon.description}</p>
              ) : (
                <p>Ce code a été vérifié et fonctionne actuellement. Utilisé par {coupon.usage_count || 0} personnes.</p>
              )}
            </div>
          )}
        </div>

        {/* Right — Button */}
        <div className="shrink-0 flex flex-col items-center justify-center p-3 sm:p-4">
          <button
            onClick={() => onOpenPopup(coupon)}
            className="h-[46px] rounded-lg flex items-stretch overflow-hidden transition-all hover:opacity-90 min-w-[160px] sm:min-w-[180px]"
          >
            <span className="flex-1 bg-primary flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] gap-1.5 px-4">
              Voir le code <span className="text-[18px]">›</span>
            </span>
            {partialCode && (
              <span className="w-[42px] bg-[#1a1a1a] flex items-center justify-center text-white text-[14px] font-mono font-bold">
                {partialCode}
              </span>
            )}
          </button>
          <span className="text-muted text-[10px] sm:text-[11px] mt-2">{coupon.usage_count || 0} utilisés</span>
        </div>
      </div>
    </div>
  );
}
