import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /api/create-order
 * Creates a Razorpay order and returns order_id, amount, currency.
 *
 * Body: { amount: number (in rupees), receipt?: string }
 */
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { amount, receipt } = body;

    // Convert rupees to paise (Razorpay expects paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // Validate minimum amount (₹1 = 100 paise)
    if (!amount || isNaN(amountInPaise) || amountInPaise < 100) {
      return badRequestResponse(
        "Amount must be at least ₹1 (100 paise)"
      );
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return jsonResponse({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);

    // Handle Razorpay auth failures specifically
    if (error?.statusCode === 401) {
      return new Response(
        JSON.stringify({ error: "Razorpay authentication failed" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return serverErrorResponse(
      error?.error?.description || error.message || "Failed to create Razorpay order"
    );
  }
}
