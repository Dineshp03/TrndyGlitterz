import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

// ─── GET /api/orders/:userId ────────────────────────────────────────────────
// Returns all orders for a specific user, with their order items.
// Users can only access their own orders. Admins can access any user's orders.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authUserId = await getAuthUserId(request)
  if (!authUserId) return unauthorizedResponse()

  try {
    const { userId } = await params
    const supabase = createAdminSupabaseClient()

    // Security: users can only see their own orders.
    // To support admin access, check if the authed user is an admin.
    const isOwnOrders = authUserId === userId
    if (!isOwnOrders) {
      // Check if the requester is an admin profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('clerk_user_id', authUserId)
        .single()

      const isAdmin = profile?.role === 'admin'
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Forbidden — you can only view your own orders' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch orders with nested order_items
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        clerk_user_id,
        customer_name,
        customer_email,
        customer_phone,
        address,
        city,
        state,
        pincode,
        total,
        status,
        notes,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          product_image,
          price,
          quantity
        )
      `)
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      // Fallback: orders table might not have clerk_user_id column yet
      // Try fetching by email or just return empty
      console.error('[GET /api/orders/:userId]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ orders: data, count: data?.length ?? 0 })
  } catch (err) {
    console.error('[GET /api/orders/:userId] unexpected error:', err)
    return serverErrorResponse()
  }
}
