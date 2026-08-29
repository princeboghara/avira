import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, findUserByIdentifier } from "@/lib/db";
import { checkRoyaltyQualification, getMonthlyRoyaltyPool } from "@/lib/royalty";

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

    const client = await pool.connect();
    try {
      // 1. Check user's live Royalty qualification status
      const qualification = await checkRoyaltyQualification(client, user.id, user.memberId);

      // 2. Fetch current monthly pool estimation
      const poolSummary = await getMonthlyRoyaltyPool(client);

      // 3. Fetch user's historical royalty transactions
      const txRes = await client.query(
        `SELECT 
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
         WHERE user_id = $1 AND (type = 'ROYALTY_INCOME' OR description ILIKE '%royalty%')
         ORDER BY created_at DESC;`,
        [user.id]
      );

      let totalGross = 0;
      const records = txRes.rows.map((row, idx) => {
        const gross = Number(row.amount || 0);
        totalGross += gross;
        const tds = Math.round(gross * 0.02 * 100) / 100;
        const admin = Math.round(gross * 0.08 * 100) / 100;
        const rp = Math.round(gross * 0.05 * 100) / 100;
        const net = Math.round((gross - tds - admin - rp) * 100) / 100;

        return {
          id: row.id,
          srNo: idx + 1,
          date: row.date || (row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()),
          grossAmount: gross,
          tdsAmount: tds,
          adminCharge: admin,
          rpWalletAmount: rp,
          netAmount: net,
          description: row.description || "Monthly Royalty Income Distribution",
          status: row.status || "COMPLETED",
        };
      });

      return NextResponse.json({
        success: true,
        qualification,
        poolSummary,
        summary: {
          totalGross,
          totalRecords: records.length,
        },
        records,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error fetching royalty data:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
