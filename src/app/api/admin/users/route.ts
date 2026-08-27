import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const search = req.nextUrl.searchParams.get("search") || "";
  const client = await pool.connect();

  try {
    let query = `
      SELECT 
        id,
        member_id,
        full_name,
        mobile,
        sponsor_id,
        sponsor_name,
        pincode,
        city,
        state,
        role,
        status,
        wallet_balance,
        total_earnings,
        direct_referrals_count,
        total_team_count,
        joined_date
      FROM users
    `;

    const params: string[] = [];

    if (search.trim()) {
      query += `
        WHERE 
          member_id ILIKE $1 OR 
          full_name ILIKE $1 OR 
          mobile ILIKE $1 OR 
          city ILIKE $1
      `;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 50;`;

    const res = await client.query(query, params);

    const users = res.rows.map((row) => ({
      id: row.id,
      memberId: row.member_id,
      fullName: row.full_name,
      mobile: row.mobile,
      sponsorId: row.sponsor_id,
      sponsorName: row.sponsor_name,
      pincode: row.pincode,
      city: row.city,
      state: row.state,
      role: row.role,
      status: row.status,
      walletBalance: parseFloat(row.wallet_balance || "0"),
      totalEarnings: parseFloat(row.total_earnings || "0"),
      directReferralsCount: parseInt(row.direct_referrals_count || "0", 10),
      totalTeamCount: parseInt(row.total_team_count || "0", 10),
      joinedDate: row.joined_date,
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users list" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
