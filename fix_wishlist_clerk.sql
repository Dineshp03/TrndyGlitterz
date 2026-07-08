-- Update wishlist table to support Clerk user IDs
ALTER TABLE public.wishlist 
  ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- Update column to not be null if we want to migrate
ALTER TABLE public.wishlist
  ALTER COLUMN user_id DROP NOT NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_clerk_id ON public.wishlist(clerk_id);

-- Simple RLS for client-side SELECT (if we want to keep it simple, but API is better)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
-- For now, enabling RLS on wishlist to secure the database.
-- In a production environment, we use a service-role API route which bypasses RLS.
