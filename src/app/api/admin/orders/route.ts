import { NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { checkIsAdmin } from '@/lib/admin'
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

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  if (!checkIsAdmin(user)) return unauthorizedResponse('Admin access required')

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

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  if (!checkIsAdmin(user)) return unauthorizedResponse('Admin access required')

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const supabase = createAdminSupabaseClient()

    if (id) {
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
    } else {
      // Delete all orders. Supabase requires a filter, so we filter by id not equaling a dummy value.
      // Cascading delete is set up in Supabase on order_items table, so items are deleted automatically.
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (orderError) {
        console.error('[DELETE /api/admin/orders] all orders error:', orderError)
        throw orderError
      }

      return jsonResponse({ success: true, message: 'All orders deleted successfully' })
    }
  } catch (err: any) {
    console.error('[DELETE /api/admin/orders] unexpected error:', err)
    return serverErrorResponse(err.message)
  }
}
