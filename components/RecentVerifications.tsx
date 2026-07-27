import { Coupon, Store } from '@/lib/supabase';
import { storeStats } from '@/lib/storeContent';
import { IconCheckCircle } from '@/components/icons';

interface Props {
  store: Store;
  coupons: Coupon[];
}

/**
 * "Dernières vérifications" — genuine freshness signal.
 *
 * Renders a dated verification changelog derived from real coupon data
 * (created_at = when the code was added/re-tested by our update crons).
 * This is the kind of unique, dated, factual content Google rewards on
 * coupon pages (Dealabs-style) — NOT cosmetic churn.
 *
 * Server component; no client JS.
 */
export default function RecentVerifications({ store, coupons }: Props) {
  if (!coupons || coupons.length === 0) return null;

  // Group coupons by verification day (created_at), newest first
  const byDay = new Map<string, Coupon[]>();
  for (const c of coupons) {
    if (!c.created_at) continue;
    const day = c.created_at.split('T')[0];
    const list = byDay.get(day) || [];
    list.push(c);
    byDay.set(day, list);
  }

  const days = Array.from(byDay.keys()).sort().reverse().slice(0, 5);
  if (days.length === 0) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  // Same single source of truth as title/H1/meta (count-consistency fix).
  const verifiedCount = storeStats(coupons).verifiedCount;

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-text-main text-[20px] md:text-[24px] font-extrabold mb-2">
          Dernières vérifications {store.name}
        </h2>
        <p className="text-muted text-[14px] mb-6">
          Notre équipe teste les codes {store.name} à chaque mise à jour.{' '}
          {verifiedCount > 0 && `${verifiedCount} offre${verifiedCount > 1 ? 's' : ''} actuellement marquée${verifiedCount > 1 ? 's' : ''} comme vérifiée${verifiedCount > 1 ? 's' : ''}.`}
        </p>

        <ol className="space-y-3">
          {days.map((day) => {
            const dayCoupons = byDay.get(day) || [];
            const codes = dayCoupons.filter((c) => c.type === 'code' && c.code);
            const sample = codes.slice(0, 3);
            const isToday = day === todayStr;

            return (
              <li
                key={day}
                className="bg-white rounded-xl border border-border px-5 py-4"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-text-main text-[15px] font-semibold">
                    {fmt(day)}
                    {isToday && (
                      <span className="ml-2 text-[12px] font-bold text-green-600 uppercase">
                        aujourd&apos;hui
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted text-[13px]">
                    <IconCheckCircle size={13} className="text-green-600" /> {dayCoupons.length} offre{dayCoupons.length > 1 ? 's' : ''} testée{dayCoupons.length > 1 ? 's' : ''} et ajoutée{dayCoupons.length > 1 ? 's' : ''}
                  </span>
                </div>
                {sample.length > 0 && (
                  <p className="text-muted text-[13px] mt-2 leading-relaxed">
                    Codes vérifiés :{' '}
                    {sample.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ', '}
                        <code className="bg-bg px-1.5 py-0.5 rounded text-[12px] font-mono uppercase">
                          {c.code}
                        </code>
                      </span>
                    ))}
                    {codes.length > sample.length && ` et ${codes.length - sample.length} autre${codes.length - sample.length > 1 ? 's' : ''}`}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
