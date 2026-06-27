import { NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from "@/lib/auth";

/**
 * GET /api/orders
 * Fetch all orders for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const supabase = createAdminSupabaseClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total: order.total,
      customer: order.customer_name,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      payment_method: order.payment_method,
      razorpay_payment_id: order.razorpay_payment_id,
      razorpay_order_id: order.razorpay_order_id,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity
      }))
    }));

    return jsonResponse(formattedOrders);
  } catch (error: any) {
    console.error("API error fetching orders:", error);
    return serverErrorResponse(error.message);
  }
}

/**
 * POST /api/orders
 * Place a new order.
 */
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      address,
      city,
      state,
      pincode,
      total,
      notes,
      payment_method,
      razorpay_payment_id,
      razorpay_order_id,
      items,
    } = body;

    // Basic validation
    if (!customer_name || !customer_email || !address || !items || items.length === 0) {
      return badRequestResponse("Missing required order fields");
    }

    const supabase = createAdminSupabaseClient();

    // 1. Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_user_id: userId,
        customer_name,
        customer_email,
        customer_phone,
        address,
        city,
        state,
        pincode,
        total,
        notes,
        payment_method: payment_method || 'cod',
        razorpay_payment_id,
        razorpay_order_id,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      return serverErrorResponse(orderError.message);
    }

    // 2. Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // We don't roll back the order here to keep the record, 
      // but in a production app you might want a transaction.
      return serverErrorResponse("Order created but items failed to save.");
    }

    // 3. Clear the user's cart (optional but recommended)
    try {
      await supabase.from("cart_items").delete().eq("clerk_user_id", userId);
    } catch (cartError) {
      console.error("Failed to clear cart after order:", cartError);
    }

    return jsonResponse({ success: true, orderId: order.id }, 201);
  } catch (error: any) {
    console.error("API error placing order:", error);
    return serverErrorResponse(error.message);
  }
}
