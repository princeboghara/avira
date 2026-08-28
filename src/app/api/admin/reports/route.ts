import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "today"; // today | week | month | custom
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  let dateCondition = "created_at >= CURRENT_DATE";
  let txDateCondition = "t.created_at >= CURRENT_DATE";

  if (range === "today") {
    dateCondition = "created_at >= CURRENT_DATE";
    txDateCondition = "t.created_at >= CURRENT_DATE";
  } else if (range === "week") {
    dateCondition = "created_at >= (CURRENT_DATE - INTERVAL '7 days')";
    txDateCondition = "t.created_at >= (CURRENT_DATE - INTERVAL '7 days')";
  } else if (range === "month") {
    dateCondition = "created_at >= (CURRENT_DATE - INTERVAL '30 days')";
    txDateCondition = "t.created_at >= (CURRENT_DATE - INTERVAL '30 days')";
  } else if (range === "custom" && fromDate && toDate) {
    dateCondition = `created_at >= '${fromDate} 00:00:00' AND created_at <= '${toDate} 23:59:59'`;
    txDateCondition = `t.created_at >= '${fromDate} 00:00:00' AND t.created_at <= '${toDate} 23:59:59'`;
  }

  const client = await pool.connect();
  try {
    // 1. Order Summary for selected range
    const ordersRes = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(pv), 0) as total_pv,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'PACKED' THEN 1 END) as packed_orders,
        COUNT(CASE WHEN status = 'DISPATCHED' THEN 1 END) as dispatched_orders
      FROM orders
      WHERE ${dateCondition};
    `);

    // 2. New Members for selected range
    const membersRes = await client.query(`
      SELECT 
        COUNT(*) as new_members_count,
        COUNT(CASE WHEN status = 'ACTIVE' OR personal_pv >= 100 THEN 1 END) as active_new_members
      FROM v_users_full
      WHERE ${dateCondition};
    `);

    // 3. Commissions Distributed in selected range
    const commissionRes = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_commissions_distributed,
        COUNT(*) as commission_payouts_count
      FROM transactions t
      WHERE ${txDateCondition};
    `);

    // 4. Detailed Orders List
    const ordersListRes = await client.query(`
      SELECT 
        o.id,
        o.user_id,
        o.amount,
        o.pv,
        o.status,
        o.created_at,
        o.customer_name,
        o.customer_mobile,
        u.member_id,
        u.full_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE ${dateCondition.replace(/created_at/g, "o.created_at")}
      ORDER BY o.created_at DESC
      LIMIT 100;
    `);

    // 5. Detailed New Joinings List
    const membersListRes = await client.query(`
      SELECT 
        id,
        member_id,
        full_name,
        mobile,
        personal_pv,
        status,
        created_at,
        sponsor_id
      FROM v_users_full
      WHERE ${dateCondition}
      ORDER BY created_at DESC
      LIMIT 100;
    `);

    const ordSummary = ordersRes.rows[0] || {};
    const memSummary = membersRes.rows[0] || {};
    const comSummary = commissionRes.rows[0] || {};

    return NextResponse.json({
      success: true,
      range,
      summary: {
        totalRevenue: parseFloat(ordSummary.total_revenue || "0"),
        totalPv: parseFloat(ordSummary.total_pv || "0"),
        totalOrders: parseInt(ordSummary.total_orders || "0", 10),
        pendingOrders: parseInt(ordSummary.pending_orders || "0", 10),
        confirmedOrders: parseInt(ordSummary.confirmed_orders || "0", 10),
        packedOrders: parseInt(ordSummary.packed_orders || "0", 10),
        dispatchedOrders: parseInt(ordSummary.dispatched_orders || "0", 10),
        newMembers: parseInt(memSummary.new_members_count || "0", 10),
        activeNewMembers: parseInt(memSummary.active_new_members || "0", 10),
        totalCommissionsDistributed: parseFloat(comSummary.total_commissions_distributed || "0"),
        commissionPayoutsCount: parseInt(comSummary.commission_payouts_count || "0", 10),
      },
      orders: ordersListRes.rows,
      members: membersListRes.rows,
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate business report" }, { status: 500 });
  } finally {
    client.release();
  }
}
