import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        fr.id,
        fr.user_id as "userId",
        fr.member_id as "memberId",
        fr.full_name as "fullName",
        fr.mobile,
        fr.amount::float,
        fr.transaction_id as "transactionId",
        fr.slip_url as "slipUrl",
        fr.status,
        fr.rejection_reason as "rejectionReason",
        fr.created_at as "createdAt",
        fr.updated_at as "updatedAt",
        fr.approved_at as "approvedAt",
        fr.approved_by as "approvedBy",
        COALESCE(w.fund_wallet, 0)::float as "currentFundWallet",
        u.city,
        u.state
      FROM fund_requests fr
      LEFT JOIN users u ON fr.user_id = u.id
      LEFT JOIN user_wallets w ON fr.user_id = w.user_id
      ORDER BY 
        CASE WHEN fr.status = 'PENDING' THEN 0 ELSE 1 END,
        fr.created_at DESC;
    `);

    return NextResponse.json({
      success: true,
      requests: res.rows,
    });
  } catch (error) {
    console.error("Admin fetch funds error:", error);
    return NextResponse.json({ success: false, message: "Failed to load fund requests.", requests: [] }, { status: 500 });
  } finally {
    client.release();
  }
}
