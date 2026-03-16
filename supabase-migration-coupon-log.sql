-- ============================================================
-- LockCoupon: Auto-coupon updater — log table
-- Run this in Supabase SQL Editor before deploying
-- ============================================================

-- Tracks which stores were last updated by the cron job
-- so the round-robin picks the least-recently-updated ones
CREATE TABLE IF NOT EXISTS cron_coupon_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result JSONB,
  UNIQUE(store_id)
);

-- Index for fast ordering by updated_at
CREATE INDEX IF NOT EXISTS idx_cron_coupon_log_updated 
  ON cron_coupon_log(updated_at ASC);

-- Enable RLS (optional, the service role key bypasses it)
ALTER TABLE cron_coupon_log ENABLE ROW LEVEL SECURITY;

-- Allow the service role to do everything
CREATE POLICY "Service role full access" ON cron_coupon_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Optional: add a "source" column to coupons if you want to
-- track where each coupon came from
-- ============================================================
-- ALTER TABLE coupons ADD COLUMN IF NOT EXISTS source TEXT;
-- ALTER TABLE coupons ADD COLUMN IF NOT EXISTS auto_scraped BOOLEAN DEFAULT false;
