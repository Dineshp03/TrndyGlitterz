-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the storage bucket (safe to run even if it exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow anyone to VIEW product images
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 3. Allow anyone to UPLOAD images (no auth check - for admin use)
DROP POLICY IF EXISTS "Public upload product images" ON storage.objects;
CREATE POLICY "Public upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- 4. Allow anyone to DELETE product images
DROP POLICY IF EXISTS "Public delete product images" ON storage.objects;
CREATE POLICY "Public delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- 5. Allow updating product images
DROP POLICY IF EXISTS "Public update product images" ON storage.objects;
CREATE POLICY "Public update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

-- 6. Make sure products table allows all operations (for adding products)
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Anyone can manage products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);
