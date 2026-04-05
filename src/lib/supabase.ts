import { createBrowserClient } from '@supabase/ssr'

/**
 * Use this in Client Components ("use client")
 * and Zustand stores.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase keys are missing from environment variables.');
    }
  }

  return createBrowserClient(url, key);
}

// Singleton instance for use in Zustand stores
let _browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_browserClient) {
    _browserClient = createClient()
  }
  return _browserClient
}
