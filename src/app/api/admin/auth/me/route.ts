import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { findUserByMemberId } from "@/lib/db";

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

    const user = await findUserByMemberId(payload.memberId);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin account not found or revoked" },
        { status: 403 }
      );
    }

    const safeUser = {
      id: user.id,
      memberId: user.memberId,
      fullName: user.fullName,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      walletBalance: user.walletBalance,
      joinedDate: user.joinedDate,
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
