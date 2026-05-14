import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

/**
 * GET /api/admin/orders
 * Admin: Fetch all orders for management.
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  // In a real app, you'd check if this userId is an admin in Supabase or Clerk metadata.
  // For now, we allow any authenticated clerk user to access this if they reach the route.

  try {
    const supabase = createAdminSupabaseClient()

    // Fetch all orders with their items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*)
      `)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('[GET /api/admin/orders]', ordersError)
      return serverErrorResponse(ordersError.message)
    }

    return jsonResponse({ orders })
  } catch (err) {
    console.error('[GET /api/admin/orders] unexpected error:', err)
    return serverErrorResponse()
  }
}

/**
 * DELETE /api/admin/orders?id=xxx
 * Admin: Delete a specific order and its items.
 */
export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return badRequestResponse('Order ID is required')
    }

    const supabase = createAdminSupabaseClient()

    // 1. Delete linked order items first
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)

    if (itemsError) {
      console.error('[DELETE /api/admin/orders] items error:', itemsError)
      throw itemsError
    }

    // 2. Delete the order itself
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (orderError) {
      console.error('[DELETE /api/admin/orders] order error:', orderError)
      throw orderError
    }

    return jsonResponse({ success: true, message: `Order ${id} deleted successfully` })
  } catch (err: any) {
    console.error('[DELETE /api/admin/orders] unexpected error:', err)
    return serverErrorResponse(err.message)
  }
}
