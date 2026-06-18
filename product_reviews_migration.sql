-- ============================================================
-- SQL Migration: Product Reviews Table
-- Run this in your Supabase Project SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  clerk_id    TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  user_email  TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookup performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_clerk_id ON public.product_reviews(clerk_id);

-- Disable Row Level Security as we use a server-side Next.js route with service role bypass
ALTER TABLE public.product_reviews DISABLE ROW LEVEL SECURITY;
