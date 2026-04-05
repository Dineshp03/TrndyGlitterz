-- ============================================================
-- Migration: Add clerk_user_id support to existing tables
-- Run this in Supabase → SQL Editor AFTER the main schema.sql
-- ============================================================

-- 1. Add clerk_user_id column to profiles table
--    This links Clerk identities to Supabase profile rows.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id
  ON public.profiles(clerk_user_id);

-- 2. Add clerk_user_id column to orders table
--    Allows linking orders to Clerk users without Supabase Auth.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_id
  ON public.orders(clerk_user_id);

-- 3. cart_items table (run cart_migration.sql first if not done)
-- Already handles clerk_user_id natively.

-- ── RLS policy updates for profiles ───────────────────────────────────────
-- Since our API uses service-role key, RLS is bypassed.
-- These are just safety policies for direct client access.

-- Allow service role to manage all profiles (already bypassed but explicit)
DROP POLICY IF EXISTS "Service role manages profiles" ON public.profiles;
CREATE POLICY "Service role manages profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Verification ───────────────────────────────────────────────────────────
-- Run this to verify columns were added:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'orders')
  AND column_name = 'clerk_user_id';
