import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { orderIds, shoppyId } = body;

    const ids: string[] = Array.isArray(orderIds)
      ? orderIds.filter((id: unknown) => typeof id === "string" && id.trim() !== "")
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide at least one order ID to transfer." },
        { status: 400 }
      );
    }

    let targetShoppyId: string = "AVS01";
    let targetShoppyName = "SURAT PARCEL HUB";

    if (shoppyId && shoppyId !== "CENTRAL" && shoppyId !== "NONE") {
      const shoppyRes = await client.query(
        `SELECT shoppy_id, store_name FROM shoppies WHERE UPPER(shoppy_id) = UPPER($1) OR id = $1 LIMIT 1`,
        [shoppyId]
      );
      if (shoppyRes.rows.length > 0) {
        targetShoppyId = shoppyRes.rows[0].shoppy_id;
        targetShoppyName = shoppyRes.rows[0].store_name;
      } else {
        const defaultShoppyRes = await client.query(
          `SELECT shoppy_id, store_name FROM shoppies WHERE UPPER(shoppy_id) = 'AVS01' OR status = 'ACTIVE' ORDER BY created_at ASC LIMIT 1`
        );
        if (defaultShoppyRes.rows.length > 0) {
          targetShoppyId = defaultShoppyRes.rows[0].shoppy_id;
          targetShoppyName = defaultShoppyRes.rows[0].store_name;
        }
      }
    } else {
      // Default to primary hub if exists
      const defaultShoppyRes = await client.query(
        `SELECT shoppy_id, store_name FROM shoppies WHERE UPPER(shoppy_id) = 'AVS01' OR status = 'ACTIVE' ORDER BY created_at ASC LIMIT 1`
      );
      if (defaultShoppyRes.rows.length > 0) {
        targetShoppyId = defaultShoppyRes.rows[0].shoppy_id;
        targetShoppyName = defaultShoppyRes.rows[0].store_name;
      }
    }

    await client.query("BEGIN");

    const updateRes = await client.query(
      `UPDATE orders 
       SET status = 'CONFIRMED', 
           shoppy_id = $1, 
           shoppy_transferred_at = NOW() 
       WHERE id = ANY($2::text[])
       RETURNING id`,
      [targetShoppyId, ids]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${updateRes.rowCount} order(s) to ${targetShoppyName} (${targetShoppyId})!`,
      transferredCount: updateRes.rowCount,
      shoppyId: targetShoppyId,
      shoppyName: targetShoppyName,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Bulk transfer orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to transfer orders" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
