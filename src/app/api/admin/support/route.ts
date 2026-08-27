import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT 
          id,
          user_id,
          member_id,
          full_name,
          mobile,
          subject,
          category,
          message,
          status,
          admin_response,
          created_at,
          resolved_at
        FROM support_tickets
        ORDER BY 
          CASE WHEN status = 'OPEN' THEN 1 ELSE 2 END,
          created_at DESC
      `);

      return NextResponse.json({
        success: true,
        tickets: res.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          memberId: row.member_id,
          fullName: row.full_name,
          mobile: row.mobile,
          subject: row.subject,
          category: row.category,
          message: row.message,
          status: row.status,
          adminResponse: row.admin_response,
          createdAt: row.created_at,
          resolvedAt: row.resolved_at,
        })),
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error loading admin tickets:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { ticketId, adminResponse, status = "RESOLVED" } = await req.json();

    if (!ticketId || !adminResponse) {
      return NextResponse.json(
        { success: false, message: "Ticket ID and response message are required." },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `
        UPDATE support_tickets
        SET 
          admin_response = $1,
          status = $2,
          resolved_at = NOW()
        WHERE id = $3
        RETURNING id
      `,
        [adminResponse.trim(), status, ticketId]
      );

      if (res.rowCount === 0) {
        return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Response sent to associate successfully!",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error replying to ticket:", err);
    return NextResponse.json({ success: false, message: "Failed to update ticket" }, { status: 500 });
  }
}
