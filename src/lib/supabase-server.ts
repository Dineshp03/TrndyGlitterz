import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Use this in Server Components, Server Actions, and Route Handlers.
 * Reads the user's session from cookies (Supabase Auth).
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'https://placeholder.supabase.co').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Silently ignore — called from a Server Component.
            // Session refresh will happen via middleware instead.
          }
        },
      },
    }
  )
}

/**
 * Service-role client — bypasses all RLS policies.
 * Use ONLY in server-side Route Handlers / Server Actions.
 * NEVER expose this to the browser.
 */
export function createAdminSupabaseClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'https://placeholder.supabase.co').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim();

  return createClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

