-- ============================================================
-- LockCoupon: Drag & drop order + Temu cron pause flag
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add sort_order to coupons (lower = higher on page)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 9999;

-- Index for fast ordering
CREATE INDEX IF NOT EXISTS idx_coupons_sort_order ON coupons(sort_order ASC);

-- 2. Settings table for feature flags
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default: Temu cron not paused
INSERT INTO settings (key, value) VALUES ('temu_cron_paused', 'false')
ON CONFLICT (key) DO NOTHING;

-- Allow service role full access
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON settings FOR ALL USING (true) WITH CHECK (true);
