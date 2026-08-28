import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { amount, amountInPaise, currency = "INR", receipt, notes } = body;

    // Normalize amount to paise (integer)
    let finalAmountInPaise: number;
    if (amountInPaise !== undefined && amountInPaise !== null) {
      finalAmountInPaise = Math.round(Number(amountInPaise));
    } else if (amount !== undefined && amount !== null) {
      // If amount is provided in rupees (e.g. 500), convert to paise (50000)
      const num = Number(amount);
      finalAmountInPaise = Math.round(num * 100);
    } else {
      return NextResponse.json(
        { success: false, message: "Amount is required" },
        { status: 400 }
      );
    }

    // Validation: Minimum amount is 100 paise (₹1.00)
    if (isNaN(finalAmountInPaise) || finalAmountInPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum payment amount must be at least ₹1.00 (100 paise).",
        },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayInstance();
    const finalReceipt = receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const order = await razorpay.orders.create({
      amount: finalAmountInPaise,
      currency: currency.toUpperCase(),
      receipt: String(finalReceipt).substring(0, 40),
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    const statusCode = error?.statusCode || 500;
    const errorMsg = error?.error?.description || error?.message || "Failed to create Razorpay order";
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: statusCode }
    );
  }
}
