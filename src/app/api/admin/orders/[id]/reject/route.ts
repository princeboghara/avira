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
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Rejected by administrator";

    await client.query(
      `UPDATE orders SET status = 'REJECTED', rejection_reason = $2 WHERE id = $1`,
      [id, reason]
    );

    return NextResponse.json({
      success: true,
      message: `Order #${id} marked as rejected.`,
    });
  } catch (error) {
    console.error("Order rejection error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
