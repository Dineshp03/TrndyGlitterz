-- Run this in your LIVE Supabase project (zlouhiealaldfvqqjhop)
-- Go to: https://supabase.com/dashboard/project/zlouhiealaldfvqqjhop/sql/new

-- Step 1: Add the missing column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT FALSE;

-- Step 2: Force reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Step 3: Verify the column was added (you should see is_sold_out in the results)
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;
