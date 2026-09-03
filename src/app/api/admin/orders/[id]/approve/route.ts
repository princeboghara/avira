import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { creditPurchasePV } from "@/lib/binary";
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
    await client.query("BEGIN");

    const orderRes = await client.query(
      `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderRes.rows[0];

    if (order.status !== "PENDING" && order.status !== "PENDING_APPROVAL") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: `Order is already ${order.status}` },
        { status: 400 }
      );
    }

    let shoppyId: string = "AVS01";
    try {
      const body = await req.json();
      if (body && body.shoppyId && body.shoppyId !== "CENTRAL" && body.shoppyId !== "NONE") {
        shoppyId = body.shoppyId.trim();
      }
    } catch {
      // Body may be empty if simple approve without body
    }

    // Update order status to CONFIRMED inside transaction and assign to SURAT PARCEL HUB (AVS01)
    await client.query(
      `UPDATE orders SET status = 'CONFIRMED', shoppy_id = $1, shoppy_transferred_at = NOW() WHERE id = $2`,
      [shoppyId, id]
    );

    let parsedItems = [];
    if (order.items) {
      try {
        parsedItems =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;
      } catch {
        parsedItems = [];
      }
    }

    // Credit PV to member and distribute binary volume up the tree (without duplicate order creation)
    await creditPurchasePV(
      order.user_id,
      parseFloat(order.pv || "0"),
      order.purchase_type,
      order.package_name,
      parseFloat(order.amount || "0"),
      parsedItems,
      true // skipOrderCreation = true prevents duplicate order record
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Order #${id} approved successfully! Status set to CONFIRMED and +${order.pv} PV credited to member.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order approval error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
