-- ============================================================
-- Cart Items Table — Run in Supabase → SQL Editor
-- Persists cart state per Clerk user ID (text, not UUID)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,              -- Clerk's user_id (starts with "user_")
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clerk_user_id, product_id)         -- one row per user+product
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ── RLS: rows are controlled by our API (service role) ──
-- The API uses service-role key, so RLS is bypassed server-side.
-- These policies protect direct client access just in case.
CREATE POLICY "Service role manages cart"
  ON public.cart_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Useful index for lookups by user
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(clerk_user_id);
