/**
 * AnswerBox — answer-first block for GEO/AI-search citability.
 *
 * LLM-powered search (ChatGPT, Copilot, Perplexity) lifts short, dated,
 * self-contained factual statements. This block renders exactly that above
 * the fold: "best code today (date): X% — N offers verified", plus a compact
 * table of the top offers. Pure component: safe in server AND client trees.
 */

import type { Store, Coupon } from '@/lib/supabase';
import { bestDiscountLabel } from '@/lib/discount';

function couponDiscountLabel(c: Coupon): string {
  const val = c.discount_value ? parseInt(c.discount_value) : 0;
  if (!val || val <= 0) return c.type === 'bon' ? 'Bon plan' : 'Offre';
  if (c.discount_type === 'euro' || val > 100) return `-${val}€`;
  if (c.discount_type === 'percent' || val <= 90) return `-${val}%`;
  return `-${val}€`;
}

interface AnswerBoxProps {
  store: Store;
  coupons: Coupon[];
  /** Optional intent qualifier, e.g. "première commande" */
  intentLabel?: string;
  /** Optional pre-built answer sentence (intent pages); default = generic */
  answer?: string;
}

export default function AnswerBox({ store, coupons, intentLabel, answer }: AnswerBoxProps) {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const best = bestDiscountLabel(coupons);
  const codeCount = coupons.filter((c) => c.type === 'code').length;
  const top = coupons.slice(0, 3);

  const defaultAnswer = coupons.length > 0
    ? `${best ? `jusqu'à ${best} de réduction` : `${coupons.length} offre${coupons.length > 1 ? 's' : ''} active${coupons.length > 1 ? 's' : ''}`} — ${coupons.length} offre${coupons.length > 1 ? 's' : ''} vérifiée${coupons.length > 1 ? 's' : ''}${codeCount > 0 ? `, dont ${codeCount} code${codeCount > 1 ? 's' : ''} à saisir au paiement` : ''}.`
    : `aucune offre active pour le moment — cette page est vérifiée plusieurs fois par jour.`;

  return (
    <section className="max-w-[1200px] mx-auto px-4 pt-5" aria-label="Réponse rapide">
      <div className="max-w-[800px] mx-auto bg-white border border-border border-l-4 border-l-primary rounded-xl p-5">
        <p className="text-text-main text-[14px] md:text-[15px] leading-relaxed">
          <span aria-hidden="true">💡 </span>
          <strong>
            Meilleur code promo {store.name}
            {intentLabel ? ` ${intentLabel.toLowerCase()}` : ''} aujourd&apos;hui ({today}) :
          </strong>{' '}
          {answer ?? defaultAnswer}
        </p>

        {top.length > 0 && (
          <table className="w-full mt-4 text-[13px] border-collapse">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th scope="col" className="py-2 pr-3 font-semibold">Offre</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Remise</th>
                <th scope="col" className="py-2 font-semibold">Vérifié le</th>
              </tr>
            </thead>
            <tbody>
              {top.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 text-text-main">{c.title}</td>
                  <td className="py-2 pr-3 font-bold text-primary whitespace-nowrap">{couponDiscountLabel(c)}</td>
                  <td className="py-2 text-muted whitespace-nowrap">{today}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
