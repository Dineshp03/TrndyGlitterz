import { NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import {
  getAuthPayload,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from "@/lib/auth";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getAdminEmails } from "@/lib/admin";

// Admin emails list from central helper
const ADMIN_EMAILS = getAdminEmails();

/**
 * Robust Admin Check (reads directly from Clerk JWT — no DB dependency):
 * 1. Checks ADMIN_USER_IDS in .env.local
 * 2. Checks email claim from the JWT token against ADMIN_EMAILS whitelist
 * 3. Fetches user from Clerk API if email is missing from JWT
 * 4. Falls back to DB profiles table role check
 */
const isAdmin = async (request: NextRequest): Promise<boolean> => {
  let userId: string | null = null;
  let tokenEmail: string | undefined;

  try {
    const authData = await auth();
    userId = authData.userId;
    tokenEmail = authData.sessionClaims?.email as string | undefined;
  } catch (err) {
    console.error("[AUTH] Error calling auth():", err);
  }

  if (!userId) {
    const payload = await getAuthPayload(request);
    if (payload) {
      userId = payload.sub;
      tokenEmail =
        payload.email ||
        payload.primaryEmailAddress ||
        (Array.isArray(payload.email_addresses) && payload.email_addresses[0]?.email_address);
    }
  }

  if (!userId) {
    console.log("[AUTH] Admin check failed: No valid userId found in token or session.");
    return false;
  }

  // 1. Check ADMIN_USER_IDS env var and HARDCODED fallback
  const envAdmins = process.env.ADMIN_USER_IDS?.split(",").map(s => s.trim()) || [];
  if (envAdmins.includes(userId) || userId === "user_3BmmmYNNWjzlmRPzM6OEuEgQWTM") {
    return true;
  }

  // 2. Fetch email from Clerk API directly if not in JWT
  if (!tokenEmail) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      tokenEmail = user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId)?.emailAddress 
        || user.emailAddresses?.[0]?.emailAddress;
    } catch (err) {
      console.error("[AUTH] Failed to fetch user from Clerk API:", err);
    }
  }

  // 3. Check email from JWT/API directly (most reliable)
  if (tokenEmail && ADMIN_EMAILS.includes(tokenEmail.toLowerCase())) {
    console.log(`[AUTH] Admin granted via email: ${tokenEmail}`);
    return true;
  }

  // 4. Fallback: check DB profiles table
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, email")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profile?.role === "admin") return true;
    if (profile?.email && ADMIN_EMAILS.includes(profile.email.toLowerCase())) return true;
  } catch (err) {
    console.error("[AUTH] DB admin check error:", err);
  }

  console.log(`[AUTH] Admin check failed — userId: ${userId}, email: ${tokenEmail}`);
  return false;
};

// GET /api/products — Fetch products (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    const supabase = createAdminSupabaseClient();
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (featured === "true") query = query.eq("featured", true);
    if (search) query = query.ilike("name", `%${search}%`);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/products error:", error);
      return serverErrorResponse(error.message);
    }

    return jsonResponse({ products: data || [] });
  } catch (err: any) {
    console.error("GET /api/products route error:", err);
    return serverErrorResponse(err.message || "Internal server error");
  }
}

// POST /api/products — Add a new product
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return unauthorizedResponse("Unauthorized — admin access required. (Token might be expired or invalid)");
    }
    const body = await request.json();

    const supabaseAdmin = createAdminSupabaseClient();

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
      return serverErrorResponse(error.message);
    }

    revalidatePath("/", "layout"); // Revalidate all pages to show new product instantly

    return jsonResponse({ product: data }, 201);
  } catch (err: any) {
    console.error("addProduct route error:", err);
    return serverErrorResponse(err.message || "Internal server error");
  }
}

// PUT /api/products — Update an existing product
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return unauthorizedResponse("Unauthorized — admin access required");
    }
    const body = await request.json();

    if (!body.id) {
      return badRequestResponse("Product ID is required");
    }

    const supabaseAdmin = createAdminSupabaseClient();

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
      return serverErrorResponse(error.message);
    }

    revalidatePath("/", "layout"); // Revalidate all pages to show updated price/details instantly

    return jsonResponse({ product: data });
  } catch (err: any) {
    console.error("updateProduct route error:", err);
    return serverErrorResponse(err.message || "Internal server error");
  }
}

// DELETE /api/products?id=xxx — Delete a product AND its images from storage
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return unauthorizedResponse("Unauthorized — admin access required");
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return badRequestResponse("Product ID is required");
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // 1. Fetch the product to get its image URLs before deleting
    const { data: product, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("image, images")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("deleteProduct fetch error:", fetchError);
    }

    // 2. Collect all image URLs (primary + gallery)
    const allImageUrls: string[] = [];
    if (product) {
      if (product.image) allImageUrls.push(product.image);
      if (Array.isArray(product.images)) {
        product.images.forEach((url: string) => {
          if (url && !allImageUrls.includes(url)) allImageUrls.push(url);
        });
      }
    }

    // 3. Extract storage file paths from public URLs and delete from Storage
    if (allImageUrls.length > 0) {
      const filePaths = allImageUrls
        .map(url => {
          try {
            const bucketMarker = "/product-images/";
            const index = url.indexOf(bucketMarker);
            if (index === -1) return null;
            let path = url.substring(index + bucketMarker.length).split('?')[0];
            return decodeURIComponent(path);
          } catch (e) {
            return null;
          }
        })
        .filter((path): path is string => !!path);

      if (filePaths.length > 0) {
        await supabaseAdmin.storage.from("product-images").remove(filePaths);
      }
    }

    // 4. Delete the database row
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

    if (error) {
      console.error("deleteProduct API error:", error);
      return serverErrorResponse(error.message);
    }

    revalidatePath("/", "layout"); // Revalidate all pages to remove deleted product instantly

    return jsonResponse({ success: true });
  } catch (err: any) {
    console.error("deleteProduct route error:", err);
    return serverErrorResponse(err.message || "Internal server error");
  }
}
