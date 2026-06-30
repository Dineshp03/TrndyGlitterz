import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// GET /api/wishlist?userId=xxx — Load wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("loadWishlist API error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data.map((d: any) => d.product_id) }, { status: 200 });
  } catch (err: any) {
    console.error("loadWishlist route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/wishlist — Toggle wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, action } = body; // action is 'add' or 'remove'

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    if (action === 'remove') {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("clerk_user_id", userId)
        .eq("product_id", productId);

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // action === 'add'
      const { error } = await supabase
        .from("wishlist")
        .upsert(
          [{ clerk_user_id: userId, product_id: productId }],
          { onConflict: 'clerk_user_id,product_id' }
        );

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (err: any) {
    console.error("toggleWishlist route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
