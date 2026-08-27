import { NextRequest, NextResponse } from "next/server";
import { requireMemberSession } from "@/lib/auth";
import { findUserByMemberId, getOrdersForUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await requireMemberSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const user = await findUserByMemberId(auth.session.memberId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member record not found" },
        { status: 404 }
      );
    }

    const orders = await getOrdersForUser(user.id, user.memberId);

    return NextResponse.json({
      success: true,
      orders,
      memberId: user.memberId,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}
