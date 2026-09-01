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

      // 2. High-performance PostgreSQL Recursive CTE: fetches only this user's downline subtree
      const downlineRes = await client.query(
        `
        WITH RECURSIVE downline AS (
          -- Immediate children of root (Level 1)
          SELECT 
            id, member_id, full_name, mobile, binary_position,
            personal_pv, joined_date, created_at, status,
            1 AS level,
            binary_position AS side
          FROM v_users_full
          WHERE binary_parent_id = $1

          UNION ALL

          -- Recursive downlines preserving original branch side (LEFT or RIGHT)
          SELECT 
            u.id, u.member_id, u.full_name, u.mobile, u.binary_position,
            u.personal_pv, u.joined_date, u.created_at, u.status,
            d.level + 1,
            d.side
          FROM v_users_full u
          INNER JOIN downline d ON u.binary_parent_id = d.id
        )
        SELECT * FROM downline ORDER BY level ASC, created_at ASC;
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
            id, binary_position AS side
          FROM v_users_full
          WHERE binary_parent_id = $1

          UNION ALL

          SELECT 
            u.id, d.side
          FROM v_users_full u
          INNER JOIN downline d ON u.binary_parent_id = d.id
        )
        SELECT 
          COALESCE(SUM(CASE WHEN d.side = 'LEFT' AND o.created_at >= CURRENT_DATE THEN o.pv ELSE 0 END), 0) AS today_left_pv,
          COALESCE(SUM(CASE WHEN d.side = 'RIGHT' AND o.created_at >= CURRENT_DATE THEN o.pv ELSE 0 END), 0) AS today_right_pv,
          COALESCE(SUM(CASE WHEN d.side = 'LEFT' AND o.created_at >= date_trunc('week', CURRENT_DATE) THEN o.pv ELSE 0 END), 0) AS weekly_left_pv,
          COALESCE(SUM(CASE WHEN d.side = 'RIGHT' AND o.created_at >= date_trunc('week', CURRENT_DATE) THEN o.pv ELSE 0 END), 0) AS weekly_right_pv
        FROM downline d
        JOIN orders o ON o.user_id = d.id
        WHERE o.status IN ('APPROVED', 'PAID', 'CONFIRMED', 'COMPLETED', 'DISPATCHED', 'DELIVERED');
      `,
        [root.id]
      );

      const pvRow = pvRes.rows[0] || {};
      const todayLeftPv = parseFloat(pvRow.today_left_pv || "0");
      const todayRightPv = parseFloat(pvRow.today_right_pv || "0");
      const weeklyLeftPv = parseFloat(pvRow.weekly_left_pv || "0");
      const weeklyRightPv = parseFloat(pvRow.weekly_right_pv || "0");

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
