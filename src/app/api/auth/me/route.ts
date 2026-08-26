import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { findUserByMemberId, getTransactionsForUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Check Bearer Authorization header or cookie
    let token = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const cookieToken = request.cookies.get("avira_access_token");
      if (cookieToken) {
        token = cookieToken.value;
      }
    }

    // Support dev demo query for instant visualization if no token
    const url = new URL(request.url);
    const demoMemberId = url.searchParams.get("demoId");

    let memberIdToFetch = "";

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        memberIdToFetch = payload.memberId;
      }
    }

    if (!memberIdToFetch && demoMemberId) {
      memberIdToFetch = demoMemberId;
    }

    // Default fallback to demo member AV23900 if unauthenticated for quick preview
    if (!memberIdToFetch) {
      memberIdToFetch = "AV23900";
    }

    const user = await findUserByMemberId(memberIdToFetch);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member session expired or not found" },
        { status: 401 }
      );
    }

    const transactions = await getTransactionsForUser(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      transactions,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
