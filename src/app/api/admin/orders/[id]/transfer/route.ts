import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
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
    const body = await req.json();
    const { shoppyId } = body;

    let targetShoppyId: string | null = null;
    let targetShoppyName = "Central Warehouse (Admin)";

    if (shoppyId && shoppyId !== "CENTRAL" && shoppyId !== "NONE") {
      const shoppyRes = await client.query(
        `SELECT shoppy_id, store_name FROM shoppies WHERE UPPER(shoppy_id) = UPPER($1) OR id = $1 LIMIT 1`,
        [shoppyId]
      );
      if (shoppyRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Selected Shoppy not found" },
          { status: 404 }
        );
      }
      targetShoppyId = shoppyRes.rows[0].shoppy_id;
      targetShoppyName = shoppyRes.rows[0].store_name;
    }

    const updateRes = await client.query(
      `UPDATE orders 
       SET shoppy_id = $1, shoppy_transferred_at = NOW() 
       WHERE id = $2 
       RETURNING id`,
      [targetShoppyId, id]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order #${id} transferred to ${targetShoppyName} (${targetShoppyId || "CENTRAL"}) successfully!`,
      shoppyId: targetShoppyId,
      shoppyName: targetShoppyName,
    });
  } catch (error) {
    console.error("Transfer order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to transfer order to shoppy" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
