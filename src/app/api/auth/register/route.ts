import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByMobile, findUserByMemberId, saveUser } from "@/lib/db";
import { generateUniqueMemberId } from "@/lib/memberId";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { findAvailableBinarySpot } from "@/lib/binary";
import { User } from "@/types";

const registerSchema = z.object({
  sponsorId: z.string().min(3, "Sponsor ID is required"),
  parentId: z.string().optional(),
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  position: z.enum(["LEFT", "RIGHT"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMsg = validatedData.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { sponsorId, parentId, fullName, mobile, password, pincode, city, state, position } =
      validatedData.data;

    // 1. Check if mobile number is already registered to avoid unique constraint crash
    const existingMobileUser = await findUserByMobile(mobile.trim());
    if (existingMobileUser) {
      return NextResponse.json(
        { success: false, message: `Mobile number ${mobile} is already registered with an existing account. Please log in or use a different number.` },
        { status: 400 }
      );
    }

    // 2. Check if sponsor exists in database
    const sponsor = await findUserByMemberId(sponsorId);
    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: `Sponsor ID "${sponsorId}" does not exist in the Avira network.` },
        { status: 400 }
      );
    }

    // 3. Binary placement spot in chosen leg (LEFT or RIGHT)
    const targetLeg = position || "LEFT";
    let binarySpot: { parentId: string; position: "LEFT" | "RIGHT" };

    if (parentId && parentId.trim()) {
      const parentUser = await findUserByMemberId(parentId.trim());
      if (parentUser) {
        binarySpot = await findAvailableBinarySpot(parentUser.memberId, targetLeg);
      } else {
        binarySpot = await findAvailableBinarySpot(sponsor.memberId, targetLeg);
      }
    } else {
      binarySpot = await findAvailableBinarySpot(sponsor.memberId, targetLeg);
    }

    // 4. Generate Unique 5-Digit Member ID (AV + 5 digits) via direct collision check
    const newMemberId = await generateUniqueMemberId();

    // 5. Asynchronously hash password without blocking event loop
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Create new Member profile with binary attributes
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      memberId: newMemberId,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      passwordHash,
      sponsorId: sponsor.memberId,
      sponsorName: sponsor.fullName,
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      role: "MEMBER",
      status: "INACTIVE", // Red status (<100 PV)
      walletBalance: 0,
      rpWallet: 0,
      fundWallet: 0,
      totalEarnings: 0,
      directReferralsCount: 0,
      totalTeamCount: 0,
      todayEarnings: 0,
      joinedDate: new Date().toISOString().split("T")[0],

      // Binary Placement
      personalPv: 0,
      leftPv: 0,
      rightPv: 0,
      carryLeftPv: 0,
      carryRightPv: 0,
      binaryParentId: binarySpot.parentId,
      binaryPosition: binarySpot.position,
      dailyCapping: 0, // 0 Capping until 100+ PV activation
    };

    // Saves to Supabase PostgreSQL & links binary parent/child
    await saveUser(newUser);

    // 7. Generate JWT Access & Refresh Tokens
    const tokenPayload = {
      userId: newUser.id,
      memberId: newUser.memberId,
      role: newUser.role,
      fullName: newUser.fullName,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Strip passwordHash before returning to client
    const { passwordHash: _, ...safeUser } = newUser;

    const response = NextResponse.json({
      success: true,
      message: `Registration successful! Your Unique Member ID is ${newUser.memberId}`,
      user: safeUser,
      token: accessToken,
      refreshToken,
    });

    // Only set login cookies if there is NO active session already!
    // If a logged-in associate is registering downlines, preserve their active session!
    const activeSession =
      request.cookies.get("avira_access_token")?.value ||
      request.cookies.get("admin_access_token")?.value;

    if (!activeSession) {
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
    }

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to complete registration" },
      { status: 500 }
    );
  }
}
