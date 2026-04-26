import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { getAuth } from "@clerk/nextjs/server";

// Service role client — bypasses RLS, for admin operations only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isAdmin = (userId: string | null) => {
  const admins = process.env.ADMIN_USER_IDS?.split(",") || [];
  return userId && admins.includes(userId);
};

// POST /api/products — Add a new product
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: body.name,
        price: Number(body.price),
        old_price: body.oldPrice ? Number(body.oldPrice) : null,
        category: body.category ?? "Uncategorized",
        image: body.image ?? "",
        images: body.images ?? [],
        description: body.description ?? "",
        stock: body.stock !== undefined ? Number(body.stock) : 0,
        featured: body.featured ?? false,
        is_imported: body.isImported ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("addProduct API error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err: any) {
    console.error("addProduct route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/products — Update an existing product
export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        name: body.name,
        price: Number(body.price),
        old_price: body.oldPrice ? Number(body.oldPrice) : null,
        category: body.category,
        image: body.image,
        images: body.images,
        description: body.description,
        stock: Number(body.stock),
        featured: body.featured,
        is_imported: body.isImported,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("updateProduct API error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 200 });
  } catch (err: any) {
    console.error("updateProduct route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/products?id=xxx — Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

    if (error) {
      console.error("deleteProduct API error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("deleteProduct route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
