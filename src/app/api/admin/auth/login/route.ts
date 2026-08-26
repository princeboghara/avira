import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByMemberId, pool } from "@/lib/db";
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

    const { password } = result.data;

    // Direct Master Admin Password check or root account AV00001 check
    let user = await findUserByMemberId("AV00001");

    if (!user) {
      // Fallback: lookup any user with role = 'ADMIN'
      const client = await pool.connect();
      try {
        const res = await client.query(
          "SELECT member_id FROM users WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1"
        );
        if (res.rows.length > 0) {
          user = await findUserByMemberId(res.rows[0].member_id);
        }
      } finally {
        client.release();
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No Master Administrator account found in system." },
        { status: 404 }
      );
    }

    // Verify Master Password: either matches "admin123" directly or bcrypt matches hash
    const isMasterMatch =
      password === "admin123" || (user.passwordHash && bcrypt.compareSync(password, user.passwordHash));

    if (!isMasterMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect Master Administrator Password." },
        { status: 401 }
      );
    }

    // Generate JWT tokens with ADMIN scope
    const accessToken = signAccessToken({
      userId: user.id,
      memberId: user.memberId,
      fullName: user.fullName,
      role: "ADMIN",
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      memberId: user.memberId,
      fullName: user.fullName,
      role: "ADMIN",
    });

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

    const response = NextResponse.json({
      success: true,
      message: `Welcome, Master Administrator (${user.fullName})`,
      user: safeUser,
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
