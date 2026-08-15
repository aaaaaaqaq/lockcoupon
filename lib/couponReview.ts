import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Coupon review gate (Aug 2026).
 *
 * Problem: the search crons published every code Claude returned straight to
 * the live pages — the only "verification" was a prompt instruction. A single
 * hallucinated code on a money page destroys user trust and invites a Google
 * penalty on coupon sites.
 *
 * Rule: a scraped CODE goes live ONLY when it comes with a source_url on a
 * known French coupon aggregator (the exact sites the prompt told Claude to
 * search). Everything else lands in `coupon_review_queue` (RLS: no anon
 * access) and waits for a human decision via /api/admin
 * (action approve_review / reject_review).
 *
 * Code-less offers ("bon"/"cashback") are NOT gated: with no code string to
 * fabricate, the risk profile is entirely different, and gating them would
 * starve the long-tail store pages.
 */

export const TRUSTED_COUPON_DOMAINS = [
  'dealabs.com',
  'ma-reduc.com',
  'savoo.fr',
  'planreduc.com',
  'radins.com',
  'igraal.com',
  'poulpeo.com',
  'ebuyclub.com',
  'retailmenot.fr',
  'groupon.fr',
];

export interface CodeEvidence {
  code: string | null;
  source?: string | null;
  source_url?: string | null;
}

export interface ReviewVerdict {
  live: boolean;
  reason: string | null;
}

/** Decide whether a scraped offer may be published directly. */
export function reviewOffer(e: CodeEvidence): ReviewVerdict {
  // No code to fabricate → not gated.
  if (!e.code) return { live: true, reason: null };

  if (!e.source_url) {
    return { live: false, reason: 'code sans URL source vérifiable' };
  }
  let host: string;
  try {
    const url = new URL(e.source_url);
    if (!/^https?:$/.test(url.protocol)) throw new Error('bad protocol');
    host = url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return { live: false, reason: `URL source invalide : ${String(e.source_url).slice(0, 120)}` };
  }
  const trusted = TRUSTED_COUPON_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  if (!trusted) {
    return { live: false, reason: `source hors liste de confiance : ${host}` };
  }
  return { live: true, reason: null };
}

export interface QueueRow {
  store_id: string;
  store_slug: string;
  title: string;
  description: string | null;
  code: string | null;
  discount_value: string | null;
  discount_type: string | null;
  type: string | null;
  expiry_date: string | null;
  affiliate_url: string | null;
  source: string | null;
  source_url: string | null;
  reason: string;
  cron: string;
}

/**
 * Insert a quarantined offer into the review queue.
 * Dedup: skips when a pending row with the same store + code already exists
 * (the daily crons would otherwise re-queue the same candidate every run).
 */
export async function queueForReview(supabase: SupabaseClient, row: QueueRow): Promise<'queued' | 'duplicate' | 'error'> {
  try {
    if (row.code) {
      const { data: existing } = await supabase
        .from('coupon_review_queue')
        .select('id')
        .eq('store_id', row.store_id)
        .eq('code', row.code)
        .eq('status', 'pending')
        .limit(1);
      if (existing && existing.length > 0) return 'duplicate';
    }
    const { error } = await supabase.from('coupon_review_queue').insert(row);
    return error ? 'error' : 'queued';
  } catch {
    return 'error';
  }
}
