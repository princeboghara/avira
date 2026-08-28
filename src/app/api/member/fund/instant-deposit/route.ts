import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum deposit amount is ₹1." },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay Signature
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay payment verification parameters." },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed. Invalid Razorpay signature." },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 2. Fetch user details
      const userRes = await client.query(
        "SELECT id, member_id, full_name, mobile FROM users WHERE id = $1 LIMIT 1",
        [session.userId]
      );
      if (userRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
      }
      const user = userRes.rows[0];

      // 3. Create approved fund_request record
      const requestId = `fund_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await client.query(
        `INSERT INTO fund_requests (
          id, user_id, member_id, full_name, mobile, amount, transaction_id, slip_url, status, approved_at, approved_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'APPROVED', NOW(), 'RAZORPAY_GATEWAY', NOW(), NOW()
        )`,
        [
          requestId,
          user.id,
          user.member_id,
          user.full_name,
          user.mobile,
          numAmount,
          razorpay_payment_id,
          `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
        ]
      );

      // 4. Increment user_wallets.fund_wallet
      await client.query(
        `INSERT INTO user_wallets (user_id, fund_wallet, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           fund_wallet = COALESCE(user_wallets.fund_wallet, 0) + $2,
           updated_at = NOW()`,
        [user.id, numAmount]
      );

      // 5. Insert Transaction Audit Log
      const txnId = `txn_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
      await client.query(
        `INSERT INTO transactions (
          id, user_id, type, amount, tds_amount, admin_charge, rp_wallet_amount, net_amount, description, status, date, created_at
        ) VALUES (
          $1, $2, 'FUND_CREDIT', $3, 0, 0, 0, $3, $4, 'COMPLETED', $5, NOW()
        )`,
        [
          txnId,
          user.id,
          numAmount,
          `Instant Fund Deposit via Razorpay (Payment ID: ${razorpay_payment_id})`,
          dateStr,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: `₹${numAmount.toLocaleString("en-IN")} deposited successfully into your Fund Wallet via Razorpay!`,
        paymentId: razorpay_payment_id,
      });
    } catch (dbErr: any) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Instant fund deposit error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process instant fund deposit." },
      { status: 500 }
    );
  }
}
