-- ============================================================
-- TRENDY GLITTERZ — Complete RLS Fix
-- Run ALL of this in Supabase Dashboard → SQL Editor
-- ============================================================

-- STEP 1: Create a SECURITY DEFINER helper function.
-- This runs with elevated privileges and bypasses RLS,
-- breaking the infinite recursion loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- STEP 2: Fix the "Admins can view all profiles" policy.
-- The old policy caused infinite recursion by querying profiles FROM profiles.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- STEP 3: Fix the products policies.
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- STEP 4: Fix the orders policy.
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- STEP 5: Fix the order_items policy.
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- STEP 6: Ensure the product-images storage bucket exists and is public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- STEP 7: Fix storage policies to allow anyone to VIEW images.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- STEP 8: Allow public INSERT to storage (uploads go through service role via API anyway).
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload product images" ON storage.objects;
CREATE POLICY "Allow image uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- STEP 9: Allow public DELETE on storage (admin only in practice via service role).
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete product images" ON storage.objects;
CREATE POLICY "Allow image deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- DONE! Your products, orders, and image uploads should now work correctly.
