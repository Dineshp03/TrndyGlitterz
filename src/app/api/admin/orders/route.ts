import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

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

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const supabase = createAdminSupabaseClient()

    // Delete all linked items first
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (itemsError) throw itemsError

    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (ordersError) throw ordersError

    return jsonResponse({ success: true })
  } catch (err: any) {
    console.error('[DELETE /api/admin/orders]', err)
    return serverErrorResponse(err.message)
  }
}
