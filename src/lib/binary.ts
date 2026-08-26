import { pool } from "@/lib/db";
import { BinaryTreeNode } from "@/types";

/**
 * Calculates Daily Capping based on Member's Personal PV
 * 100 PV  -> ₹1,000 / day
 * 250 PV  -> ₹2,000 / day
 * 500 PV  -> ₹3,000 / day
 * 1000 PV -> ₹5,000 / day
 */
export function calculateDailyCapping(personalPv: number): number {
  if (personalPv >= 1000) return 5000;
  if (personalPv >= 500) return 3000;
  if (personalPv >= 250) return 2000;
  return 1000; // Default minimum capping for 100 PV
}

/**
 * Finds the next available placement spot in the chosen leg (LEFT or RIGHT)
 * starting from the Sponsor's binary node down to the extreme available leaf.
 */
export async function findAvailableBinarySpot(
  sponsorMemberId: string,
  preferredPosition: "LEFT" | "RIGHT"
): Promise<{ parentId: string; position: "LEFT" | "RIGHT" }> {
  const client = await pool.connect();
  try {
    // 1. Get sponsor record
    const sponsorRes = await client.query(
      "SELECT id, member_id, left_child_id, right_child_id FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1",
      [sponsorMemberId]
    );

    if (sponsorRes.rows.length === 0) {
      throw new Error(`Sponsor ${sponsorMemberId} not found`);
    }

    const sponsor = sponsorRes.rows[0];
    let currentId = sponsor.id;
    const targetField = preferredPosition === "LEFT" ? "left_child_id" : "right_child_id";

    // 2. If immediate spot is vacant, return sponsor directly
    if (!sponsor[targetField]) {
      return { parentId: currentId, position: preferredPosition };
    }

    // 3. Otherwise, traverse down the chosen extreme leg
    currentId = sponsor[targetField];

    while (currentId) {
      const nodeRes = await client.query(
        "SELECT id, left_child_id, right_child_id FROM users WHERE id = $1 LIMIT 1",
        [currentId]
      );

      if (nodeRes.rows.length === 0) break;

      const node = nodeRes.rows[0];
      const nextChildId = preferredPosition === "LEFT" ? node.left_child_id : node.right_child_id;

      if (!nextChildId) {
        return { parentId: node.id, position: preferredPosition };
      }

      currentId = nextChildId;
    }

    return { parentId: currentId, position: preferredPosition };
  } finally {
    client.release();
  }
}

/**
 * Links a newly registered member into the binary tree
 */
