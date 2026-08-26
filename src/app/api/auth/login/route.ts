import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByIdentifier } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const loginSchema = z.object({
  loginIdentifier: z.string().min(3, "Please enter Member ID (e.g. AV23900) or Mobile Number"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMsg = validatedData.error.issues[0]?.message || "Invalid login credentials";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { loginIdentifier, password } = validatedData.data;

    // Lookup user by Member ID or Mobile in Supabase PostgreSQL
    const user = await findUserByIdentifier(loginIdentifier);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this Member ID or Mobile Number." },
        { status: 401 }
      );
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        { success: false, message: "Your account is temporarily suspended. Please contact Avira support." },
        { status: 403 }
      );
    }

    // Verify Password
    const isPasswordValid = user.passwordHash
      ? bcrypt.compareSync(password, user.passwordHash)
      : false;

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please verify and try again." },
        { status: 401 }
      );
    }

    // Generate JWT Access & Refresh Tokens
    const tokenPayload = {
      userId: user.id,
      memberId: user.memberId,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Strip passwordHash
    const { passwordHash: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user: safeUser,
      token: accessToken,
      refreshToken,
    });

    response.cookies.set("avira_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
      sameSite: "lax",
    });

    response.cookies.set("avira_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during login." },
      { status: 500 }
    );
  }
}
