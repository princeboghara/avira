import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized. Please login." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, transactionId, slipUrl } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: "Please enter a valid deposit amount." }, { status: 400 });
    }

    if (!transactionId || !transactionId.trim()) {
      return NextResponse.json({ success: false, message: "Transaction ID / UTR is required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Get member details
      const userRes = await client.query("SELECT id, member_id, full_name, mobile FROM users WHERE id = $1 LIMIT 1", [session.userId]);
      if (userRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User account not found." }, { status: 404 });
      }

      const user = userRes.rows[0];
      const requestId = `freq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await client.query(
        `INSERT INTO fund_requests (
          id, user_id, member_id, full_name, mobile, amount, transaction_id, slip_url, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', NOW(), NOW()
        )`,
        [
          requestId,
          user.id,
          user.member_id,
          user.full_name,
          user.mobile,
          numAmount,
          transactionId.trim(),
          slipUrl || "",
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Fund deposit request submitted successfully! Admin will verify and credit your Fund Wallet.",
        requestId,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Fund request error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit fund request." }, { status: 500 });
  }
}