export async function linkBinaryNode(
  childUserId: string,
  parentUserId: string,
  position: "LEFT" | "RIGHT"
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update child's parent and position
    await client.query(
      "UPDATE users SET binary_parent_id = $1, binary_position = $2, updated_at = NOW() WHERE id = $3",
      [parentUserId, position, childUserId]
    );

    // 2. Update parent's left_child_id or right_child_id
    const childColumn = position === "LEFT" ? "left_child_id" : "right_child_id";
    await client.query(
      `UPDATE users SET ${childColumn} = $1, updated_at = NOW() WHERE id = $2`,
      [childUserId, parentUserId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Records an Activation or Repurchase purchase:
 * - Updates user's personal_pv
 * - Recomputes user's daily_capping
 * - Propagates PV UPWARD through the binary ancestor chain
 */
export async function creditPurchasePV(
  userId: string,
  pv: number,
  purchaseType: "ACTIVATION" | "REPURCHASE",
  packageName: string,
  amount: number
): Promise<{ newPersonalPv: number; newCapping: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create order record
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await client.query(
      `INSERT INTO orders (id, user_id, purchase_type, package_name, amount, pv)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, userId, purchaseType, packageName, amount, pv]
    );

    // 2. Update user's personal_pv and daily_capping
    const userRes = await client.query(
      "SELECT id, personal_pv, binary_parent_id, binary_position FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new Error(`User ${userId} not found`);
    }

    const currentPv = parseFloat(userRes.rows[0].personal_pv || "0");
    const updatedPersonalPv = currentPv + pv;
    const updatedCapping = calculateDailyCapping(updatedPersonalPv);

    await client.query(
      `UPDATE users 
       SET personal_pv = $1, 
           daily_capping = $2, 
           status = 'ACTIVE',
           updated_at = NOW() 
       WHERE id = $3`,
      [updatedPersonalPv, updatedCapping, userId]
    );

    // 3. Propagate PV UPWARD through ancestors in the binary tree
    let currentChildId = userId;
    let parentId = userRes.rows[0].binary_parent_id;

    while (parentId) {
      const parentRes = await client.query(
        "SELECT id, left_child_id, right_child_id, binary_parent_id FROM users WHERE id = $1 FOR UPDATE",
        [parentId]
      );

      if (parentRes.rows.length === 0) break;

      const parent = parentRes.rows[0];

      if (parent.left_child_id === currentChildId) {
        // PV belongs to Parent's LEFT Leg
        await client.query(
          "UPDATE users SET left_pv = left_pv + $1, updated_at = NOW() WHERE id = $2",
          [pv, parent.id]
        );
      } else if (parent.right_child_id === currentChildId) {
        // PV belongs to Parent's RIGHT Leg
        await client.query(
          "UPDATE users SET right_pv = right_pv + $1, updated_at = NOW() WHERE id = $2",
          [pv, parent.id]
        );
      }

      // Climb up
      currentChildId = parent.id;
      parentId = parent.binary_parent_id;
    }

    await client.query("COMMIT");

    return {
      newPersonalPv: updatedPersonalPv,
      newCapping: updatedCapping,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Runs the 1:1 Daily Binary Matching Cutoff Calculation
 * - Matches 1:1 on Left PV vs Right PV
 * - Limits payout by Member's Daily Capping
 * - Carries forward remaining unmatched PV in the stronger leg
 * - Credits member's wallet and creates ledger audit entry
 */
export async function runBinaryMatchingCutoff(): Promise<{
  processedCount: number;
  totalPayoutDistributed: number;
  results: Array<{
    memberId: string;
    fullName: string;
    matchedPv: number;
    payout: number;
    capping: number;
    carryLeft: number;
    carryRight: number;
  }>;
}> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch members who have PV on both Left AND Right legs
    const candidates = await client.query(
      `SELECT id, member_id, full_name, left_pv, right_pv, personal_pv, daily_capping, wallet_balance, total_earnings
       FROM users
       WHERE left_pv > 0 AND right_pv > 0
       FOR UPDATE`
    );

    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);
    let totalPayout = 0;
    const results = [];

    for (const row of candidates.rows) {
      const leftPv = parseFloat(row.left_pv || "0");
      const rightPv = parseFloat(row.right_pv || "0");
      const personalPv = parseFloat(row.personal_pv || "0");
      const capping = calculateDailyCapping(personalPv);

      // 1:1 Match
      const matchedPv = Math.min(leftPv, rightPv);

      if (matchedPv <= 0) continue;

      // Payout = 1 PV = 1 Rupee (capped at member daily capping)
      const rawPayout = matchedPv;
      const finalPayout = Math.min(rawPayout, capping);

      // Carry forward
      const carryLeft = leftPv - matchedPv;
      const carryRight = rightPv - matchedPv;

      // Update user balances and PV
      await client.query(
        `UPDATE users
         SET left_pv = $1,
             right_pv = $2,
             carry_left_pv = $1,
             carry_right_pv = $2,
             wallet_balance = wallet_balance + $3,
             total_earnings = total_earnings + $3,
             today_earnings = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [carryLeft, carryRight, finalPayout, row.id]
      );

      // Record transaction
      const txId = `tx_${Date.now()}_bin_${row.member_id}`;
      const description = `1:1 Binary Match ${matchedPv} PV (Left ${leftPv} PV, Right ${rightPv} PV). Daily Cap ₹${capping}. Carry: L:${carryLeft}, R:${carryRight}`;

      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, description, status, date)
         VALUES ($1, $2, 'BINARY_MATCHING', $3, $4, 'COMPLETED', $5)`,
        [txId, row.id, finalPayout, description, dateStr]
      );

      totalPayout += finalPayout;
      results.push({
        memberId: row.member_id,
        fullName: row.full_name,
        matchedPv,
        payout: finalPayout,
        capping,
        carryLeft,
        carryRight,
      });
    }

    await client.query("COMMIT");

    return {
      processedCount: results.length,
      totalPayoutDistributed: totalPayout,
      results,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Builds recursive Binary Tree structure up to 3 levels deep for visual UI
 */
export async function getBinaryTree(
  rootMemberId: string,
  maxDepth: number = 3
): Promise<BinaryTreeNode | null> {
  const client = await pool.connect();
  try {
    async function fetchNode(memberIdOrId: string, depth: number): Promise<BinaryTreeNode | null> {
      if (depth > maxDepth) return null;

      const res = await client.query(
        `SELECT id, member_id, full_name, status, personal_pv, left_pv, right_pv, daily_capping, binary_position, left_child_id, right_child_id
         FROM users
         WHERE UPPER(member_id) = UPPER($1) OR id = $1
         LIMIT 1`,
        [memberIdOrId]
      );

      if (res.rows.length === 0) return null;

      const row = res.rows[0];

      const leftChild = row.left_child_id ? await fetchNode(row.left_child_id, depth + 1) : null;
      const rightChild = row.right_child_id ? await fetchNode(row.right_child_id, depth + 1) : null;

      return {
        id: row.id,
        memberId: row.member_id,
        fullName: row.full_name,
        status: row.status,
        personalPv: parseFloat(row.personal_pv || "0"),
        leftPv: parseFloat(row.left_pv || "0"),
        rightPv: parseFloat(row.right_pv || "0"),
        dailyCapping: parseFloat(row.daily_capping || "1000"),
        position: row.binary_position,
        leftChild,
        rightChild,
      };
    }

    return await fetchNode(rootMemberId, 1);
  } finally {
    client.release();
  }
}
