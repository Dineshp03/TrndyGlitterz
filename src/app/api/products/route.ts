import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { getAuthUserId, jsonResponse, serverErrorResponse, unauthorizedResponse, badRequestResponse } from '@/lib/auth'

// ─── GET /api/products ────────────────────────────────────────────────────────
// Public — no auth required.
// Supports ?category=rings&featured=true&limit=20&search=gold query params.
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') ?? '100')

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) query = query.eq('category', category)
    if (featured === 'true') query = query.eq('featured', true)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/products]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ products: data, count: data?.length ?? 0 })
  } catch (err) {
    console.error('[GET /api/products] unexpected error:', err)
    return serverErrorResponse()
  }
}

// ─── POST /api/products ───────────────────────────────────────────────────────
// Admin-only — requires valid Clerk token.
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) return unauthorizedResponse()

    const body = await request.json()
    const { name, price, category, image, images, description, stock, featured, isImported, oldPrice } = body

    if (!name || price === undefined) {
      return badRequestResponse('name and price are required')
    }

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        price: Number(price),
        old_price: oldPrice ? Number(oldPrice) : null,
        category: category ?? 'Uncategorized',
        image: image ?? '',
        images: images ?? [],
        description: description ?? '',
        stock: stock !== undefined ? Number(stock) : 0,
        featured: featured ?? false,
        is_imported: isImported ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/products]', error)
      return serverErrorResponse(error.message)
    }

    return jsonResponse({ product: data }, 201)
  } catch (err) {
    console.error('[POST /api/products] unexpected error:', err)
    return serverErrorResponse()
  }
}
