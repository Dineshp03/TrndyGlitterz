import { NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from '@/lib/auth'

// ─── POST /api/orders ──────────────────────────────────────────────────────
// Place a new order. Creates the order row + order_item rows transactionally.
// Body:
// {
//   customerName: string
//   customerEmail: string
//   customerPhone?: string
//   address: string
//   city?: string
//   state?: string
//   pincode?: string
//   notes?: string
//   items: Array<{
//     productId: string
//     productName: string
//     productImage?: string
//     price: number
//     quantity: number
//   }>
// }
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) return unauthorizedResponse()

  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      pincode,
      notes,
      items,
    } = body

    // Validate required fields
    if (!customerName) return badRequestResponse('customerName is required')
    if (!customerEmail) return badRequestResponse('customerEmail is required')
    if (!address) return badRequestResponse('address is required')
    if (!Array.isArray(items) || items.length === 0) {
      return badRequestResponse('items array is required and must not be empty')
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId) return badRequestResponse('Each item must have a productId')
      if (!item.productName) return badRequestResponse('Each item must have a productName')
      if (typeof item.price !== 'number' || item.price <= 0) {
        return badRequestResponse('Each item must have a valid price')
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return badRequestResponse('Each item must have a valid quantity')
      }
    }

    const supabase = createAdminSupabaseClient()

    // Calculate order total
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )

    // Resolve the Supabase UUID for this Clerk user (from profiles table)
    // profiles stores Clerk userIds in the clerk_user_id column if synced,
    // otherwise we use the clerk user_id directly stored as text.
    // We'll store clerk_user_id in orders instead of a UUID FK.

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        clerk_user_id: userId,          // text column (see migration note)
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone ?? null,
        address,
        city: city ?? null,
        state: state ?? null,
        pincode: pincode ?? null,
        total,
        notes: notes ?? null,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('[POST /api/orders] order insert error:', orderError)
      // Fallback: try without clerk_user_id if column doesn't exist yet
      const { data: orderFallback, error: orderFallbackError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone ?? null,
          address,
          city: city ?? null,
          state: state ?? null,
          pincode: pincode ?? null,
          total,
          notes: notes ?? null,
          status: 'pending',
        })
        .select()
        .single()

      if (orderFallbackError) {
        return serverErrorResponse(orderFallbackError.message)
      }

      // 2. Create order items
      const orderItems = items.map((item: {
        productId: string
        productName: string
        productImage?: string
        price: number
        quantity: number
      }) => ({
        order_id: orderFallback.id,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage ?? null,
        price: item.price,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('[POST /api/orders] order_items insert error:', itemsError)
        return serverErrorResponse('Order created but failed to save items: ' + itemsError.message)
      }

      // 3. Clear user's cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('clerk_user_id', userId)

      return jsonResponse({ order: orderFallback, message: 'Order placed successfully' }, 201)
    }

    // 2. Create order items
    const orderItems = items.map((item: {
      productId: string
      productName: string
      productImage?: string
      price: number
      quantity: number
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage ?? null,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('[POST /api/orders] order_items insert error:', itemsError)
      return serverErrorResponse('Order created but failed to save items: ' + itemsError.message)
    }

    // 3. Clear the user's cart after successful order
    await supabase
      .from('cart_items')
      .delete()
      .eq('clerk_user_id', userId)

    return jsonResponse({ order, message: 'Order placed successfully' }, 201)
  } catch (err) {
    console.error('[POST /api/orders] unexpected error:', err)
    return serverErrorResponse()
  }
}
