import { NextResponse } from "next/server";
import { runBinaryMatchingCutoff } from "@/lib/binary";

export async function POST() {
  try {
    const result = await runBinaryMatchingCutoff();

    return NextResponse.json({
      success: true,
      message: `Daily Binary Cutoff executed successfully! Processed ${result.processedCount} members, distributed ₹${result.totalPayoutDistributed} in matching bonuses.`,
      data: result,
    });
  } catch (error) {
    console.error("Binary cutoff error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to execute binary matching cutoff" },
      { status: 500 }
    );
  }
}
