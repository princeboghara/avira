import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { status, customerName, customerMobile, amount, pv, shoppyId } = body;

    let query = "UPDATE orders SET ";
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (customerName !== undefined) {
      updates.push(`customer_name = $${idx++}`);
      values.push(customerName);
    }
    if (customerMobile !== undefined) {
      updates.push(`customer_mobile = $${idx++}`);
      values.push(customerMobile);
    }
    if (amount !== undefined) {
      updates.push(`amount = $${idx++}`);
      values.push(amount);
    }
    if (pv !== undefined) {
      updates.push(`pv = $${idx++}`);
      values.push(pv);
    }
    if (shoppyId !== undefined) {
      updates.push(`shoppy_id = $${idx++}`);
      values.push(shoppyId);
      updates.push(`shoppy_transferred_at = NOW()`);
    } else if (status === "CONFIRMED") {
      updates.push(`shoppy_id = COALESCE(shoppy_id, 'AVS01')`);
      updates.push(`shoppy_transferred_at = COALESCE(shoppy_transferred_at, NOW())`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    query += updates.join(", ") + ` WHERE id = $${idx++};`;
    values.push(id);

    await client.query(query, values);

    return NextResponse.json({
      success: true,
      message: `Order #${id} updated successfully.`,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();

  try {
    await client.query("DELETE FROM orders WHERE id = $1;", [id]);

    return NextResponse.json({
      success: true,
      message: `Order #${id} deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
