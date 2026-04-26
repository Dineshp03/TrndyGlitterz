import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

// ─── DELETE /api/cart/:id ──────────────────────────────────────────────────
// Remove a specific cart item by its row ID.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminSupabaseClient()

    // Delete only if the row belongs to this user (safety check)
    const { error, count } = await supabase
      .from('cart_items')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('[DELETE /api/cart/:id]', error)
      return serverErrorResponse(error.message)
    }

    if (count === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart item not found or does not belong to you' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return jsonResponse({ message: 'Cart item removed', id })
  } catch (err) {
    console.error('[DELETE /api/cart/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}

// ─── PATCH /api/cart/:id ───────────────────────────────────────────────────
// Update the quantity of a specific cart item.
// Body: { quantity: number }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()
    const { quantity } = body

    if (typeof quantity !== 'number' || quantity < 1) {
      return new Response(
        JSON.stringify({ error: 'quantity must be a positive number' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/cart/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ cartItem: data })
  } catch (err) {
    console.error('[PATCH /api/cart/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}
