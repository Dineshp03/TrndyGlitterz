import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total: order.total,
      customer: order.customer_name,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error("API error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
