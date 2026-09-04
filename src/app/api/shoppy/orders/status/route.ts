import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireShoppySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireShoppySession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const shoppyId = auth.session.memberId;
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { orderIds, status, courierName, trackingNumber, returnReason, rejectionReason } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one order" },
        { status: 400 }
      );
    }

    const validStatuses = ["PACKED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "RETURNED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status: "${status}"` },
        { status: 400 }
      );
    }

    // Build update query ensuring orders belong to this shoppy
    let updateQuery = `UPDATE orders SET status = $1`;
    const queryParams: unknown[] = [status];

    if (status === "DISPATCHED") {
      updateQuery += `, courier_name = $2, tracking_number = $3, dispatched_at = NOW()`;
      queryParams.push(courierName || "Direct / Local Delivery", trackingNumber || "");
      updateQuery += ` WHERE id = ANY($4::text[]) AND UPPER(shoppy_id) = UPPER($5) RETURNING id`;
      queryParams.push(orderIds, shoppyId);
    } else if (status === "RETURNED") {
      const reason = (returnReason || rejectionReason || "Returned to Hub / Delivery Failed").trim();
      updateQuery += `, rejection_reason = $2`;
      queryParams.push(reason);
      updateQuery += ` WHERE id = ANY($3::text[]) AND UPPER(shoppy_id) = UPPER($4) RETURNING id`;
      queryParams.push(orderIds, shoppyId);
    } else {
      updateQuery += ` WHERE id = ANY($2::text[]) AND UPPER(shoppy_id) = UPPER($3) RETURNING id`;
      queryParams.push(orderIds, shoppyId);
    }

    const result = await client.query(updateQuery, queryParams);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.rowCount} order(s) to ${status}.`,
      updatedCount: result.rowCount,
      status,
    });
  } catch (error) {
    console.error("Shoppy order status update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
