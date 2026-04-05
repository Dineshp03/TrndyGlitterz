import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

// ─── POST /api/users ────────────────────────────────────────────────────────
// Sync a Clerk user into the Supabase `profiles` table on first login.
// Call this from your frontend right after Clerk's useUser() resolves.
//
// Body:
// {
//   clerkUserId: string        — Clerk user_id (e.g. "user_2abc...")
//   email: string
//   fullName?: string
//   phone?: string
//   address?: string
//   city?: string
//   state?: string
//   pincode?: string
//   avatarUrl?: string
// }
export async function POST(request: NextRequest) {
  const authUserId = await getAuthUserId(request)
  if (!authUserId) return unauthorizedResponse()

  try {
    const body = await request.json()
    const {
      clerkUserId,
      email,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      avatarUrl,
    } = body

    if (!clerkUserId) return badRequestResponse('clerkUserId is required')
    if (!email) return badRequestResponse('email is required')

    // Users can only sync their own profile
    if (authUserId !== clerkUserId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden — clerkUserId must match your own auth token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Upsert into profiles based on clerk_user_id
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          email,
          full_name: fullName ?? null,
          phone: phone ?? null,
          address: address ?? null,
          city: city ?? null,
          state: state ?? null,
          pincode: pincode ?? null,
          avatar_url: avatarUrl ?? null,
          role: 'user',
        },
        {
          onConflict: 'clerk_user_id',
          ignoreDuplicates: false,            // update on conflict
        }
      )
      .select()
      .single()

    if (error) {
      console.error('[POST /api/users] upsert error:', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ user: data, message: 'User synced successfully' }, 201)
  } catch (err) {
    console.error('[POST /api/users] unexpected error:', err)
    return serverErrorResponse()
  }
}
