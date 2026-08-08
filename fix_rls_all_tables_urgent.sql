-- ============================================================
-- TRENDY GLITTERZ — URGENT SECURITY FIX
-- Row-Level Security (RLS) for ALL tables
-- ============================================================
-- 🚨 WHY THIS MATTERS:
--    The Supabase email warning means one of your projects has
--    tables accessible to the public internet WITHOUT any auth.
--    Anyone with your project URL can read, edit, delete data.
--
-- ✅ HOW TO USE:
--    1. Open Supabase Dashboard (supabase.com/dashboard)
--    2. Select the PROJECT that was flagged in the email
--       (Project ID: zlouhiealaldfvqqjhop)
--    3. Go to SQL Editor → New Query
--    4. Paste this ENTIRE file and click RUN
--    5. You should see "Success. No rows returned" for each block
--
-- ✅ ALSO RUN ON your active project if unsure:
--    (Project ID: xbzdjhoglycxvnkjegxr)
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- STEP 0: Verify what tables exist (run this to check first)
-- ─────────────────────────────────────────────────────────────
-- SELECT table_name, row_security FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;


-- ─────────────────────────────────────────────────────────────
-- STEP 1: PROFILES TABLE
-- ─────────────────────────────────────────────────────────────

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to start fresh
DROP POLICY IF EXISTS "Service role manages profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles"       ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Public read profiles"           ON public.profiles;

-- Service role (used by Next.js API) can do everything
CREATE POLICY "Service role manages profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read all profiles (needed for admin checks in app code)
-- This is safe because service_role key is never exposed to the browser
CREATE POLICY "Authenticated can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users cannot read anything (block the public access)
-- No anon read policy = anon gets blocked by default when RLS is on


-- ─────────────────────────────────────────────────────────────
-- STEP 2: PRODUCTS TABLE
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products"      ON public.products;
DROP POLICY IF EXISTS "Admins can manage products"    ON public.products;
DROP POLICY IF EXISTS "Public read products"          ON public.products;

-- Service role can do everything (admin CRUD via API)
CREATE POLICY "Service role manages products"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone (including anonymous visitors) can READ products — this is intentional
-- for your shop to work without login
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Block anon/authenticated from writing products (only service_role can)
-- No INSERT/UPDATE/DELETE policy for anon or authenticated = blocked


-- ─────────────────────────────────────────────────────────────
-- STEP 3: ORDERS TABLE
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages orders"     ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders"       ON public.orders;
DROP POLICY IF EXISTS "Users can place orders"          ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders"    ON public.orders;

-- Only service_role can access orders (checkout + admin APIs use service_role key)
CREATE POLICY "Service role manages orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Block ALL other roles from reading orders
-- (Your app uses server-side API routes with service_role, not client-side queries)


-- ─────────────────────────────────────────────────────────────
-- STEP 4: ORDER ITEMS TABLE
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages order_items"        ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items"          ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items"        ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items"       ON public.order_items;

CREATE POLICY "Service role manages order_items"
  ON public.order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- STEP 5: CART ITEMS TABLE
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages cart"       ON public.cart_items;
DROP POLICY IF EXISTS "Public manages cart"             ON public.cart_items;
DROP POLICY IF EXISTS "Anon manages cart"               ON public.cart_items;

CREATE POLICY "Service role manages cart"
  ON public.cart_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- STEP 6: WISHLIST TABLE
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages wishlist"   ON public.wishlist;
DROP POLICY IF EXISTS "Users can manage their wishlist" ON public.wishlist;

CREATE POLICY "Service role manages wishlist"
  ON public.wishlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- STEP 7: PRODUCT REVIEWS TABLE (if it exists)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages reviews"    ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public read access"        ON public.product_reviews;
DROP POLICY IF EXISTS "Anon read reviews"               ON public.product_reviews;

-- Service role manages all reviews (API routes)
CREATE POLICY "Service role manages reviews"
  ON public.product_reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can READ reviews (for the product page)
CREATE POLICY "Anyone can read reviews"
  ON public.product_reviews FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- STEP 8: STORAGE OBJECTS (Product Images)
-- ─────────────────────────────────────────────────────────────

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old storage policies
DROP POLICY IF EXISTS "Anyone can view product images"       ON storage.objects;
DROP POLICY IF EXISTS "Service role manages product images"  ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images"     ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images"     ON storage.objects;
DROP POLICY IF EXISTS "Allow image uploads"                  ON storage.objects;
DROP POLICY IF EXISTS "Allow image deletes"                  ON storage.objects;
DROP POLICY IF EXISTS "Public upload product images"         ON storage.objects;
DROP POLICY IF EXISTS "Public delete product images"         ON storage.objects;

-- Anyone can VIEW images (public shop)
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only service_role can upload/delete images (admin API uses service_role key)
CREATE POLICY "Service role manages product images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');


-- ─────────────────────────────────────────────────────────────
-- STEP 9: VERIFY — Run this after the above to confirm
-- ─────────────────────────────────────────────────────────────
SELECT
  t.table_name,
  t.row_security AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name, t.row_security
ORDER BY t.table_name;

-- ✅ Expected result: ALL tables should show rls_enabled = YES
-- and each should have at least 1 policy
-- ============================================================
-- END OF SECURITY FIX
-- ============================================================
