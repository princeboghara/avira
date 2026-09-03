import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("avira_access_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Invalid session token" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // 1. Get current user's profile
      const userRes = await client.query(
        "SELECT id, member_id, left_pv, right_pv, left_child_id, right_child_id FROM v_users_full WHERE id = $1 LIMIT 1",
        [payload.userId]
      );

      if (userRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      const currentUser = userRes.rows[0];

      // 2. Fetch Direct Referrals (matches both user id like usr_... and memberId like AV...)
      const directRes = await client.query(
        `SELECT id, member_id, full_name, mobile, status, personal_pv, daily_capping, binary_position, joined_date
         FROM v_users_full
         WHERE sponsor_id = $1 OR UPPER(sponsor_id) = UPPER($2) OR sponsor_id = 'usr_' || $2
         ORDER BY created_at DESC`,
        [currentUser.id, currentUser.member_id]
      );

      // 3. Fetch Left Leg Downlines using Recursive CTE
      const leftDownlineRes = await client.query(
        `WITH RECURSIVE left_downlines AS (
           SELECT id, member_id, full_name, mobile, status, personal_pv, daily_capping, binary_position, joined_date, 1 AS depth
           FROM v_users_full
           WHERE binary_parent_id = $1 AND binary_position = 'LEFT'
           UNION ALL
           SELECT u.id, u.member_id, u.full_name, u.mobile, u.status, u.personal_pv, u.daily_capping, u.binary_position, u.joined_date, ld.depth + 1
           FROM v_users_full u
           INNER JOIN left_downlines ld ON u.binary_parent_id = ld.id
         )
         SELECT * FROM left_downlines ORDER BY depth ASC, member_id ASC`,
        [currentUser.id]
      );

      // 4. Fetch Right Leg Downlines using Recursive CTE
      const rightDownlineRes = await client.query(
        `WITH RECURSIVE right_downlines AS (
           SELECT id, member_id, full_name, mobile, status, personal_pv, daily_capping, binary_position, joined_date, 1 AS depth
           FROM v_users_full
           WHERE binary_parent_id = $1 AND binary_position = 'RIGHT'
           UNION ALL
           SELECT u.id, u.member_id, u.full_name, u.mobile, u.status, u.personal_pv, u.daily_capping, u.binary_position, u.joined_date, rd.depth + 1
           FROM v_users_full u
           INNER JOIN right_downlines rd ON u.binary_parent_id = rd.id
         )
         SELECT * FROM right_downlines ORDER BY depth ASC, member_id ASC`,
        [currentUser.id]
      );

      return NextResponse.json({
        success: true,
        data: {
          directReferrals: directRes.rows.map((r) => ({
            id: r.id,
            memberId: r.member_id,
            fullName: r.full_name,
            mobile: r.mobile,
            status: r.status,
            personalPv: parseFloat(r.personal_pv || "0"),
            dailyCapping: parseFloat(r.daily_capping || "0"),
            position: r.binary_position,
            joinedDate: r.joined_date,
          })),
          leftTeam: leftDownlineRes.rows.map((r) => ({
            id: r.id,
            memberId: r.member_id,
            fullName: r.full_name,
            mobile: r.mobile,
            status: r.status,
            personalPv: parseFloat(r.personal_pv || "0"),
            dailyCapping: parseFloat(r.daily_capping || "0"),
            position: r.binary_position,
            joinedDate: r.joined_date,
          })),
          rightTeam: rightDownlineRes.rows.map((r) => ({
            id: r.id,
            memberId: r.member_id,
            fullName: r.full_name,
            mobile: r.mobile,
            status: r.status,
            personalPv: parseFloat(r.personal_pv || "0"),
            dailyCapping: parseFloat(r.daily_capping || "0"),
            position: r.binary_position,
            joinedDate: r.joined_date,
          })),
          stats: {
            totalDirect: directRes.rows.length,
            totalLeft: leftDownlineRes.rows.length,
            totalRight: rightDownlineRes.rows.length,
            leftPv: parseFloat(currentUser.left_pv || "0"),
            rightPv: parseFloat(currentUser.right_pv || "0"),
          },
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Community fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
