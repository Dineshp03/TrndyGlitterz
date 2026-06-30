-- ============================================================
-- TRENDY GLITTERZ — MASTER MIGRATION (Clerk + Razorpay)
-- Run this ONCE in new Supabase project → SQL Editor
-- Project: xbzdjhoglycxvnkjegxr (trendy_glitterz's Project)
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROFILES (Clerk-linked, no Supabase auth dependency)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  city          TEXT,
  state         TEXT,
  pincode       TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — these policies are just guards
DROP POLICY IF EXISTS "Service role manages profiles" ON public.profiles;
CREATE POLICY "Service role manages profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon/authenticated to read (needed for public product admin checks)
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);

-- ─────────────────────────────────────────────
-- 2. PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  old_price   NUMERIC(10,2),
  category    TEXT NOT NULL DEFAULT 'Uncategorized',
  image       TEXT DEFAULT '',
  images      TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  stock       INTEGER DEFAULT 0,
  featured    BOOLEAN DEFAULT FALSE,
  is_imported BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Service role manages products (admin API uses service role key)
DROP POLICY IF EXISTS "Service role manages products" ON public.products;
CREATE POLICY "Service role manages products"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 3. ORDERS (Clerk-linked via clerk_user_id)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id        TEXT NOT NULL,
  customer_name        TEXT NOT NULL,
  customer_email       TEXT NOT NULL,
  customer_phone       TEXT,
  address              TEXT NOT NULL,
  city                 TEXT,
  state                TEXT,
  pincode              TEXT,
  total                NUMERIC(10,2) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method       TEXT NOT NULL DEFAULT 'cod',
  razorpay_payment_id  TEXT,
  razorpay_order_id    TEXT,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Service role manages all orders (admin + checkout API)
DROP POLICY IF EXISTS "Service role manages orders" ON public.orders;
CREATE POLICY "Service role manages orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_id ON public.orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 4. ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  price         NUMERIC(10,2) NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Service role manages order items
DROP POLICY IF EXISTS "Service role manages order_items" ON public.order_items;
CREATE POLICY "Service role manages order_items"
  ON public.order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ─────────────────────────────────────────────
-- 5. CART ITEMS (Clerk-linked)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clerk_user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Service role manages cart
DROP POLICY IF EXISTS "Service role manages cart" ON public.cart_items;
CREATE POLICY "Service role manages cart"
  ON public.cart_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(clerk_user_id);

-- ─────────────────────────────────────────────
-- 6. WISHLIST (Clerk-linked)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clerk_user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Service role manages wishlist
DROP POLICY IF EXISTS "Service role manages wishlist" ON public.wishlist;
CREATE POLICY "Service role manages wishlist"
  ON public.wishlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(clerk_user_id);

-- ─────────────────────────────────────────────
-- 7. STORAGE BUCKET FOR PRODUCT IMAGES
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role manages product images" ON storage.objects;
CREATE POLICY "Service role manages product images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- ─────────────────────────────────────────────
-- 8. VERIFY
-- ─────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
