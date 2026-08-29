import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, member_id, full_name, mobile, binary_position, personal_pv,
                joined_date, created_at, status
         FROM v_users_full
         WHERE UPPER(sponsor_id) = UPPER($1)
         ORDER BY created_at DESC, joined_date DESC`,
        [session.memberId]
      );

      const referrals = res.rows.map((row, idx) => ({
        srNo: idx + 1,
        id: row.id,
        memberId: row.member_id,
        fullName: row.full_name,
        mobile: row.mobile || "—",
        position: row.binary_position || "LEFT",
        currentPv: Number(row.personal_pv || 0),
        status: row.status,
        joiningDate: row.joined_date || (row.created_at ? new Date(row.created_at).toISOString() : ""),
      }));

      return NextResponse.json({
        success: true,
        totalReferrals: referrals.length,
        referrals,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching direct referrals:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
