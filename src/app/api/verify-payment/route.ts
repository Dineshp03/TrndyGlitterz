import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  getAuthUserId,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  jsonResponse,
} from "@/lib/auth";

/**
 * POST /api/verify-payment
 * Verifies the Razorpay payment signature using HMAC-SHA256.
 *
 * Body: {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 * }
 */
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate all required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return badRequestResponse(
        "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature"
      );
    }

    // Generate HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      return badRequestResponse("Payment verification failed — signature mismatch");
    }

    return jsonResponse({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return serverErrorResponse(
      error.message || "Payment verification failed"
    );
  }
}
