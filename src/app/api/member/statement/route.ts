import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, findUserByIdentifier } from "@/lib/db";
import { getWeeklyPeriods, syncAndGetWeeklyPayouts } from "@/lib/payouts";

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

    // Sync current week to ensure latest matching is captured in payouts table
    const weeks = getWeeklyPeriods(8);
    for (const w of weeks.slice(0, 3)) {
      await syncAndGetWeeklyPayouts(w);
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `
        SELECT 
          id,
          week_identifier,
          week_start_date,
          week_end_date,
          week_label,
          gross_amount,
          tds_amount,
          admin_charge,
          rp_wallet_deduction,
          net_amount,
          bank_name,
          bank_account_number,
          ifsc_code,
          upi_id,
          status,
          paid_at,
          transaction_reference,
          notes,
          created_at
        FROM payouts
        WHERE user_id = $1 OR UPPER(member_id) = UPPER($2)
        ORDER BY week_start_date DESC
      `,
        [user.id, user.memberId]
      );

      let totalPaid = 0;
      let totalPending = 0;
      let totalGross = 0;
      let totalTds = 0;
      let totalAdmin = 0;

      const statements = res.rows.map((r, idx) => {
        const gross = parseFloat(r.gross_amount || "0");
        const tds = parseFloat(r.tds_amount || "0");
        const admin = parseFloat(r.admin_charge || "0");
        const net = parseFloat(r.net_amount || "0");
        const isPaid = r.status === "PAID";

        totalGross += gross;
        totalTds += tds;
        totalAdmin += admin;

        if (isPaid) {
          totalPaid += net;
        } else {
          totalPending += net;
        }

        return {
          id: r.id,
          srNo: idx + 1,
          weekIdentifier: r.week_identifier,
          weekStartDate: r.week_start_date,
          weekEndDate: r.week_end_date,
          weekLabel: r.week_label,
          grossAmount: gross,
          tdsAmount: tds,
          adminCharge: admin,
          netAmount: net,
          bankName: r.bank_name || "",
          bankAccountNumber: r.bank_account_number || "",
          ifscCode: r.ifsc_code || "",
          upiId: r.upi_id || "",
          status: r.status || "PENDING",
          paidAt: r.paid_at,
          transactionReference: r.transaction_reference || "",
          notes: r.notes || "",
        };
      });

      return NextResponse.json({
        success: true,
        summary: {
          totalPaid: Math.round(totalPaid * 100) / 100,
          totalPending: Math.round(totalPending * 100) / 100,
          totalGross: Math.round(totalGross * 100) / 100,
          totalTds: Math.round(totalTds * 100) / 100,
          totalAdmin: Math.round(totalAdmin * 100) / 100,
          statementCount: statements.length,
        },
        statements,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Member statement error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch statement records" },
      { status: 500 }
    );
  }
}
