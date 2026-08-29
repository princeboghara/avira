import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword, confirmPassword } = await req.json();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, member_id, password_hash FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1`,
        [session.memberId]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      const user = res.rows[0];
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password" },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);

      await client.query(
        `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [newHash, user.id]
      );

      return NextResponse.json({
        success: true,
        message: "Password changed successfully!",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error changing password:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
