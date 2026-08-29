import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Rejected by administrator";

    await client.query("BEGIN");

    const orderRes = await client.query(
      `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const order = orderRes.rows[0];

    // Check if a Fund Wallet debit was recorded for this order
    const fundTxRes = await client.query(
      `SELECT * FROM transactions WHERE description ILIKE $1 AND type = 'FUND_DEBIT' LIMIT 1`,
      [`%Order #${id}%`]
    );

    if (fundTxRes.rows.length > 0) {
      const fundTx = fundTxRes.rows[0];
      const refundAmount = parseFloat(fundTx.amount || "0");

      if (refundAmount > 0) {
        // Restore fund wallet
        await client.query(
          `UPDATE user_wallets SET fund_wallet = fund_wallet + $1, updated_at = NOW() WHERE user_id = $2`,
          [refundAmount, fundTx.user_id]
        );

        // Record refund audit transaction
        const refundTxId = `txn_fund_ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
        await client.query(
          `INSERT INTO transactions (
            id, user_id, type, amount, tds_amount, admin_charge, rp_wallet_amount, net_amount, description, status, date, created_at
          ) VALUES ($1, $2, 'FUND_CREDIT', $3, 0, 0, 0, $3, $4, 'COMPLETED', $5, NOW())`,
          [
            refundTxId,
            fundTx.user_id,
            refundAmount,
            `Fund Wallet Refund for Rejected Order #${id}`,
            dateStr,
          ]
        );
      }
    }

    await client.query(
      `UPDATE orders SET status = 'REJECTED', rejection_reason = $2 WHERE id = $1`,
      [id, reason]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Order #${id} marked as rejected. Any used Fund Wallet balance has been refunded.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order rejection error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
