import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { pool, mapRowToUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get("admin_access_token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "No admin session found" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(adminToken);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin session" },
        { status: 403 }
      );
    }

    // Lookup admin in database
    const client = await pool.connect();
    let adminRecord: any = null;

    try {
      if (payload.memberId && payload.memberId !== "ADMIN") {
        const res = await client.query(
          "SELECT * FROM v_users_full WHERE UPPER(member_id) = UPPER($1) LIMIT 1",
          [payload.memberId]
        );
        if (res.rows.length > 0) adminRecord = res.rows[0];
      }

      if (!adminRecord) {
        const res = await client.query(
          "SELECT * FROM v_users_full WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1"
        );
        if (res.rows.length > 0) adminRecord = res.rows[0];
      }
    } finally {
      client.release();
    }

    const user = adminRecord ? mapRowToUser(adminRecord) : null;

    const safeUser = {
      id: user?.id || payload.userId || "admin_master_root",
      memberId: user?.memberId || payload.memberId || "ADMIN",
      fullName: user?.fullName || payload.fullName || "Avira Central Administrator",
      mobile: user?.mobile || "9712326273",
      role: "ADMIN",
      status: "ACTIVE",
      walletBalance: user?.walletBalance || 0,
      joinedDate: user?.joinedDate || new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({
      success: true,
      admin: safeUser,
    });
  } catch (error) {
    console.error("Admin auth me error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify admin session" },
      { status: 500 }
    );
  }
}
