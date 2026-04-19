// Quick check: does orders table have payment_method column?
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(`${url}/rest/v1/orders?select=payment_method&limit=1`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  }
});

if (res.status === 400) {
  const body = await res.json();
  console.log('❌ Column missing:', body.message);
  console.log('\n📋 Run this SQL in Supabase → SQL Editor:\n');
  console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;\n');
} else {
  console.log('✅ Column exists, status:', res.status);
}
