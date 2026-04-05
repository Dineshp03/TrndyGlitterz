import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { getAuthUserId, jsonResponse, serverErrorResponse, unauthorizedResponse } from '@/lib/auth'

// ─── GET /api/products/:id ────────────────────────────────────────────────────
// Public — no auth required.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      console.error('[GET /api/products/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ product: data })
  } catch (err) {
    console.error('[GET /api/products/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}

// ─── PATCH /api/products/:id ──────────────────────────────────────────────────
// Admin-only — requires valid Clerk token.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return unauthorizedResponse()

    const { id } = await params
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    if (body.name !== undefined)        updates.name = body.name
    if (body.price !== undefined)       updates.price = Number(body.price)
    if (body.oldPrice !== undefined)    updates.old_price = body.oldPrice ? Number(body.oldPrice) : null
    if (body.category !== undefined)    updates.category = body.category
    if (body.image !== undefined)       updates.image = body.image
    if (body.images !== undefined)      updates.images = body.images
    if (body.description !== undefined) updates.description = body.description
    if (body.stock !== undefined)       updates.stock = Number(body.stock)
    if (body.featured !== undefined)    updates.featured = body.featured
    if (body.isImported !== undefined)  updates.is_imported = body.isImported

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/products/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ product: data })
  } catch (err) {
    console.error('[PATCH /api/products/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
// Admin-only — requires valid Clerk token.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return unauthorizedResponse()

    const { id } = await params
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/products/:id]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ success: true })
  } catch (err) {
    console.error('[DELETE /api/products/:id] unexpected error:', err)
    return serverErrorResponse()
  }
}

