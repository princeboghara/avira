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
        u.mobile,
        u.address as recipient_address,
        u.city as recipient_city,
        u.state as recipient_state,
        u.pincode as recipient_pincode,
        b.member_id as buyer_member_id,
        b.full_name as buyer_name,
        b.mobile as buyer_mobile,
        b.address as buyer_address,
        b.city as buyer_city,
        b.state as buyer_state,
        b.pincode as buyer_pincode
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
    `;

    const queryParams: (string | number)[] = [];
    if (statusParam && statusParam !== "ALL") {
      queryParams.push(statusParam);
      query += ` WHERE o.status = $1`;
    }

    const limitParam = searchParams.get("limit");
    if (limitParam && !isNaN(Number(limitParam))) {
      queryParams.push(Number(limitParam));
      query += ` ORDER BY o.created_at DESC LIMIT $${queryParams.length};`;
    } else {
      query += ` ORDER BY o.created_at DESC;`;
    }

    const ordersRes = await client.query(query, queryParams);

    const summaryRes = await client.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status IN ('PENDING', 'PENDING_APPROVAL') THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status IN ('CONFIRMED', 'APPROVED', 'COMPLETED') THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'PACKED' THEN 1 END) as packed_orders,
        COUNT(CASE WHEN status IN ('DISPATCHED', 'IN_TRANSIT') THEN 1 END) as dispatched_orders,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_orders,
        COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED', 'PENDING', 'PENDING_APPROVAL') THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED', 'PENDING', 'PENDING_APPROVAL') THEN pv ELSE 0 END), 0) as total_pv
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
        buyerName: row.buyer_name || row.billed_by || "Associate",
        buyerMobile: row.buyer_mobile || "",
        buyerAddress: row.buyer_address || [row.buyer_city, row.buyer_state, row.buyer_pincode ? `PIN: ${row.buyer_pincode}` : ""].filter(Boolean).join(", "),
        buyerCity: row.buyer_city || "",
        buyerState: row.buyer_state || "Gujarat",
        buyerPincode: row.buyer_pincode || "395010",
        memberId: row.member_id || "N/A",
        fullName: row.customer_name || row.full_name || "Customer",
        customerName: row.customer_name || row.full_name || "Customer",
        mobile: row.customer_mobile || row.mobile || "",
        customerMobile: row.customer_mobile || row.mobile || "",
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
        confirmedOrders: parseInt(summary.confirmed_orders || "0", 10),
        packedOrders: parseInt(summary.packed_orders || "0", 10),
        dispatchedOrders: parseInt(summary.dispatched_orders || "0", 10),
        deliveredOrders: parseInt(summary.delivered_orders || "0", 10),
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
