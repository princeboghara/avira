import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getMonthlyRoyaltyPool, executeMonthlyRoyaltyClosing, checkRoyaltyQualification } from "@/lib/royalty";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // e.g. "2026-08"

    const poolSummary = await getMonthlyRoyaltyPool(client, month || undefined);

    // List all users and identify qualified achievers
    const allUsersRes = await client.query(
      `SELECT u.id, u.member_id, u.full_name, u.mobile, u.state, u.status, b.personal_pv
       FROM users u
       LEFT JOIN user_binary_pv b ON u.id = b.user_id
       ORDER BY u.created_at ASC`
    );

    const achievers: any[] = [];
    for (const u of allUsersRes.rows) {
      const qual = await checkRoyaltyQualification(client, u.id, u.member_id);
      if (qual.isQualified) {
        achievers.push({
          id: u.id,
          memberId: u.member_id,
          fullName: u.full_name,
          mobile: u.mobile,
          state: u.state,
          leftCount: qual.leftDirects1000Pv,
          rightCount: qual.rightDirects1000Pv,
          personalPv: parseFloat(u.personal_pv || "0"),
        });
      }
    }

    return NextResponse.json({
      success: true,
      poolSummary,
      achievers,
    });
  } catch (err: any) {
    console.error("Admin royalty get error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json().catch(() => ({}));
    const month = body.month; // e.g. "2026-08"

    const result = await executeMonthlyRoyaltyClosing(client, month);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin royalty distribution error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to execute royalty closing" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
