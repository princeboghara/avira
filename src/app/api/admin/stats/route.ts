import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    // 1. Pending Counts (Orders & KYC)
    const pendingRes = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pending_orders,
        (SELECT COUNT(*) FROM user_kyc WHERE kyc_status = 'PENDING' OR aadhaar_status = 'PENDING' OR pan_status = 'PENDING' OR bank_status = 'PENDING') as pending_kyc;
    `);

    // 2. Today's Metrics
    const todayRes = await client.query(`
      SELECT 
        COALESCE((SELECT SUM(amount) FROM orders WHERE status != 'REJECTED' AND created_at >= CURRENT_DATE), 0) as today_revenue,
        COALESCE((SELECT SUM(pv) FROM orders WHERE status != 'REJECTED' AND created_at >= CURRENT_DATE), 0) as today_pv,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as today_new_members,
        (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE) as today_orders;
    `);

    // 3. Lifetime Total Metrics
    const lifetimeRes = await client.query(`
      SELECT 
        COALESCE((SELECT SUM(amount) FROM orders WHERE status != 'REJECTED'), 0) as total_revenue,
        COALESCE((SELECT SUM(pv) FROM orders WHERE status != 'REJECTED'), 0) as total_pv,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM users) as total_members,
        (SELECT COUNT(*) FROM v_users_full WHERE status = 'ACTIVE' OR personal_pv >= 100) as active_members,
        COALESCE((SELECT SUM(wallet_balance) FROM user_wallets), 0) as total_wallet_liability,
        COALESCE((SELECT SUM(total_earnings) FROM user_wallets), 0) as total_earnings_distributed;
    `);

    // 4. Recent Transactions for Live Stream
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

    const pending = pendingRes.rows[0] || {};
    const today = todayRes.rows[0] || {};
    const total = lifetimeRes.rows[0] || {};

    return NextResponse.json({
      success: true,
      data: {
        // Pending Alert Counters
        pendingOrders: parseInt(pending.pending_orders || "0", 10),
        pendingKyc: parseInt(pending.pending_kyc || "0", 10),

        // Today's Performance
        todayRevenue: parseFloat(today.today_revenue || "0"),
        todayPvRevenue: parseFloat(today.today_pv || "0"),
        todayNewMembers: parseInt(today.today_new_members || "0", 10),
        todayOrders: parseInt(today.today_orders || "0", 10),

        // Total Lifetime Performance
        totalRevenue: parseFloat(total.total_revenue || "0"),
        totalPvRevenue: parseFloat(total.total_pv || "0"),
        totalOrders: parseInt(total.total_orders || "0", 10),
        totalMembers: parseInt(total.total_members || "0", 10),
        activeMembers: parseInt(total.active_members || "0", 10),
        totalWalletLiability: parseFloat(total.total_wallet_liability || "0"),
        totalEarningsDistributed: parseFloat(total.total_earnings_distributed || "0"),

        // Stream
        recentTransactions: recentTxRes.rows,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch live admin statistics" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
