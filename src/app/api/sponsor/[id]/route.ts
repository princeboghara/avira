import { NextRequest, NextResponse } from "next/server";
import { findUserByMemberId } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sponsorId = id?.toUpperCase().trim();

  if (!sponsorId) {
    return NextResponse.json(
      { exists: false, message: "Sponsor ID is required" },
      { status: 400 }
    );
  }

  const sponsor = await findUserByMemberId(sponsorId);

  if (!sponsor) {
    return NextResponse.json({
      exists: false,
      memberId: sponsorId,
      message: "Sponsor ID not found in Avira network",
    });
  }

  return NextResponse.json({
    exists: true,
    memberId: sponsor.memberId,
    fullName: sponsor.fullName,
    status: sponsor.status,
    personalPv: sponsor.personalPv,
    dailyCapping: sponsor.dailyCapping,
  });
}
