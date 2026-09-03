import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findShoppyByIdentifier } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Shoppy ID/Mobile and password are required" },
        { status: 400 }
      );
    }

    const shoppy = await findShoppyByIdentifier(identifier.trim());
    if (!shoppy) {
      return NextResponse.json(
        { success: false, message: "Invalid Shoppy credentials" },
        { status: 401 }
      );
    }

    if (shoppy.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "This Shoppy account is inactive or suspended. Please contact Admin." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, shoppy.passwordHash || "");
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid Shoppy credentials" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: shoppy.id,
      memberId: shoppy.shoppyId,
      role: "SHOPPY",
      fullName: shoppy.storeName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${shoppy.storeName}!`,
      shoppy: {
        id: shoppy.id,
        shoppyId: shoppy.shoppyId,
        storeName: shoppy.storeName,
        ownerName: shoppy.ownerName,
        mobile: shoppy.mobile,
        city: shoppy.city,
        state: shoppy.state,
      },
      token: accessToken,
    });

    response.cookies.set("shoppy_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: "lax",
    });

    response.cookies.set("shoppy_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Shoppy login error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during Shoppy login" },
      { status: 500 }
    );
  }
}
