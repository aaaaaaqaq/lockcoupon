'use client';

import { useState } from 'react';
import { Coupon } from '@/lib/supabase';
import { IconStar } from '@/components/icons';

interface CouponCardProps {
  coupon: Coupon;
  onOpenPopup: (coupon: Coupon) => void;
}

/**
 * Single responsive offer card.
 *
 * One DOM tree for mobile AND desktop (CSS-only layout switch via Tailwind
 * `sm:` variants). The previous version rendered two complete layouts
 * (hidden sm:flex / sm:hidden), so every offer — and its <h3> — appeared
 * twice in the served HTML: duplicate headings for crawlers, double DOM
 * weight. Each offer now emits exactly one <h3>.
 */
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
    if (!coupon.discount_value) return { value: 'PROMO', unit: '' };
    if (coupon.discount_type === 'percent') return { value: `${coupon.discount_value}%`, unit: '' };
    if (coupon.discount_type === 'euro') return { value: `${coupon.discount_value}€`, unit: '' };
    if (coupon.discount_type === 'cashback') return { value: `${coupon.discount_value}%`, unit: 'cashback' };
    return { value: coupon.discount_value || '—', unit: '' };
  };

  const { value, unit } = discountDisplay();

  const typeLabel = () => {
    if (coupon.type === 'code') return 'CODE PROMO';
    if (coupon.type === 'cashback') return 'CASHBACK';
    return 'BON PLAN';
  };

  const partialCode = coupon.code ? coupon.code.slice(-2).toUpperCase() : '';

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* Discount — left column on desktop, inline block on mobile */}
        <div className="order-2 sm:order-none px-4 pt-1 pb-2 sm:w-[120px] sm:shrink-0 sm:flex sm:flex-col sm:items-center sm:justify-center sm:border-r sm:border-border sm:bg-primary-light/50 sm:py-4 sm:px-2 sm:pt-4 sm:pb-4">
          <span className="text-primary text-[42px] sm:text-[34px] font-extrabold leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-primary/70 text-[14px] sm:text-[10px] font-bold sm:mt-1 ml-1 sm:ml-0 uppercase">{unit}</span>
          )}
        </div>

        {/* Info */}
        <div className="order-1 sm:order-none flex-1 min-w-0 px-4 pt-4 pb-2 sm:py-4 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-primary text-[11px] font-bold uppercase tracking-wide">
              {typeLabel()}
            </span>
            {coupon.is_best && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                <IconStar size={10} /> Meilleure offre
              </span>
            )}
            {coupon.is_exclusive && (
              <span className="bg-accent/30 text-text-main text-[10px] font-bold px-2 py-0.5 rounded-full">
                Exclusif
              </span>
            )}
          </div>

          <h3 className="text-text-main text-[15px] font-semibold leading-snug mb-2 sm:line-clamp-2">
            {coupon.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted">
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

        {/* CTA — full width on mobile, right column on desktop */}
        <div className="order-3 sm:order-none shrink-0 flex flex-col items-center justify-center px-4 pb-4 sm:p-4">
          <button
            onClick={() => onOpenPopup(coupon)}
            className="w-full sm:w-auto h-[48px] sm:h-[46px] rounded-lg flex items-stretch overflow-hidden transition-all hover:opacity-90 active:scale-[0.98] sm:min-w-[180px]"
          >
            <span className="flex-1 bg-primary flex items-center justify-center text-white font-bold text-[15px] gap-1.5 px-4">
              Voir le code <span className="text-[18px]">›</span>
            </span>
            {partialCode && (
              <span className="w-[48px] sm:w-[42px] bg-[#1a1a1a] flex items-center justify-center text-white text-[15px] sm:text-[14px] font-mono font-bold">
                {partialCode}
              </span>
            )}
          </button>
          {(coupon.usage_count || 0) > 0 && (
            <span className="text-muted text-[11px] mt-2">{coupon.usage_count} utilisés</span>
          )}
        </div>
      </div>
    </div>
  );
}
