import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, findUserByIdentifier } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByIdentifier(session.memberId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `
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
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
        [user.id]
      );

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
    console.error("Error fetching tickets:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByIdentifier(session.memberId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { subject, category, message } = await req.json();

    if (!subject || !category || !message) {
      return NextResponse.json(
        { success: false, message: "Subject, category, and message are required." },
        { status: 400 }
      );
    }

    const ticketId = `TKT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const client = await pool.connect();
    try {
      await client.query(
        `
        INSERT INTO support_tickets (
          id,
          user_id,
          member_id,
          full_name,
          mobile,
          subject,
          category,
          message,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', NOW())
      `,
        [
          ticketId,
          user.id,
          user.memberId,
          user.fullName,
          user.mobile || "",
          subject.trim(),
          category.trim(),
          message.trim(),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Support ticket registered successfully.",
        ticketId,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error creating ticket:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
