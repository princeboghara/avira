import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

// GET: Lookup Member Details for Power PV
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
      `SELECT id, member_id, full_name, mobile, status, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv
       FROM v_users_full 
       WHERE UPPER(member_id) = $1 LIMIT 1`,
      [memberId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: `Member with ID "${memberId}" not found.` }, { status: 404 });
    }

    const member = res.rows[0];

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        memberId: member.member_id,
        fullName: member.full_name,
        mobile: member.mobile,
        status: member.status,
        personalPv: parseFloat(member.personal_pv || "0"),
        leftPv: parseFloat(member.left_pv || "0"),
        rightPv: parseFloat(member.right_pv || "0"),
        carryLeftPv: parseFloat(member.carry_left_pv || member.left_pv || "0"),
        carryRightPv: parseFloat(member.carry_right_pv || member.right_pv || "0"),
      },
    });
  } catch (error) {
    console.error("Power PV lookup error:", error);
    return NextResponse.json({ success: false, message: "Error looking up member." }, { status: 500 });
  } finally {
    client.release();
  }
}

// POST: Credit Power PV into Left or Right Leg & Propagate Upward
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { memberId, leg, pv: rawPv, note } = body;

    const memberIdClean = String(memberId || "").trim().toUpperCase();
    const targetLeg = String(leg || "").trim().toUpperCase();
    const pv = parseFloat(rawPv);

    if (!memberIdClean) {
      return NextResponse.json({ success: false, message: "Member ID is required." }, { status: 400 });
    }

    if (targetLeg !== "LEFT" && targetLeg !== "RIGHT") {
      return NextResponse.json({ success: false, message: "Please select either LEFT or RIGHT leg." }, { status: 400 });
    }

    if (isNaN(pv) || pv <= 0) {
      return NextResponse.json({ success: false, message: "Please enter a valid PV amount greater than 0." }, { status: 400 });
    }

    await client.query("BEGIN");

    // 1. Get Target Member
    const userRes = await client.query(
      `SELECT u.id, u.member_id, u.full_name, b.left_pv, b.right_pv, b.binary_parent_id, b.binary_position 
       FROM users u
       JOIN user_binary_pv b ON u.id = b.user_id
       WHERE UPPER(u.member_id) = $1 FOR UPDATE`,
      [memberIdClean]
    );

    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: `Member ${memberIdClean} not found.` }, { status: 404 });
    }

    const user = userRes.rows[0];
    const userId = user.id;

    // 2. Add Power PV to chosen leg in user_binary_pv
    const legColumn = targetLeg === "LEFT" ? "left_pv" : "right_pv";
    const carryColumn = targetLeg === "LEFT" ? "carry_left_pv" : "carry_right_pv";

    await client.query(
      `UPDATE user_binary_pv 
       SET ${legColumn} = ${legColumn} + $1,
           ${carryColumn} = ${carryColumn} + $1,
           updated_at = NOW() 
       WHERE user_id = $2`,
      [pv, userId]
    );

    // 3. Record Admin Power PV Transaction Audit
    const txId = `tx_${Date.now()}_power_${user.member_id}`;
    const desc = note || `Admin Power PV Credit: ${pv} PV into ${targetLeg} Leg`;
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, description, status, date)
       VALUES ($1, $2, 'BINARY_MATCHING', 0, $3, 'COMPLETED', $4)`,
      [txId, userId, desc, dateStr]
    );

    // 4. Propagate PV UPWARD through ancestors in the binary tree
    let currentChildId = userId;
    let parentId = user.binary_parent_id;
    let propagatedAncestorsCount = 0;

    while (parentId) {
      const parentRes = await client.query(
        "SELECT user_id, left_child_id, right_child_id, binary_parent_id FROM user_binary_pv WHERE user_id = $1 FOR UPDATE",
        [parentId]
      );

      if (parentRes.rows.length === 0) break;
      const parent = parentRes.rows[0];

      if (parent.left_child_id === currentChildId) {
        // Belongs to Parent's LEFT Leg
        await client.query(
          "UPDATE user_binary_pv SET left_pv = left_pv + $1, carry_left_pv = carry_left_pv + $1, updated_at = NOW() WHERE user_id = $2",
          [pv, parent.user_id]
        );
        propagatedAncestorsCount++;
      } else if (parent.right_child_id === currentChildId) {
        // Belongs to Parent's RIGHT Leg
        await client.query(
          "UPDATE user_binary_pv SET right_pv = right_pv + $1, carry_right_pv = carry_right_pv + $1, updated_at = NOW() WHERE user_id = $2",
          [pv, parent.user_id]
        );
        propagatedAncestorsCount++;
      }

      currentChildId = parent.user_id;
      parentId = parent.binary_parent_id;
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Successfully credited ${pv} Power PV into ${targetLeg} leg of ${user.full_name} (${memberIdClean}) and propagated to ${propagatedAncestorsCount} upline leaders.`,
      data: {
        memberId: memberIdClean,
        fullName: user.full_name,
        leg: targetLeg,
        addedPv: pv,
        propagatedUplineNodes: propagatedAncestorsCount,
      },
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Power PV credit error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to credit Power PV." }, { status: 500 });
  } finally {
    client.release();
  }
}
