import Razorpay from "razorpay";
import crypto from "crypto";

const DEFAULT_RAZORPAY_KEY_ID = "rzp_test_TVDtnzMXyvMMER";
const DEFAULT_RAZORPAY_KEY_SECRET = "JMHR6MaZiY1rEWxKnCQu4Q1q";

export function getRazorpayInstance(): Razorpay {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    DEFAULT_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_RAZORPAY_KEY_SECRET;

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
  const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_RAZORPAY_KEY_SECRET;

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
