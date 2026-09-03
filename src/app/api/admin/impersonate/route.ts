import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { findUserByMemberId } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ success: false, message: "Member ID is required" }, { status: 400 });
  }

  const user = await findUserByMemberId(memberId.toUpperCase().trim());
  if (!user) {
    return NextResponse.json({ success: false, message: `Member ${memberId} not found` }, { status: 404 });
  }

  const tokenPayload = {
    userId: user.id,
    memberId: user.memberId,
    role: user.role,
    fullName: user.fullName,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  const redirectUrl = new URL("/dashboard", req.url);
  const response = NextResponse.redirect(redirectUrl);

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
}
