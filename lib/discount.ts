// Best-discount label helper — respects discount_type, avoids absurd claims.

interface DiscountLike {
  discount_value: string | null;
  discount_type: 'percent' | 'euro' | 'free' | 'cashback' | null;
}

/** Best discount as a human label ("70%" or "200€"), respecting discount_type.
 *  Percent values are capped at 90; values > 100 without an explicit type are
 *  treated as euro amounts (e.g. Temu 200€ coupon packs). */
export function bestDiscountLabel(coupons: DiscountLike[]): string | null {
  let bestPct = 0;
  let bestEur = 0;
  for (const c of coupons) {
    const val = c.discount_value ? parseInt(c.discount_value) : 0;
    if (!val || val <= 0) continue;
    if (c.discount_type === 'euro') {
      if (val > bestEur) bestEur = val;
    } else if (c.discount_type === 'percent') {
      if (val <= 90 && val > bestPct) bestPct = val;
      else if (val > 90 && val <= 100 && bestPct < 90) bestPct = 90;
      else if (val > 100 && val > bestEur) bestEur = val; // mistyped euro amount
    } else {
      if (val > 100) { if (val > bestEur) bestEur = val; }
      else if (val <= 90 && val > bestPct) bestPct = val;
    }
  }
  if (bestEur > 0 && bestEur >= bestPct) return `${bestEur}€`;
  if (bestPct > 0) return `${bestPct}%`;
  return null;
}
