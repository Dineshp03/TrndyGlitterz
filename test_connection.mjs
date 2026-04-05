import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zlouhiealaldfvqqjhop.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsb3VoaWVhbGFsZGZ2cXFqaG9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1NjgwMiwiZXhwIjoyMDkwNTMyODAyfQ.gpCmr16FrTz05Xy3rwr2Rf3Djgj9s0uE1poVzR5-f8A'

async function testConnection() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase.from('products').select('*').limit(1)

  if (error) {
    console.error('Connection failed:', error.message)
    process.exit(1)
  }

  console.log('Successfully connected to Supabase!')
  console.log('Sample product:', data?.[0]?.name || 'No products found')
  process.exit(0)
}

testConnection()
