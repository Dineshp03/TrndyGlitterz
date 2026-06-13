/**
 * One-time migration script: adds payment_method column to orders table
 * Run: node scripts/migrate-payment-method.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

// Parse .env.local manually
const envContent = readFileSync(envPath, 'utf8');
const processEnv = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    processEnv[key] = val;
  }
});

const supabase = createClient(
  processEnv.NEXT_PUBLIC_SUPABASE_URL,
  processEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);


async function migrate() {
  console.log('Running migration: add payment_method column to orders...');
  
  // Try adding the column via RPC or direct SQL
  const { error } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;`
  });

  if (error) {
    console.log('RPC not available, trying pg_catalog approach...');
    // Fallback: use the REST API to check if column exists, then describe next steps
    const { data, error: checkErr } = await supabase
      .from('orders')
      .select('payment_method')
      .limit(1);
    
    if (checkErr && checkErr.message?.includes('column')) {
      console.error('\n⚠️  The payment_method column does NOT exist yet.');
      console.error('\nPlease run this SQL in your Supabase Dashboard → SQL Editor:\n');
      console.error('  ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;\n');
    } else {
      console.log('✅ payment_method column already exists!');
    }
    return;
  }
  
  console.log('✅ Migration complete: payment_method column added to orders table.');
}

migrate().catch(console.error);
