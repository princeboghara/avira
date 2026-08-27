import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getWeeklyPeriods, syncAndGetWeeklyPayouts } from "@/lib/payouts";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const requestedWeek = searchParams.get("week");

    const weeks = getWeeklyPeriods(16);
    let selectedWeek = weeks[0];

    if (requestedWeek) {
      const found = weeks.find((w) => w.identifier === requestedWeek);
      if (found) selectedWeek = found;
    }

    const payouts = await syncAndGetWeeklyPayouts(selectedWeek);

    let totalGross = 0;
    let totalTds = 0;
    let totalAdmin = 0;
    let totalNet = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    for (const p of payouts) {
      totalGross += p.grossAmount;
      totalTds += p.tdsAmount;
      totalAdmin += p.adminCharge;
      totalNet += p.netAmount;
      if (p.status === "PAID") {
        totalPaid += p.netAmount;
        paidCount++;
      } else {
        totalPending += p.netAmount;
        pendingCount++;
      }
    }

    return NextResponse.json({
      success: true,
      weeks,
      selectedWeek,
      payouts,
      summary: {
        totalGross: Math.round(totalGross * 100) / 100,
        totalTds: Math.round(totalTds * 100) / 100,
        totalAdmin: Math.round(totalAdmin * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalPending: Math.round(totalPending * 100) / 100,
        totalMembers: payouts.length,
        paidCount,
        pendingCount,
      },
    });
  } catch (error) {
    console.error("Admin payouts GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load weekly payouts data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { payoutId, payoutIds, reference, notes } = body;

    const idsToProcess: string[] = [];
    if (Array.isArray(payoutIds) && payoutIds.length > 0) {
      idsToProcess.push(...payoutIds);
    } else if (payoutId) {
      idsToProcess.push(payoutId);
    }

    if (idsToProcess.length === 0) {
      return NextResponse.json(
        { success: false, message: "No payout ID provided for settlement" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    let updatedCount = 0;
    for (const id of idsToProcess) {
      const txRef = reference || `PAYOUT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await client.query(
        `
        UPDATE payouts
        SET status = 'PAID',
            paid_at = NOW(),
            transaction_reference = $1,
            notes = COALESCE($2, notes),
            updated_at = NOW()
        WHERE id = $3 AND status = 'PENDING'
        RETURNING user_id, member_id, net_amount, week_label;
      `,
        [txRef, notes || "Weekly payout approved and marked as paid by Admin", id]
      );

      if (res.rows.length > 0) {
        updatedCount++;
        const p = res.rows[0];

        // Also record a withdrawal transaction in transactions table
        const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
        await client.query(
          `
          INSERT INTO transactions (id, user_id, type, amount, description, status, date)
          VALUES ($1, $2, 'WITHDRAWAL_PAID', $3, $4, 'COMPLETED', $5);
        `,
          [
            `tx_wth_${Date.now()}_${p.member_id}`,
            p.user_id,
            p.net_amount,
            `Weekly Payout (${p.week_label}) Paid to Bank Account. Ref: ${txRef}`,
            dateStr,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Successfully processed payment for ${updatedCount} payout(s)!`,
      updatedCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin payouts update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark payout as paid" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export const PATCH = POST;
