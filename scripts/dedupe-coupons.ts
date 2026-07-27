/**
 * scripts/dedupe-coupons.ts — one-shot offers-table dedupe.
 *
 * Duplicate rule (shared with the cron insert guard in lib/couponSimilarity):
 *   same store + same discount (type+value) + title similarity ≥ 0.85
 *   — OR — same store + identical non-null code.
 * Winner per duplicate cluster: highest usage_count, then is_best, then
 * oldest created_at. Everything else is deleted.
 *
 * Usage:
 *   node scripts/dedupe-coupons.ts          # dry run (prints what would go)
 *   node scripts/dedupe-coupons.ts --apply  # actually delete
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (read from
 * .env.local automatically when not in the environment).
 */

import { readFileSync } from 'node:fs';
// @ts-expect-error — node's native type-stripping requires the explicit .ts
// extension; Next's tsc pass (no allowImportingTsExtensions) would reject it.
import { isDuplicateOffer } from '../lib/couponSimilarity.ts';

// ── env ──────────────────────────────────────────────────────────
function loadEnv(): void {
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  } catch { /* rely on the environment */ }
}
loadEnv();

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

interface CouponRow {
  id: string;
  store_id: string;
  title: string;
  code: string | null;
  discount_value: string | null;
  discount_type: string | null;
  usage_count: number;
  is_best: boolean;
  created_at: string;
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { ...init, headers: { ...HEADERS, ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

const APPLY = process.argv.includes('--apply');

async function main(): Promise<void> {
  const stores = await rest<{ id: string; slug: string; name: string }[]>('stores?select=id,slug,name');
  const storeSlug = new Map(stores.map((s) => [s.id, s.slug]));
  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const coupons = await rest<CouponRow[]>(
    'coupons?select=id,store_id,title,code,discount_value,discount_type,usage_count,is_best,created_at&order=created_at.asc&limit=10000'
  );
  console.log(`${coupons.length} coupons across ${stores.length} stores — ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

  const byStore = new Map<string, CouponRow[]>();
  for (const c of coupons) {
    const list = byStore.get(c.store_id) || [];
    list.push(c);
    byStore.set(c.store_id, list);
  }

  const toDelete: CouponRow[] = [];
  let clusters = 0;

  byStore.forEach((list, storeId) => {
    // Union-find style clustering over the pairwise duplicate relation.
    const clusterOf = new Map<string, number>();
    const clusterMembers: CouponRow[][] = [];
    for (const c of list) {
      let assigned = -1;
      for (let k = 0; k < clusterMembers.length; k++) {
        if (clusterMembers[k].some((m) => isDuplicateOffer(c, m, storeName.get(storeId)))) { assigned = k; break; }
      }
      if (assigned === -1) { assigned = clusterMembers.length; clusterMembers.push([]); }
      clusterMembers[assigned].push(c);
      clusterOf.set(c.id, assigned);
    }

    for (const members of clusterMembers) {
      if (members.length < 2) continue;
      clusters++;
      // keep: most used → is_best → oldest
      const sorted = [...members].sort((a, b) =>
        (b.usage_count || 0) - (a.usage_count || 0) ||
        Number(b.is_best) - Number(a.is_best) ||
        a.created_at.localeCompare(b.created_at)
      );
      const keep = sorted[0];
      const losers = sorted.slice(1);
      console.log(`[${storeSlug.get(storeId) || storeId}] cluster of ${members.length}:`);
      console.log(`  KEEP   ${keep.id.slice(0, 8)} u=${keep.usage_count} "${keep.title}" code=${keep.code ?? '—'} ${keep.discount_value ?? ''}${keep.discount_type ?? ''}`);
      for (const l of losers) {
        console.log(`  DELETE ${l.id.slice(0, 8)} u=${l.usage_count} "${l.title}" code=${l.code ?? '—'} ${l.discount_value ?? ''}${l.discount_type ?? ''}`);
        toDelete.push(l);
      }
    }
  });

  console.log(`\n${clusters} duplicate clusters, ${toDelete.length} coupons to delete.`);

  if (!APPLY || toDelete.length === 0) {
    if (!APPLY) console.log('Dry run — re-run with --apply to delete.');
    return;
  }

  // Delete in chunks of 50 ids
  for (let i = 0; i < toDelete.length; i += 50) {
    const ids = toDelete.slice(i, i + 50).map((c) => c.id);
    await rest(`coupons?id=in.(${ids.join(',')})`, { method: 'DELETE' });
  }
  console.log(`Deleted ${toDelete.length} duplicate coupons.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
