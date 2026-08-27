import { NextRequest, NextResponse } from "next/server";
import { findUserByIdentifier } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawId = id?.trim();

  if (!rawId) {
    return NextResponse.json(
      { success: false, exists: false, message: "Member ID is required" },
      { status: 400 }
    );
  }

  const user = await findUserByIdentifier(rawId.toUpperCase());

  if (!user) {
    return NextResponse.json({
      success: false,
      exists: false,
      memberId: rawId.toUpperCase(),
      message: "Member ID not found in Avira network",
    });
  }

  const fullAddress = [
    user.address,
    user.city,
    user.state ? `${user.state}${user.pincode ? ` - ${user.pincode}` : ""}` : user.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const userData = {
    id: user.id,
    memberId: user.memberId,
    fullName: user.fullName,
    mobile: user.mobile,
    address: user.address || fullAddress,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    status: user.status,
  };

  return NextResponse.json({
    success: true,
    exists: true,
    memberId: user.memberId,
    fullName: user.fullName,
    mobile: user.mobile,
    address: user.address || fullAddress,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    status: user.status,
    user: userData,
  });
}
