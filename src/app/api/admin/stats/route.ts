import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    // 1. Total Members & Status Counts
    const membersRes = await client.query(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'BLOCKED' THEN 1 END) as blocked_count,
        COALESCE(SUM(wallet_balance), 0) as total_wallet_balance,
        COALESCE(SUM(total_earnings), 0) as total_earnings_distributed
      FROM users;
    `);

    // 2. Total Transactions Count & Total Payout Amount
    const txRes = await client.query(`
      SELECT 
        COUNT(*) as total_tx_count,
        COALESCE(SUM(amount), 0) as total_tx_volume
      FROM transactions;
    `);

    // 3. Recent 5 Transactions across the network
    const recentTxRes = await client.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.description,
        t.status,
        t.date,
        u.member_id,
        u.full_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 6;
    `);

    const stats = membersRes.rows[0];
    const txStats = txRes.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        totalMembers: parseInt(stats.total_count || "0", 10),
        activeMembers: parseInt(stats.active_count || "0", 10),
        blockedMembers: parseInt(stats.blocked_count || "0", 10),
        totalWalletLiability: parseFloat(stats.total_wallet_balance || "0"),
        totalEarningsDistributed: parseFloat(stats.total_earnings_distributed || "0"),
        totalTransactionsCount: parseInt(txStats.total_tx_count || "0", 10),
        totalVolume: parseFloat(txStats.total_tx_volume || "0"),
        recentTransactions: recentTxRes.rows,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch live admin stats from Supabase" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
