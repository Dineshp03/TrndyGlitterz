import { createBrowserClient } from '@supabase/ssr'

/**
 * Use this in Client Components ("use client")
 * and Zustand stores.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for use in Zustand stores
let _browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_browserClient) {
    _browserClient = createClient()
  }
  return _browserClient
}
