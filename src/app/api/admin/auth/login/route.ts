import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const adminLoginSchema = z.object({
  password: z.string().min(1, "Master Password is required"),
  loginIdentifier: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = adminLoginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { password, loginIdentifier } = result.data;
    const trimmedPass = password.trim();

    // 1. Direct Master Admin Verification with Password 123123
    const isMasterPassword = trimmedPass === "123123";

    const client = await pool.connect();
    let adminRecord: any = null;

    try {
      if (loginIdentifier && loginIdentifier.trim()) {
        const res = await client.query(
          "SELECT id, member_id, full_name, mobile, role, status, password_hash FROM users WHERE (UPPER(member_id) = UPPER($1) OR mobile = $1) LIMIT 1",
          [loginIdentifier.trim()]
        );
        if (res.rows.length > 0) {
          adminRecord = res.rows[0];
        }
      }

      if (!adminRecord) {
        // Find existing administrator or use master admin identity
        const res = await client.query(
          "SELECT id, member_id, full_name, mobile, role, status, password_hash FROM users WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1"
        );
        if (res.rows.length > 0) {
          adminRecord = res.rows[0];
        }
      }
    } finally {
      client.release();
    }

    // 2. Validate Password: Check either Master 123123 or bcrypt hash
    let isValid = isMasterPassword;

    if (!isValid && adminRecord?.password_hash) {
      isValid = await bcrypt.compare(trimmedPass, adminRecord.password_hash);
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid Administrator Password. Access Denied." },
        { status: 401 }
      );
    }

    // Admin Session Identity (Independent of AV00001 member)
    const adminId = adminRecord?.id || "admin_master_root";
    const adminMemberId = "ADMIN";
    const adminName = adminRecord?.full_name || "Avira Enterprise Administrator";
    const adminMobile = adminRecord?.mobile || "9999999999";

    // Generate JWT tokens with ADMIN scope
    const accessToken = signAccessToken({
      userId: adminId,
      memberId: adminMemberId,
      fullName: adminName,
      role: "ADMIN",
    });

    const refreshToken = signRefreshToken({
      userId: adminId,
      memberId: adminMemberId,
      fullName: adminName,
      role: "ADMIN",
    });

    const safeUser = {
      id: adminId,
      memberId: adminMemberId,
      fullName: adminName,
      mobile: adminMobile,
      role: "ADMIN",
      status: "ACTIVE",
    };

    const response = NextResponse.json({
      success: true,
      message: `Welcome, Administrator (${adminName})`,
      admin: safeUser,
      token: accessToken,
    });

    // Set dedicated Admin HTTP-Only cookies
    response.cookies.set("admin_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error occurred during admin authentication" },
      { status: 500 }
    );
  }
}
