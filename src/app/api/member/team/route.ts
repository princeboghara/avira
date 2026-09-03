import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

interface DownlineMember {
  srNo: number;
  level: number;
  levelLabel: string;
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  position: string;
  currentPv: number;
  status: string;
  joiningDate: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // 1. Fetch root user record
      const rootRes = await client.query(
        `SELECT id, member_id FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1`,
        [session.memberId]
      );

      if (rootRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      const root = rootRes.rows[0];

      // 2. High-performance PostgreSQL Recursive CTE: fetches only this user's downline subtree directly via indexed user_binary_pv
      const downlineRes = await client.query(
        `
        WITH RECURSIVE downline AS (
          -- Immediate children of root (Level 1)
          SELECT 
            user_id,
            binary_position AS side,
            1 AS level
          FROM user_binary_pv
          WHERE binary_parent_id = $1

          UNION ALL

          -- Recursive downlines preserving branch side (LEFT or RIGHT)
          SELECT 
            b.user_id,
            d.side,
            d.level + 1
          FROM user_binary_pv b
          INNER JOIN downline d ON b.binary_parent_id = d.user_id
        )
        SELECT 
          d.level,
          d.side,
          u.id,
          u.member_id,
          u.full_name,
          u.mobile,
          u.status,
          u.joined_date,
          u.created_at,
          b.personal_pv
        FROM downline d
        JOIN users u ON d.user_id = u.id
        JOIN user_binary_pv b ON d.user_id = b.user_id
        ORDER BY d.level ASC, u.created_at ASC;
      `,
        [root.id]
      );

      let leftCount = 0;
      let rightCount = 0;

      const teamList: DownlineMember[] = downlineRes.rows.map((row, idx) => {
        const side = row.side === "RIGHT" ? "RIGHT" : "LEFT";
        if (side === "LEFT") leftCount++;
        else rightCount++;

        return {
          srNo: idx + 1,
          level: row.level,
          levelLabel: `Level ${row.level}`,
          id: row.id,
          memberId: row.member_id,
          fullName: row.full_name,
          mobile: row.mobile || "—",
          position: side,
          currentPv: Number(row.personal_pv || 0),
          status: row.status,
          joiningDate: row.joined_date || (row.created_at ? new Date(row.created_at).toISOString() : ""),
        };
      });

      // 3. Calculate Today's & Weekly PV for Left vs Right downlines
      const pvRes = await client.query(
        `
        WITH RECURSIVE downline AS (
          SELECT 
            user_id, binary_position AS side
          FROM user_binary_pv
          WHERE binary_parent_id = $1

          UNION ALL

          SELECT 
            b.user_id, d.side
          FROM user_binary_pv b
          INNER JOIN downline d ON b.binary_parent_id = d.user_id
        )
        SELECT 
          COALESCE(SUM(CASE WHEN d.side = 'LEFT' AND o.created_at >= CURRENT_DATE THEN o.pv ELSE 0 END), 0) AS today_left_pv,
          COALESCE(SUM(CASE WHEN d.side = 'RIGHT' AND o.created_at >= CURRENT_DATE THEN o.pv ELSE 0 END), 0) AS today_right_pv,
          COALESCE(SUM(CASE WHEN d.side = 'LEFT' AND o.created_at >= date_trunc('week', CURRENT_DATE) THEN o.pv ELSE 0 END), 0) AS weekly_left_pv,
          COALESCE(SUM(CASE WHEN d.side = 'RIGHT' AND o.created_at >= date_trunc('week', CURRENT_DATE) THEN o.pv ELSE 0 END), 0) AS weekly_right_pv
        FROM downline d
        JOIN orders o ON o.user_id = d.user_id
        WHERE o.status IN ('APPROVED', 'PAID', 'CONFIRMED', 'COMPLETED', 'DISPATCHED', 'DELIVERED');
      `,
        [root.id]
      );

      // 4. Calculate Today's & Weekly Matched PV from transactions
      const matchRes = await client.query(
        `
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'BINARY_MATCHING' AND (created_at >= CURRENT_DATE OR date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN amount ELSE 0 END), 0) AS today_matched_pv,
          COALESCE(SUM(CASE WHEN type = 'BINARY_MATCHING' AND (created_at >= date_trunc('week', CURRENT_DATE) OR date >= TO_CHAR(date_trunc('week', CURRENT_DATE), 'YYYY-MM-DD')) THEN amount ELSE 0 END), 0) AS weekly_matched_pv
        FROM transactions
        WHERE user_id = $1;
      `,
        [root.id]
      );

      const pvRow = pvRes.rows[0] || {};
      const todayLeftPv = parseFloat(pvRow.today_left_pv || "0");
      const todayRightPv = parseFloat(pvRow.today_right_pv || "0");
      const weeklyLeftPv = parseFloat(pvRow.weekly_left_pv || "0");
      const weeklyRightPv = parseFloat(pvRow.weekly_right_pv || "0");

      const matchRow = matchRes.rows[0] || {};
      const todayMatchedPv = parseFloat(matchRow.today_matched_pv || "0");
      const weeklyMatchedPv = parseFloat(matchRow.weekly_matched_pv || "0");

      return NextResponse.json({
        success: true,
        totalTeam: teamList.length,
        leftCount,
        rightCount,
        pvStats: {
          todayLeftPv,
          todayRightPv,
          weeklyLeftPv,
          weeklyRightPv,
          todayMatchedPv,
          weeklyMatchedPv,
        },
        team: teamList,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching downline team:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
