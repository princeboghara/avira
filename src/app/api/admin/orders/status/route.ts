import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { orderIds, status } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one order" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "DISPATCHED",
      "IN_TRANSIT",
      "DELIVERED",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status: "${status}"` },
        { status: 400 }
      );
    }

    const result = await client.query(
      `UPDATE orders SET status = $1 WHERE id = ANY($2::text[]) RETURNING id`,
      [status, orderIds]
    );

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.rowCount} order(s) to ${status}.`,
      updatedCount: result.rowCount,
      status,
    });
  } catch (error) {
    console.error("Bulk status update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
