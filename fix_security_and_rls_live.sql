-- ==============================================================================
-- LIVE FIX: Resolve Supabase Security Warnings
-- 1. Fix "RLS Disabled in Public" for public.product_reviews
-- 2. Fix "Security Definer View" for public.orders_summary
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURE product_reviews TABLE
-- ------------------------------------------------------------------------------
-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting old policies
DROP POLICY IF EXISTS "Anyone can read reviews"         ON public.product_reviews;
DROP POLICY IF EXISTS "Service role manages reviews"    ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public read access"        ON public.product_reviews;
DROP POLICY IF EXISTS "Anon read reviews"               ON public.product_reviews;

-- Allow anyone (public/anon & authenticated) to read product reviews on storefront
CREATE POLICY "Anyone can read reviews"
  ON public.product_reviews
  FOR SELECT
  USING (true);

-- Allow full access to backend service_role
CREATE POLICY "Service role manages reviews"
  ON public.product_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 2. SECURE orders_summary VIEW
-- ------------------------------------------------------------------------------
-- Recreate the view with security_invoker = on so it respects RLS of querying user
CREATE OR REPLACE VIEW public.orders_summary
WITH (security_invoker = on) AS
  SELECT
    o.*,
    COUNT(oi.id) AS item_count
  FROM public.orders o
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  GROUP BY o.id;

-- Ensure view permissions are properly enforced
ALTER VIEW public.orders_summary SET (security_invoker = on);
