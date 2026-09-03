import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getLeadershipPercentages, updateLeadershipPercentages } from "@/lib/settings";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const settings = await getLeadershipPercentages();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    console.error("Admin leadership settings GET error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch leadership settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { adminPassword } = body;
    const level1 = parseFloat(body.level1);
    const level2 = parseFloat(body.level2);

    if (!adminPassword || typeof adminPassword !== "string" || !adminPassword.trim()) {
      return NextResponse.json(
        { success: false, message: "Admin Password is required to unlock and save Leadership Bonus settings." },
        { status: 403 }
      );
    }

    // Verify admin password
    const client = await pool.connect();
    let isValidPass = false;
    try {
      const adminRes = await client.query(
        "SELECT password_hash FROM users WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1"
      );
      if (adminRes.rows.length > 0 && adminRes.rows[0].password_hash) {
        isValidPass = await bcrypt.compare(adminPassword.trim(), adminRes.rows[0].password_hash);
      }
      if (!isValidPass && process.env.ADMIN_PASSWORD) {
        isValidPass = adminPassword.trim() === process.env.ADMIN_PASSWORD;
      }
    } finally {
      client.release();
    }

    if (!isValidPass) {
      return NextResponse.json(
        { success: false, message: "Incorrect Admin Password. Access Denied." },
        { status: 401 }
      );
    }

    if (isNaN(level1) || level1 < 0 || level1 > 100) {
      return NextResponse.json(
        { success: false, message: "Level 1 percentage must be a valid number between 0% and 100%" },
        { status: 400 }
      );
    }

    if (isNaN(level2) || level2 < 0 || level2 > 100) {
      return NextResponse.json(
        { success: false, message: "Level 2 percentage must be a valid number between 0% and 100%" },
        { status: 400 }
      );
    }

    const updated = await updateLeadershipPercentages(level1, level2);

    return NextResponse.json({
      success: true,
      message: `Leadership Supporting Bonus percentages successfully updated to ${level1}% (Level 1) and ${level2}% (Level 2). Future matching payouts will use these updated percentages immediately!`,
      settings: updated,
    });
  } catch (err: any) {
    console.error("Admin leadership settings POST error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to update leadership settings" },
      { status: 500 }
    );
  }
}
