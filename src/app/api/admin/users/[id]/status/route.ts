import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !["ACTIVE", "BLOCKED", "PENDING"].includes(status)) {
    return NextResponse.json(
      { success: false, message: "Invalid status value provided" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, member_id, status;",
      [status, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found in Supabase" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Member ${res.rows[0].member_id} status updated to ${status}`,
      user: res.rows[0],
    });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update member status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
