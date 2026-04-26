import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

// ─── GET /api/cart ─────────────────────────────────────────────────────────
// Returns the authenticated user's cart items joined with product details.
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        added_at,
        product:products (
          id,
          name,
          price,
          old_price,
          image,
          images,
          category,
          stock
        )
      `)
      .eq('clerk_user_id', userId)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('[GET /api/cart]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ cart: data })
  } catch (err) {
    console.error('[GET /api/cart] unexpected error:', err)
    return serverErrorResponse()
  }
}

// ─── POST /api/cart ────────────────────────────────────────────────────────
// Add a product to cart. If it already exists, increment the quantity.
// Body: { productId: string, quantity?: number }
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) return badRequestResponse('productId is required')
    if (typeof quantity !== 'number' || quantity < 1) {
      return badRequestResponse('quantity must be a positive number')
    }

    const supabase = createAdminSupabaseClient()

    // Check product exists and is in stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Upsert — if same user+product already exists, overwrite quantity with the new total
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        { clerk_user_id: userId, product_id: productId, quantity },
        {
          onConflict: 'clerk_user_id,product_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      console.error('[POST /api/cart]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ cartItem: data }, 201)
  } catch (err) {
    console.error('[POST /api/cart] unexpected error:', err)
    return serverErrorResponse()
  }
}
