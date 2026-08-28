import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing fund request ID." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch fund request with lock
    const reqRes = await client.query(
      "SELECT * FROM fund_requests WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (reqRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Fund request not found." }, { status: 404 });
    }

    const fundReq = reqRes.rows[0];
    if (fundReq.status !== "PENDING") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: `Request is already ${fundReq.status}.` },
        { status: 400 }
      );
    }

    const depositAmount = Number(fundReq.amount);

    // 1. Mark fund request APPROVED
    await client.query(
      `UPDATE fund_requests 
       SET status = 'APPROVED', 
           approved_at = NOW(), 
           approved_by = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [admin.userId || "ADMIN", id]
    );

    // 2. Increment user's fund_wallet in user_wallets
    await client.query(
      `UPDATE user_wallets 
       SET fund_wallet = COALESCE(fund_wallet, 0) + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [depositAmount, fundReq.user_id]
    );

    // 3. Insert transaction record
    const txnId = `txn_fund_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    await client.query(
      `INSERT INTO transactions (
        id, user_id, type, amount, tds_amount, admin_charge, rp_wallet_amount, net_amount, description, status, date, created_at
      ) VALUES (
        $1, $2, 'FUND_CREDIT', $3, 0, 0, 0, $3, $4, 'COMPLETED', $5, NOW()
      )`,
      [
        txnId,
        fundReq.user_id,
        depositAmount,
        `Fund Wallet Deposit Approved (UTR: ${fundReq.transaction_id || "N/A"})`,
        dateStr,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Fund request approved successfully! ₹${depositAmount.toLocaleString("en-IN")} credited to Associate ${fundReq.member_id}'s Fund Wallet.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Fund approval error:", error);
    return NextResponse.json({ success: false, message: "Failed to approve fund request." }, { status: 500 });
  } finally {
    client.release();
  }
}
