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

    // 1. Insert the order using raw SQL to bypass PostgREST schema cache
    const { data: orderId, error: orderError } = await supabase.rpc(
      "create_order_with_razorpay",
      {
        p_clerk_user_id: userId,
        p_customer_name: customer_name,
        p_customer_email: customer_email,
        p_customer_phone: customer_phone ?? null,
        p_address: address,
        p_city: city ?? null,
        p_state: state ?? null,
        p_pincode: pincode ?? null,
        p_total: total,
        p_notes: notes ?? null,
        p_payment_method: payment_method ?? "cod",
        p_razorpay_payment_id: razorpay_payment_id ?? null,
        p_razorpay_order_id: razorpay_order_id ?? null,
      }
    );

    let finalOrderId: string;

    if (orderError) {
      // Fallback: direct insert via PostgREST (schema cache may have refreshed by now)
      console.warn("RPC failed, falling back to direct insert:", orderError.message);
      const { data: fallbackOrder, error: fallbackError } = await supabase
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
          payment_method: payment_method || "cod",
          razorpay_payment_id,
          razorpay_order_id,
          status: "pending",
        })
        .select("id")
        .single();

      if (fallbackError) {
        console.error("Order insert error:", fallbackError);
        return serverErrorResponse(fallbackError.message);
      }
      finalOrderId = fallbackOrder.id;
    } else {
      finalOrderId = orderId;
    }

    // 2. Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: finalOrderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return serverErrorResponse("Order created but items failed to save.");
    }

    // 3. Clear the user's cart
    try {
      await supabase.from("cart_items").delete().eq("clerk_user_id", userId);
    } catch (cartError) {
      console.error("Failed to clear cart after order:", cartError);
    }

    return jsonResponse({ success: true, orderId: finalOrderId }, 201);
  } catch (error: any) {
    console.error("API error placing order:", error);
    return serverErrorResponse(error.message);
  }
}
