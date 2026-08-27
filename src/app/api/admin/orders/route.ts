import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    let query = `
      SELECT 
        o.id,
        o.user_id,
        o.purchase_type,
        o.package_name,
        o.amount,
        o.pv,
        o.items,
        o.status,
        o.created_at,
        o.billed_by,
        o.customer_name,
        o.customer_mobile,
        o.transaction_id,
        o.payment_slip,
        o.shipping_address,
        o.rejection_reason,
        u.member_id,
        u.full_name,
        u.mobile
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;

    const queryParams: any[] = [];
    if (statusParam && statusParam !== "ALL") {
      queryParams.push(statusParam);
      query += ` WHERE o.status = $1`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT 500;`;

    const ordersRes = await client.query(query, queryParams);

    const summaryRes = await client.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status IN ('PENDING', 'PENDING_APPROVAL') THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_orders,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_orders,
        COALESCE(SUM(CASE WHEN status IN ('APPROVED', 'COMPLETED') THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('APPROVED', 'COMPLETED') THEN pv ELSE 0 END), 0) as total_pv
      FROM orders;
    `);

    const summary = summaryRes.rows[0] || {};

    const formattedOrders = ordersRes.rows.map((row) => {
      let parsedItems = [];
      if (row.items) {
        try {
          parsedItems =
            typeof row.items === "string" ? JSON.parse(row.items) : row.items;
        } catch {
          parsedItems = [];
        }
      }

      // Standardize status: PENDING_APPROVAL -> PENDING
      let currentStatus = row.status || "PENDING";
      if (currentStatus === "PENDING_APPROVAL") currentStatus = "PENDING";

      return {
        id: row.id,
        userId: row.user_id,
        billedBy: row.billed_by || row.member_id || "N/A",
        memberId: row.member_id || "N/A",
        fullName: row.customer_name || row.full_name || "Customer",
        mobile: row.customer_mobile || row.mobile || "",
        transactionId: row.transaction_id || "",
        paymentSlip: row.payment_slip || "",
        shippingAddress: row.shipping_address || "",
        rejectionReason: row.rejection_reason || "",
        purchaseType: row.purchase_type,
        packageName: row.package_name,
        amount: parseFloat(row.amount || "0"),
        pv: parseFloat(row.pv || "0"),
        items: parsedItems,
        status: currentStatus,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      summary: {
        totalOrders: parseInt(summary.total_orders || "0", 10),
        pendingOrders: parseInt(summary.pending_orders || "0", 10),
        approvedOrders: parseInt(summary.approved_orders || "0", 10),
        completedOrders: parseInt(summary.completed_orders || "0", 10),
        rejectedOrders: parseInt(summary.rejected_orders || "0", 10),
        totalRevenue: parseFloat(summary.total_revenue || "0"),
        totalPv: parseFloat(summary.total_pv || "0"),
      },
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin orders" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
