import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT 
        id,
        user_id as "userId",
        member_id as "memberId",
        full_name as "fullName",
        mobile,
        amount::float,
        transaction_id as "transactionId",
        slip_url as "slipUrl",
        status,
        rejection_reason as "rejectionReason",
        created_at as "createdAt",
        updated_at as "updatedAt",
        approved_at as "approvedAt"
      FROM fund_requests 
      WHERE user_id = $1 
      ORDER BY created_at DESC`,
      [session.userId]
    );

    // Also get current fund wallet balance from user_wallets
    const userRes = await client.query("SELECT fund_wallet::float as fund_wallet FROM user_wallets WHERE user_id = $1 LIMIT 1", [session.userId]);
    const fundWallet = userRes.rows[0]?.fund_wallet || 0;

    return NextResponse.json({
      success: true,
      fundWallet,
      requests: res.rows,
    });
  } catch (error) {
    console.error("Fetch fund requests error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch fund requests.", requests: [] }, { status: 500 });
  } finally {
    client.release();
  }
}
