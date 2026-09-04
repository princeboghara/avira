import { NextRequest, NextResponse } from "next/server";
import { pool, mapRowToOrder } from "@/lib/db";
import { requireShoppySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireShoppySession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const shoppyId = auth.session.memberId;
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    let query = `
      SELECT 
        o.*,
        u.member_id,
        u.full_name,
        u.mobile,
        b.member_id as buyer_member_id,
        b.full_name as buyer_name,
        b.mobile as buyer_mobile,
        b.address as buyer_address,
        b.city as buyer_city,
        b.state as buyer_state,
        b.pincode as buyer_pincode,
        s.store_name as shoppy_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
      LEFT JOIN shoppies s ON UPPER(o.shoppy_id) = UPPER(s.shoppy_id)
      WHERE UPPER(o.shoppy_id) = UPPER($1)
    `;

    const queryParams: (string | number)[] = [shoppyId.trim()];

    if (statusParam && statusParam !== "ALL") {
      if (statusParam === "CONFIRMED") {
        queryParams.push("CONFIRMED", "APPROVED");
        query += ` AND o.status IN ($2, $3)`;
      } else if (statusParam === "PACKED") {
        queryParams.push("PACKED");
        query += ` AND o.status = $2`;
      } else if (statusParam === "DISPATCHED") {
        queryParams.push("DISPATCHED", "IN_TRANSIT");
        query += ` AND o.status IN ($2, $3)`;
      } else if (statusParam === "DELIVERED") {
        queryParams.push("DELIVERED");
        query += ` AND o.status = $2`;
      } else if (statusParam === "RETURNED") {
        queryParams.push("RETURNED", "RTO");
        query += ` AND o.status IN ($2, $3)`;
      } else {
        queryParams.push(statusParam);
        query += ` AND o.status = $${queryParams.length}`;
      }
    }

    query += ` ORDER BY o.created_at DESC LIMIT 300;`;

    const ordersRes = await client.query(query, queryParams);

    const summaryRes = await client.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status IN ('CONFIRMED', 'APPROVED') THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'PACKED' THEN 1 END) as packed_orders,
        COUNT(CASE WHEN status IN ('DISPATCHED', 'IN_TRANSIT') THEN 1 END) as dispatched_orders,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status IN ('RETURNED', 'RTO') THEN 1 END) as returned_orders,
        COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED', 'PENDING') THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED', 'PENDING') THEN pv ELSE 0 END), 0) as total_pv
      FROM orders
      WHERE UPPER(shoppy_id) = UPPER($1);`,
      [shoppyId.trim()]
    );

    const summary = summaryRes.rows[0] || {};
    const formattedOrders = ordersRes.rows.map(mapRowToOrder);

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      summary: {
        totalOrders: parseInt(summary.total_orders || "0", 10),
        confirmedOrders: parseInt(summary.confirmed_orders || "0", 10),
        packedOrders: parseInt(summary.packed_orders || "0", 10),
        dispatchedOrders: parseInt(summary.dispatched_orders || "0", 10),
        deliveredOrders: parseInt(summary.delivered_orders || "0", 10),
        returnedOrders: parseInt(summary.returned_orders || "0", 10),
        totalRevenue: parseFloat(summary.total_revenue || "0"),
        totalPv: parseFloat(summary.total_pv || "0"),
      },
    });
  } catch (error) {
    console.error("Shoppy orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch Shoppy orders" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
