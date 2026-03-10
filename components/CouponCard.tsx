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
    return `Plus que ${days} jours`;
  }

  const discountDisplay = () => {
    if (coupon.discount_type === 'free') return { value: 'FREE', unit: '' };
    if (coupon.discount_type === 'percent') return { value: `${coupon.discount_value}%`, unit: 'DE RÉDUCTION' };
    if (coupon.discount_type === 'euro') return { value: `${coupon.discount_value}€`, unit: 'OFFERTS' };
    if (coupon.discount_type === 'cashback') return { value: `${coupon.discount_value}%`, unit: 'CASHBACK' };
    return { value: coupon.discount_value || '—', unit: '' };
  };

  const { value, unit } = discountDisplay();

  const typeLabel = () => {
    if (coupon.type === 'code') return 'CODE PROMO';
    if (coupon.type === 'cashback') return 'CASHBACK';
    return 'BON PLAN';
  };

  // Reveal partial code
  const partialCode = coupon.code
    ? coupon.code.slice(0, 2) + '...'
    : '';

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Left — Discount badge */}
        <div className="sm:w-[130px] shrink-0 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1 py-4 px-4 sm:px-0 sm:py-6 border-b sm:border-b-0 sm:border-r border-border bg-white">
          <span className="text-[16px] sm:text-[14px]">🔥</span>
          <span className="text-primary text-[28px] sm:text-[32px] font-extrabold leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
              {unit}
            </span>
          )}
        </div>

        {/* Middle — Info */}
        <div className="flex-1 min-w-0 px-4 py-4 sm:py-5">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-primary text-[11px] font-bold tracking-wider uppercase">
              {typeLabel()}
            </span>
            {coupon.is_best && (
              <span className="text-primary text-[11px] font-bold">
                ⭐ MEILLEURE OFFRE
              </span>
            )}
            {coupon.is_exclusive && (
              <span className="bg-accent text-text-main text-[10px] font-bold px-2 py-0.5 rounded">
                EXCLUSIF
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-text-main text-[15px] font-semibold leading-snug mb-2 line-clamp-2">
            {coupon.title}
          </h3>

          {/* Expiry + details toggle + verified */}
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted">
            {coupon.expiry_date && (
              <span className="flex items-center gap-1">
                ⏳ {daysUntil(coupon.expiry_date)}
              </span>
            )}
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="hover:text-text-main transition-colors"
            >
              Détails et commentaires ({coupon.usage_count || 0}) <span className="text-[10px]">{detailsOpen ? '▲' : '▼'}</span>
            </button>
            {coupon.is_verified && (
              <span className="flex items-center gap-1 text-success">
                <span className="w-2 h-2 bg-success rounded-full inline-block" />
                Vérifié
              </span>
            )}
          </div>

          {/* Details expand */}
          {detailsOpen && (
            <div className="mt-3 pt-3 border-t border-border text-[13px] text-muted">
              Ce code a été vérifié et fonctionne actuellement. Utilisé par {coupon.usage_count || 0} personnes.
            </div>
          )}
        </div>

        {/* Right — CTA */}
        <div className="sm:w-[160px] shrink-0 flex flex-row sm:flex-col items-center justify-center gap-2 p-4 border-t sm:border-t-0 sm:border-l border-border">
          <button
            onClick={() => onOpenPopup(coupon)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[13px] py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>Voir le code ›</span>
            {partialCode && (
              <span className="bg-primary-dark/40 px-2 py-0.5 rounded text-[12px] font-mono ml-1">
                {partialCode}
              </span>
            )}
          </button>
          <span className="text-muted text-[11px]">{coupon.usage_count || 0} utilisés</span>
        </div>
      </div>
    </div>
  );
}
