import { NextRequest, NextResponse } from "next/server";
import { requireShoppySession } from "@/lib/auth";
import { findShoppyByIdentifier, pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireShoppySession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const shoppy = await findShoppyByIdentifier(auth.session.memberId);
  if (!shoppy) {
    return NextResponse.json(
      { success: false, message: "Shoppy record not found" },
      { status: 404 }
    );
  }

  // Fetch quick metrics for this shoppy
  const client = await pool.connect();
  try {
    const countsRes = await client.query(
      `SELECT 
        COUNT(CASE WHEN status IN ('CONFIRMED', 'APPROVED') THEN 1 END) as assigned_orders,
        COUNT(CASE WHEN status = 'PACKED' THEN 1 END) as packing_orders,
        COUNT(CASE WHEN status IN ('DISPATCHED', 'IN_TRANSIT') THEN 1 END) as dispatched_orders,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status IN ('RETURNED', 'RTO') THEN 1 END) as returned_orders,
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED', 'PENDING') THEN amount ELSE 0 END), 0) as total_volume
       FROM orders
       WHERE UPPER(shoppy_id) = UPPER($1)`,
      [shoppy.shoppyId]
    );

    const counts = countsRes.rows[0] || {};

    return NextResponse.json({
      success: true,
      shoppy: {
        id: shoppy.id,
        shoppyId: shoppy.shoppyId,
        storeName: shoppy.storeName,
        ownerName: shoppy.ownerName,
        mobile: shoppy.mobile,
        email: shoppy.email,
        address: shoppy.address,
        city: shoppy.city,
        state: shoppy.state,
        pincode: shoppy.pincode,
        status: shoppy.status,
      },
      stats: {
        assignedOrders: parseInt(counts.assigned_orders || "0", 10),
        packingOrders: parseInt(counts.packing_orders || "0", 10),
        dispatchedOrders: parseInt(counts.dispatched_orders || "0", 10),
        deliveredOrders: parseInt(counts.delivered_orders || "0", 10),
        returnedOrders: parseInt(counts.returned_orders || "0", 10),
        totalOrders: parseInt(counts.total_orders || "0", 10),
        totalVolume: parseFloat(counts.total_volume || "0"),
      },
    });
  } catch (error) {
    console.error("Shoppy me error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch Shoppy profile" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
