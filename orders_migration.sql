-- migration to support Clerk users in Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

-- Also update order_items just in case? No, they are linked by order_id.

-- Allow anyone to insert orders (for checkout)
-- We use API routes so we can also just disable RLS on orders or use Service Role.
-- But for safety, we'll keep RLS and use Service Role in API.
