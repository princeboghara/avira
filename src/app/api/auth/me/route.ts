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

    let user = null;
    try {
      user = await findUserByMemberId(session.memberId);
    } catch {
      user = null;
    }

    if (!user) {
      // In preview/demo mode fallback to DUMMY_MEMBER
      user = {
        id: session.userId || "usr_dummy_001",
        memberId: session.memberId || "AV0001",
        fullName: session.fullName || "Demo Associate",
        mobile: "9876543210",
        sponsorId: "AV0000",
        sponsorName: "Avira Global",
        pincode: "395006",
        city: "Surat",
        state: "Gujarat",
        address: "Avira Corporate Hub, Ring Road, Surat",
        role: "MEMBER" as const,
        status: "ACTIVE" as const,
        walletBalance: 18500,
        rpWallet: 2450,
        fundWallet: 5000,
        totalEarnings: 74200,
        directReferralsCount: 14,
        totalTeamCount: 52,
        todayEarnings: 2500,
        joinedDate: "2025-01-15",
        activationDate: "2025-01-15",
        personalPv: 100,
        leftPv: 2400,
        rightPv: 1800,
        carryLeftPv: 600,
        carryRightPv: 0,
        dailyCapping: 1000,
        email: "demo@aviracare.com",
        panNumber: "ABCDE1234F",
        aadhaarNumber: "123456789012",
        bankName: "HDFC Bank",
        bankAccountNumber: "50200012345678",
        ifscCode: "HDFC0001234",
        upiId: "demo@okhdfcbank",
        kycStatus: "VERIFIED" as const,
        aadhaarStatus: "VERIFIED" as const,
        panStatus: "VERIFIED" as const,
        bankStatus: "VERIFIED" as const,
      };
    }

    const includeTx = request.nextUrl.searchParams.get("tx") === "true";
    let transactions: any[] = [];
    if (includeTx) {
      try {
        transactions = await getTransactionsForUser(user.id);
      } catch {
        transactions = [];
      }
    }
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
