import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserByIdentifier } from "@/lib/db";
import { creditPurchasePV } from "@/lib/binary";

const purchaseSchema = z.object({
  memberId: z.string().min(3, "Member ID is required"),
  packageName: z.string().min(2, "Package name is required"),
  amount: z.number().positive("Amount must be positive"),
  pv: z.number().positive("PV must be positive"),
  purchaseType: z.enum(["ACTIVATION", "REPURCHASE"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = purchaseSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid purchase details";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { memberId, packageName, amount, pv, purchaseType } = result.data;

    const user = await findUserByIdentifier(memberId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: `Member "${memberId}" not found in system.` },
        { status: 404 }
      );
    }

    // Process PV credit & upward leg distribution
    const { newPersonalPv, newCapping } = await creditPurchasePV(
      user.id,
      pv,
      purchaseType,
      packageName,
      amount
    );

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${purchaseType} package "${packageName}" for ${user.fullName} (${user.memberId}). Credited ${pv} PV!`,
      data: {
        memberId: user.memberId,
        fullName: user.fullName,
        personalPv: newPersonalPv,
        dailyCapping: newCapping,
        creditedPv: pv,
        purchaseType,
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during package purchase" },
      { status: 500 }
    );
  }
}
