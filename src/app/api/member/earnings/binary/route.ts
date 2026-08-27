import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, findUserByIdentifier } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
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
        WHERE user_id = $1 AND (type = 'BINARY_MATCHING' OR description ILIKE '%binary%')
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
      let totalTds = 0;
      let totalAdmin = 0;
      let totalRp = 0;
      let totalNet = 0;

      const records = res.rows.map((row, idx) => {
        const gross = Number(row.amount || 0);
        const tds = row.tds_amount !== null && row.tds_amount !== undefined
          ? Number(row.tds_amount)
          : Math.round(gross * 0.02);
        const admin = row.admin_charge !== null && row.admin_charge !== undefined
          ? Number(row.admin_charge)
          : Math.round(gross * 0.08);
        const rp = row.rp_wallet_amount !== null && row.rp_wallet_amount !== undefined
          ? Number(row.rp_wallet_amount)
          : Math.round(gross * 0.05);
        const net = row.net_amount !== null && row.net_amount !== undefined
          ? Number(row.net_amount)
          : Math.round(gross - tds - admin - rp);

        totalGross += gross;
        totalTds += tds;
        totalAdmin += admin;
        totalRp += rp;
        totalNet += net;

        return {
          id: row.id,
          srNo: idx + 1,
          date: row.date || (row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()),
          grossAmount: gross,
          tdsAmount: tds,
          adminCharge: admin,
          rpWalletAmount: rp,
          netAmount: net,
          description: row.description || "1:1 Binary PV Pair Match Income",
          status: row.status || "COMPLETED",
        };
      });

      return NextResponse.json({
        success: true,
        summary: {
          totalGross,
          totalTds,
          totalAdmin,
          totalRp,
          totalNet,
          rpWalletBalance: user.rpWallet || totalRp,
        },
        records,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error fetching binary earnings:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
