-- Update wishlist table to support Clerk user IDs
ALTER TABLE public.wishlist 
  ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- Update column to not be null if we want to migrate
ALTER TABLE public.wishlist
  ALTER COLUMN user_id DROP NOT NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_clerk_id ON public.wishlist(clerk_id);

-- Simple RLS for client-side SELECT (if we want to keep it simple, but API is better)
ALTER TABLE public.wishlist DISABLE ROW LEVEL SECURITY;
-- For now, disabling RLS on wishlist to allow the app to function while we transition to API-only.
-- In a production environment, we would use a service-role API route.
