import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { creditPurchasePV } from "@/lib/binary";

// GET: Lookup Member Details by Member ID for Self PV
export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId")?.trim().toUpperCase();

  if (!memberId) {
    return NextResponse.json({ success: false, message: "Member ID is required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, member_id, full_name, mobile, status, personal_pv, daily_capping, wallet_balance, created_at
       FROM users 
       WHERE UPPER(member_id) = $1 LIMIT 1`,
      [memberId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: `Member with ID "${memberId}" not found.` }, { status: 404 });
    }

    const member = res.rows[0];
    const personalPv = parseFloat(member.personal_pv || "0");

    let rank = "Red Account";
    if (personalPv >= 1000) rank = "Diamond Rank";
    else if (personalPv >= 500) rank = "Platinum Rank";
    else if (personalPv >= 250) rank = "Gold Rank";
    else if (personalPv >= 100) rank = "Silver Rank";

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        memberId: member.member_id,
        fullName: member.full_name,
        mobile: member.mobile,
        status: member.status,
        personalPv,
        dailyCapping: member.daily_capping,
        walletBalance: parseFloat(member.wallet_balance || "0"),
        rank,
        joinedDate: member.created_at,
      },
    });
  } catch (error) {
    console.error("Self PV lookup error:", error);
    return NextResponse.json({ success: false, message: "Error looking up member." }, { status: 500 });
  } finally {
    client.release();
  }
}

// POST: Credit Self PV to Member
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { memberId, pv: rawPv, note } = body;

    const memberIdClean = String(memberId || "").trim().toUpperCase();
    const pv = parseFloat(rawPv);

    if (!memberIdClean) {
      return NextResponse.json({ success: false, message: "Member ID is required." }, { status: 400 });
    }

    if (isNaN(pv) || pv <= 0) {
      return NextResponse.json({ success: false, message: "Please enter a valid PV amount greater than 0." }, { status: 400 });
    }

    const client = await pool.connect();
    let userId = "";
    let fullName = "";
    try {
      const userRes = await client.query(
        "SELECT id, full_name, personal_pv FROM users WHERE UPPER(member_id) = $1 LIMIT 1",
        [memberIdClean]
      );
      if (userRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: `Member ${memberIdClean} not found.` }, { status: 404 });
      }
      userId = userRes.rows[0].id;
      fullName = userRes.rows[0].full_name;
    } finally {
      client.release();
    }

    // Use established binary volume crediting engine
    const result = await creditPurchasePV(
      userId,
      pv,
      "ACTIVATION",
      note || `Admin Self PV Credit (${pv} PV)`,
      pv * 30, // standard rate representation
      [{ name: "Admin Self PV Credit", pv, qty: 1 }],
      false // creates order record in database
    );

    return NextResponse.json({
      success: true,
      message: `Successfully credited ${pv} Self PV to ${fullName} (${memberIdClean}).`,
      data: {
        memberId: memberIdClean,
        fullName,
        addedPv: pv,
        newPersonalPv: result.newPersonalPv,
        newCapping: result.newCapping,
        instantMatchesCount: result.instantMatches.length,
      },
    });
  } catch (error: any) {
    console.error("Self PV credit error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to credit Self PV." }, { status: 500 });
  }
}
