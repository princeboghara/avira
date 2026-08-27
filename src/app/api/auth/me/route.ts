import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserByMemberId, getTransactionsForUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !session.memberId) {
      return NextResponse.json(
        { success: false, message: "No active session found. Please log in." },
        { status: 401 }
      );
    }

    const user = await findUserByMemberId(session.memberId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member session expired or account not found" },
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
