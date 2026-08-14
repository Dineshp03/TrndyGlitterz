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
 * PATCH /api/admin/orders/:id
 * Updates order status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  if (!checkIsAdmin(user)) return unauthorizedResponse('Admin access required')

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) return badRequestResponse('Status is required')

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/admin/orders/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ order: data })
  } catch (err) {
    console.error('[PATCH /api/admin/orders/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}

/**
 * DELETE /api/admin/orders/:id
 * Deletes an order (admin only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  if (!checkIsAdmin(user)) return unauthorizedResponse('Admin access required')

  try {
    const { id } = await params
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/admin/orders/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ message: 'Order deleted' })
  } catch (err) {
    console.error('[DELETE /api/admin/orders/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}
