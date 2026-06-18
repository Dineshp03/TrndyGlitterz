import { NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from "@/lib/auth";

// GET /api/products/[id]/reviews — Retrieve reviews and summary statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return badRequestResponse("Product ID is required");
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Fetch reviews for the product, sorted by creation date descending
    const { data: reviews, error } = await supabaseAdmin
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchReviews API error:", error);
      if (error.code === "PGRST205" || error.message?.includes("relation \"product_reviews\" does not exist")) {
        return jsonResponse({
          reviews: [],
          summary: {
            count: 0,
            average: 0,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          },
          warning: "Database table 'product_reviews' is missing. Please run product_reviews_migration.sql in your Supabase SQL Editor."
        });
      }
      return serverErrorResponse(error.message);
    }

    // Calculate rating summaries
    const count = reviews?.length || 0;
    const avgRating = count > 0 
      ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count).toFixed(1))
      : 0;

    // Breakdown distribution of stars (1-5)
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (count > 0) {
      reviews.forEach((r: any) => {
        const rVal = Number(r.rating);
        if (breakdown[rVal] !== undefined) {
          breakdown[rVal]++;
        }
      });
    }

    return jsonResponse({
      reviews: reviews || [],
      summary: {
        count,
        average: avgRating,
        breakdown,
      }
    });
  } catch (err: any) {
    console.error("fetchReviews route error:", err);
    return serverErrorResponse(err.message || "Internal server error");
  }
}

// POST /api/products/[id]/reviews — Submit a review securely verified by Clerk session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return badRequestResponse("Product ID is required");
    }

    // Verify user authorization using Clerk token
    const userId = await getAuthUserId(request);
    if (!userId) {
      return unauthorizedResponse("Unauthorized — please sign in to post a review");
    }

    const body = await request.json();
    const { rating, comment, user_name, user_email, clerk_id } = body;

    // Security check: ensure clerk_id payload matches verified Clerk userId
    if (clerk_id !== userId) {
      return badRequestResponse("User session mismatch");
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return badRequestResponse("Rating must be an integer between 1 and 5");
    }

    if (!comment || !comment.trim()) {
      return badRequestResponse("Comment cannot be empty");
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // Insert review into Supabase
    const { data: newReview, error } = await supabaseAdmin
      .from("product_reviews")
      .insert({
        product_id: productId,
        clerk_id,
        user_name: user_name?.trim() || "Anonymous User",
        user_email: user_email?.trim() || "",
        rating: ratingNum,
        comment: comment.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("postReview API error:", error);
      if (error.code === "PGRST205" || error.message?.includes("relation \"product_reviews\" does not exist")) {
        return badRequestResponse("Database table 'product_reviews' is missing. Please run product_reviews_migration.sql in your Supabase SQL Editor to submit reviews.");
      }
      return serverErrorResponse(error.message);
    }

    return jsonResponse({ review: newReview }, 201);
  } catch (err: any) {
    console.error("postReview route error:", err);
    return serverErrorResponse(err.message || "Internal server error");
  }
}
