import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Support snake_case, camelCase, or short names
    const orderId =
      body.razorpay_order_id ||
      body.razorpayOrderId ||
      body.order_id ||
      body.orderId;

    const paymentId =
      body.razorpay_payment_id ||
      body.razorpayPaymentId ||
      body.payment_id ||
      body.paymentId;

    const signature =
      body.razorpay_signature ||
      body.razorpaySignature ||
      body.signature;

    // Check for missing fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required verification fields (order_id, payment_id, signature).",
        },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      String(orderId).trim(),
      String(paymentId).trim(),
      String(signature).trim()
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment signature verification failed. Invalid signature.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment signature verified successfully.",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });
  } catch (error: any) {
    console.error("Razorpay verify-payment error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal verification error" },
      { status: 500 }
    );
  }
}
