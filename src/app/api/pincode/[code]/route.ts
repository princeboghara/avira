import { NextRequest, NextResponse } from "next/server";
import { lookupPincode } from "@/lib/pincode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const pincode = code?.trim();

  if (!pincode || pincode.length !== 6) {
    return NextResponse.json(
      { success: false, message: "Valid 6-digit pincode required" },
      { status: 400 }
    );
  }

  const result = await lookupPincode(pincode);

  if (!result.success) {
    return NextResponse.json(
      { success: false, message: "Could not auto-fetch address for this pincode" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
