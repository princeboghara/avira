import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Verifies Razorpay Payment Signature using HMAC-SHA256
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keySecret) {
    console.error("Cannot verify Razorpay signature: RAZORPAY_KEY_SECRET is not configured.");
    return false;
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  try {
    const a = Buffer.from(generatedSignature, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return generatedSignature === signature;
  }
}
