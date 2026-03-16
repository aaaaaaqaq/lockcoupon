# Auto-Coupon Updater — Setup Guide

## What it does

The auto-coupon updater uses the Anthropic API with **web search** to find real coupon codes from French deal sites (Dealabs, Ma-Reduc, Savoo, PlanReduc, Radins.com) and saves them to your Supabase `coupons` table.

### How it works

1. **Round-robin store selection** — Each run picks the 3 least-recently-updated stores
2. **Claude + web search** — For each store, Claude searches the web for current coupon codes
3. **Deduplication** — Checks existing codes before inserting (by code or title match)
4. **Expired cleanup** — Automatically deletes coupons past their expiry date
5. **Logging** — Tracks every run in `cron_coupon_log` so you can monitor results

### Schedule (vercel.json)

| Cron | When | What |
|------|------|------|
| `0 6 * * 1` | Monday 6 AM UTC | Coupon updater (3 stores) |
| `0 6 * * 4` | Thursday 6 AM UTC | Coupon updater (3 stores) |

With ~60 stores and 3 per run, every store gets refreshed roughly every 10 runs (~5 weeks).

---

## Setup Steps

### 1. Run the SQL migration

Open your **Supabase SQL Editor** and run the contents of:

```
supabase-migration-coupon-log.sql
```

This creates the `cron_coupon_log` table for round-robin tracking.

### 2. Set environment variables in Vercel

You need these env vars (you likely already have most of them):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Already set |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (not anon) for write access |
| `ANTHROPIC_API_KEY` | Yes | Already set (used by blog cron too) |
| `CRON_SECRET` | Optional | Defaults to `lockcoupon-cron-2026` |

### 3. Deploy

Push to your repo. Vercel will pick up the new cron entries from `vercel.json`.

### 4. Test with dry run

Before the first cron fires, test for a single store:

```bash
curl -X POST https://your-site.vercel.app/api/cron/update-coupons/test \
  -H "Content-Type: application/json" \
  -d '{"secret": "lockcoupon-cron-2026", "store_slug": "nike"}'
```

This calls Claude with web search but does **not** save to the database. You'll see the raw coupons found.

### 5. Manual full run

To trigger a full run (3 stores, saves to DB):

```
https://your-site.vercel.app/api/cron/update-coupons?secret=lockcoupon-cron-2026
```

---

## Files added

```
app/api/cron/update-coupons/
├── route.ts          # Main cron handler (GET)
└── test/
    └── route.ts      # Dry-run tester (POST)

supabase-migration-coupon-log.sql   # DB migration
vercel.json                         # Updated with 2 new cron entries
```

---

## Tuning

| Setting | Location | Default |
|---------|----------|---------|
| Stores per run | `STORES_PER_RUN` in route.ts | 3 |
| Source sites | `COUPON_SOURCES` array | 5 French sites |
| Schedule | `vercel.json` | Mon + Thu at 6 AM |
| Max duration | `maxDuration` export | 300s (Vercel Pro) |

To add more coupon source sites, edit the `COUPON_SOURCES` array. The site names are passed to Claude's web search prompt so it knows where to look.

---

## Response format

A successful run returns:

```json
{
  "success": true,
  "timestamp": "2026-03-16T06:00:00.000Z",
  "summary": {
    "stores_processed": 3,
    "total_stores": 62,
    "coupons_found": 12,
    "coupons_inserted": 8,
    "coupons_skipped_duplicates": 4,
    "expired_cleaned": 2
  },
  "details": [
    { "store": "Nike", "slug": "nike", "found": 5, "inserted": 3, "skipped": 2, "errors": 0 },
    { "store": "Zara", "slug": "zara", "found": 4, "inserted": 3, "skipped": 1, "errors": 0 },
    { "store": "Fnac", "slug": "fnac", "found": 3, "inserted": 2, "skipped": 1, "errors": 0 }
  ]
}
```

## Notes

- Auto-scraped coupons are inserted with `is_verified: false` so you can distinguish them from manually added ones in the admin panel
- The `is_best` and `is_exclusive` flags stay `false` — set these manually in admin for promoted codes
- If the log table doesn't exist yet, the system falls back to random store selection (no crash)
