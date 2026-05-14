import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

// ─── GET /api/users/:id ─────────────────────────────────────────────────────
// Fetch a user's profile by their Clerk userId.
// Users can only fetch their own profile (admins can fetch any).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUserId = await getAuthUserId(request)
  if (!authUserId) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminSupabaseClient()

    // Security: users can only see their own profile
    if (authUserId !== id) {
      // Allow admins to see any profile
      const { data: selfProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('clerk_user_id', authUserId)
        .single()

      if (selfProfile?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden — you can only view your own profile' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      console.error('[GET /api/users/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ user: data })
  } catch (err) {
    console.error('[GET /api/users/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}

// ─── PATCH /api/users/:id ───────────────────────────────────────────────────
// Update a user's own profile fields.
// Body: any subset of { fullName, phone, address, city, state, pincode, avatarUrl }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUserId = await getAuthUserId(request)
  if (!authUserId) return unauthorizedResponse()

  try {
    const { id } = await params

    // Users can only update their own profile
    if (authUserId !== id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden — you can only update your own profile' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.fullName !== undefined) updates.full_name = body.fullName
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.address !== undefined) updates.address = body.address
    if (body.city !== undefined) updates.city = body.city
    if (body.state !== undefined) updates.state = body.state
    if (body.pincode !== undefined) updates.pincode = body.pincode
    if (body.avatarUrl !== undefined) updates.avatar_url = body.avatarUrl

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('clerk_user_id', id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/users/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ user: data, message: 'Profile updated' })
  } catch (err) {
    console.error('[PATCH /api/users/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}
