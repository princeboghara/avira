import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, findUserByIdentifier } from "@/lib/db";

import { getLeadershipPercentages } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByIdentifier(session.memberId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const range = searchParams.get("range");

    const client = await pool.connect();
    try {
      const currentPercentages = await getLeadershipPercentages(client);
      let query = `
        SELECT 
          id,
          user_id,
          type,
          amount,
          tds_amount,
          admin_charge,
          rp_wallet_amount,
          net_amount,
          description,
          status,
          date,
          created_at
        FROM transactions
        WHERE user_id = $1 AND (type = 'LEADERSHIP_BONUS' OR description ILIKE '%leadership%')
      `;

      const params: any[] = [user.id];

      if (range === "today") {
        query += ` AND created_at >= CURRENT_DATE`;
      } else if (range === "week") {
        query += ` AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      } else if (range === "month") {
        query += ` AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
      } else if (startDate && endDate) {
        params.push(startDate, `${endDate} 23:59:59`);
        query += ` AND created_at >= $2 AND created_at <= $3`;
      }

      query += ` ORDER BY created_at DESC;`;

      const res = await client.query(query, params);

      let totalGross = 0;
      let totalLevel1 = 0;
      let totalLevel2 = 0;
      let countLevel1 = 0;
      let countLevel2 = 0;

      const records = res.rows.map((row, idx) => {
        const gross = Number(row.amount || 0);
        const desc = row.description || "";
        const isLevel1 = desc.includes("Level 1") || !desc.includes("Level 2");
        const level = isLevel1 ? `Level 1 (${currentPercentages.level1}%)` : `Level 2 (${currentPercentages.level2}%)`;

        if (isLevel1) {
          totalLevel1 += gross;
          countLevel1++;
        } else {
          totalLevel2 += gross;
          countLevel2++;
        }

        totalGross += gross;

        const tds = Math.round(gross * 0.02 * 100) / 100;
        const admin = Math.round(gross * 0.08 * 100) / 100;
        const rp = Math.round(gross * 0.05 * 100) / 100;
        const net = Math.round((gross - tds - admin - rp) * 100) / 100;

        return {
          id: row.id,
          srNo: idx + 1,
          date: row.date || (row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()),
          level,
          grossAmount: gross,
          tdsAmount: tds,
          adminCharge: admin,
          rpWalletAmount: rp,
          netAmount: net,
          description: desc || `Leadership Supporting Bonus (${level})`,
          status: row.status || "COMPLETED",
        };
      });

      return NextResponse.json({
        success: true,
        currentPercentages,
        summary: {
          totalGross,
          totalLevel1,
          totalLevel2,
          countLevel1,
          countLevel2,
          totalRecords: records.length,
        },
        records,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error fetching leadership bonus earnings:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
