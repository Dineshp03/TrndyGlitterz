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

-- Enable Row Level Security (RLS) to secure the table
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Optional: Since all requests go through the Next.js API route using the service_role key, 
-- no policies are strictly necessary because service_role bypasses RLS. 
-- However, if you ever query this table directly from the client, you can enable read access:
-- CREATE POLICY "Allow public read access" ON public.product_reviews FOR SELECT USING (true);
