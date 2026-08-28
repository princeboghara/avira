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

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Payment details could not be verified";

    const client = await pool.connect();
    try {
      const checkRes = await client.query("SELECT * FROM fund_requests WHERE id = $1", [id]);
      if (checkRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "Fund request not found." }, { status: 404 });
      }

      const fundReq = checkRes.rows[0];
      if (fundReq.status !== "PENDING") {
        return NextResponse.json({ success: false, message: `Request is already ${fundReq.status}.` }, { status: 400 });
      }

      await client.query(
        `UPDATE fund_requests 
         SET status = 'REJECTED', 
             rejection_reason = $1, 
             updated_at = NOW() 
         WHERE id = $2`,
        [reason, id]
      );

      return NextResponse.json({
        success: true,
        message: `Fund request rejected.`,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Fund rejection error:", error);
    return NextResponse.json({ success: false, message: "Failed to reject fund request." }, { status: 500 });
  }
}
