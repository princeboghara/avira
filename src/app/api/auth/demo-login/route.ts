import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { DUMMY_MEMBER, DUMMY_ADMIN } from "@/lib/dummyData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "member";

  if (role.toLowerCase() === "admin") {
    // Generate Admin JWT tokens
    const adminPayload = {
      userId: DUMMY_ADMIN.id,
      memberId: DUMMY_ADMIN.memberId,
      fullName: DUMMY_ADMIN.fullName,
      role: "ADMIN",
    };

    const accessToken = signAccessToken(adminPayload);
    const refreshToken = signRefreshToken(adminPayload);

    const redirectUrl = new URL("/admin/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);

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
  }

  // Default: Member Dummy Login (AV0001)
  const memberPayload = {
    userId: DUMMY_MEMBER.id,
    memberId: DUMMY_MEMBER.memberId,
    role: DUMMY_MEMBER.role,
    fullName: DUMMY_MEMBER.fullName,
  };

  const accessToken = signAccessToken(memberPayload);
  const refreshToken = signRefreshToken(memberPayload);

  const redirectUrl = new URL("/dashboard", request.url);
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

export async function POST(request: NextRequest) {
  let role = "member";
  try {
    const body = await request.json();
    if (body.role) role = body.role;
  } catch {
    // ignore
  }

  if (role.toLowerCase() === "admin") {
    const adminPayload = {
      userId: DUMMY_ADMIN.id,
      memberId: DUMMY_ADMIN.memberId,
      fullName: DUMMY_ADMIN.fullName,
      role: "ADMIN",
    };

    const accessToken = signAccessToken(adminPayload);
    const refreshToken = signRefreshToken(adminPayload);

    const response = NextResponse.json({
      success: true,
      message: "Admin demo session generated successfully",
      admin: DUMMY_ADMIN,
      token: accessToken,
      redirectUrl: "/admin/dashboard",
    });

    response.cookies.set("admin_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  }

  // Member Demo Session
  const memberPayload = {
    userId: DUMMY_MEMBER.id,
    memberId: DUMMY_MEMBER.memberId,
    role: DUMMY_MEMBER.role,
    fullName: DUMMY_MEMBER.fullName,
  };

  const accessToken = signAccessToken(memberPayload);
  const refreshToken = signRefreshToken(memberPayload);

  const response = NextResponse.json({
    success: true,
    message: "Member demo session generated successfully",
    user: DUMMY_MEMBER,
    token: accessToken,
    redirectUrl: "/dashboard",
  });

  response.cookies.set("avira_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
    sameSite: "lax",
  });

  response.cookies.set("avira_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return response;
}
