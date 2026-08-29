import { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { BinaryTreeNode } from "@/types";

/**
 * Calculates Daily Capping based on Member's Personal PV
 * < 100 PV -> ₹0 / day (INACTIVE / RED)
 * 100 PV  -> ₹1,000 / day
 * 250 PV  -> ₹2,000 / day
 * 500 PV  -> ₹3,000 / day
 * 1000 PV -> ₹5,000 / day
 */
export function calculateDailyCapping(personalPv: number): number {
  if (personalPv >= 1000) return 5000;
  if (personalPv >= 500) return 3000;
  if (personalPv >= 250) return 2000;
  if (personalPv >= 100) return 1000;
  return 0; // Below 100 PV: Red / Inactive with 0 Capping
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
    // 1. Get sponsor record from users + user_binary_pv
    const sponsorRes = await client.query(
      `SELECT u.id, u.member_id, b.left_child_id, b.right_child_id 
       FROM users u
       LEFT JOIN user_binary_pv b ON u.id = b.user_id
       WHERE UPPER(u.member_id) = UPPER($1) LIMIT 1`,
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
        "SELECT user_id, left_child_id, right_child_id FROM user_binary_pv WHERE user_id = $1 LIMIT 1",
        [currentId]
      );

      if (nodeRes.rows.length === 0) break;

      const node = nodeRes.rows[0];
      const nextChildId = preferredPosition === "LEFT" ? node.left_child_id : node.right_child_id;

      if (!nextChildId) {
        return { parentId: node.user_id, position: preferredPosition };
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

    // 1. Update child's parent and position in user_binary_pv
    await client.query(
      `INSERT INTO user_binary_pv (user_id, binary_parent_id, binary_position, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         binary_parent_id = EXCLUDED.binary_parent_id,
         binary_position = EXCLUDED.binary_position,
         updated_at = NOW()`,
      [childUserId, parentUserId, position]
    );

    // 2. Update parent's left_child_id or right_child_id in user_binary_pv
    const childColumn = position === "LEFT" ? "left_child_id" : "right_child_id";
    await client.query(
      `UPDATE user_binary_pv SET ${childColumn} = $1, updated_at = NOW() WHERE user_id = $2`,
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
 * Executes INSTANT 1:1 Binary matching for a single user if:
 * - carry_left_pv > 0 AND carry_right_pv > 0
 * - personal_pv >= 100 (if < 100, capping is 0 so no payout is distributed until activation)
 * 
 * IMPORTANT: left_pv and right_pv are CUMULATIVE LIFETIME TOTALS and MUST NEVER DECREASE!
 * Only carry_left_pv and carry_right_pv are decremented by the matched volume.
 */
/**
 * Distributes Leadership Supporting Bonus across 2 generation levels (Direct Sponsor Tree):
 * - Level 1 Direct Sponsor: 15% of the binary matching payout
 * - Level 2 Direct Sponsor: 5% of the binary matching payout
 * 
 * Rules:
 * - Calculated strictly on Sponsor ID (Direct Sponsor Tree), NOT on Binary Parent ID.
 * - Eligible receiving sponsor must have personal_pv >= 100 (Active Associate).
 * - Credits wallet_balance, total_earnings, today_earnings in user_wallets.
 * - Logs structured transaction with type: 'LEADERSHIP_BONUS'.
 */
export async function distributeLeadershipBonus(
  client: PoolClient,
  earner: { id: string; memberId: string; fullName: string; sponsorId?: string },
  binaryPayout: number
) {
  if (binaryPayout <= 0 || !earner.sponsorId) return;

  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);

  // 1. Level 1 Direct Sponsor (15%)
  const l1Res = await client.query(
    `SELECT u.id, u.member_id, u.full_name, u.sponsor_id, b.personal_pv
     FROM users u
     LEFT JOIN user_binary_pv b ON u.id = b.user_id
     WHERE UPPER(u.member_id) = UPPER($1) OR u.id::text = $1
     LIMIT 1 FOR UPDATE`,
    [earner.sponsorId]
  );

  if (l1Res.rows.length === 0) return;
  const l1Sponsor = l1Res.rows[0];
  const l1Pv = parseFloat(l1Sponsor.personal_pv || "0");
  const l1BonusAmount = Math.round((binaryPayout * 0.15) * 100) / 100;

  if (l1BonusAmount > 0 && l1Pv >= 100) {
    // Credit Level 1 Sponsor wallet
    await client.query(
      `UPDATE user_wallets 
       SET wallet_balance = wallet_balance + $1, 
           total_earnings = total_earnings + $1, 
           today_earnings = today_earnings + $1, 
           updated_at = NOW() 
       WHERE user_id = $2`,
      [l1BonusAmount, l1Sponsor.id]
    );

    const txId1 = `tx_${Date.now()}_lead1_${l1Sponsor.member_id}`;
    const desc1 = `Leadership Supporting Bonus (15% Level 1) from ${earner.fullName} (${earner.memberId}) Binary Payout ₹${binaryPayout}`;

    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, description, status, date)
       VALUES ($1, $2, 'LEADERSHIP_BONUS', $3, $4, 'COMPLETED', $5)`,
      [txId1, l1Sponsor.id, l1BonusAmount, desc1, dateStr]
    );
  }

  // 2. Level 2 Direct Sponsor (5%)
  if (!l1Sponsor.sponsor_id) return;

  const l2Res = await client.query(
    `SELECT u.id, u.member_id, u.full_name, u.sponsor_id, b.personal_pv
     FROM users u
     LEFT JOIN user_binary_pv b ON u.id = b.user_id
     WHERE UPPER(u.member_id) = UPPER($1) OR u.id::text = $1
     LIMIT 1 FOR UPDATE`,
    [l1Sponsor.sponsor_id]
  );

  if (l2Res.rows.length === 0) return;
  const l2Sponsor = l2Res.rows[0];
  const l2Pv = parseFloat(l2Sponsor.personal_pv || "0");
  const l2BonusAmount = Math.round((binaryPayout * 0.05) * 100) / 100;

  if (l2BonusAmount > 0 && l2Pv >= 100) {
    // Credit Level 2 Sponsor wallet
    await client.query(
      `UPDATE user_wallets 
       SET wallet_balance = wallet_balance + $1, 
           total_earnings = total_earnings + $1, 
           today_earnings = today_earnings + $1, 
           updated_at = NOW() 
       WHERE user_id = $2`,
      [l2BonusAmount, l2Sponsor.id]
    );

    const txId2 = `tx_${Date.now()}_lead2_${l2Sponsor.member_id}`;
    const desc2 = `Leadership Supporting Bonus (5% Level 2) from ${earner.fullName} (${earner.memberId}) Binary Payout ₹${binaryPayout}`;

    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, description, status, date)
       VALUES ($1, $2, 'LEADERSHIP_BONUS', $3, $4, 'COMPLETED', $5)`,
      [txId2, l2Sponsor.id, l2BonusAmount, desc2, dateStr]
    );
  }
}

async function matchBinaryForUser(client: PoolClient, userId: string) {
  const userRes = await client.query(
    `SELECT u.id, u.member_id, u.full_name, u.sponsor_id, b.personal_pv, b.left_pv, b.right_pv, b.carry_left_pv, b.carry_right_pv, w.wallet_balance, w.total_earnings 
     FROM users u
     JOIN user_binary_pv b ON u.id = b.user_id
     JOIN user_wallets w ON u.id = w.user_id
     WHERE u.id = $1 FOR UPDATE`,
    [userId]
  );

  if (userRes.rows.length === 0) return null;
  const user = userRes.rows[0];

  const personalPv = parseFloat(user.personal_pv || "0");
  if (personalPv < 100) {
    // Under 100 PV: Red / Inactive, capping is 0. Volume remains intact until activation.
    return null;
  }

  // Use carry_left_pv and carry_right_pv for matching!
  const carryLeft = parseFloat(user.carry_left_pv !== null && user.carry_left_pv !== undefined ? user.carry_left_pv : user.left_pv || "0");
  const carryRight = parseFloat(user.carry_right_pv !== null && user.carry_right_pv !== undefined ? user.carry_right_pv : user.right_pv || "0");
  const matchedPv = Math.min(carryLeft, carryRight);

  if (matchedPv <= 0) return null;

  const capping = calculateDailyCapping(personalPv);
  const payout = Math.min(matchedPv, capping);

  const newCarryLeft = carryLeft - matchedPv;
  const newCarryRight = carryRight - matchedPv;

  // Update carry_left_pv, carry_right_pv in user_binary_pv
  await client.query(
    `UPDATE user_binary_pv 
     SET carry_left_pv = $1, 
         carry_right_pv = $2, 
         updated_at = NOW() 
     WHERE user_id = $3`,
    [newCarryLeft, newCarryRight, user.id]
  );

  // Update wallet_balance, total_earnings, today_earnings in user_wallets
  await client.query(
    `UPDATE user_wallets 
     SET wallet_balance = wallet_balance + $1, 
         total_earnings = total_earnings + $1, 
         today_earnings = today_earnings + $1, 
         updated_at = NOW() 
     WHERE user_id = $2`,
    [payout, user.id]
  );

  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  const txId = `tx_${Date.now()}_bin_${user.member_id}`;
  const desc = `Instant 1:1 Binary Match ${matchedPv} PV. Daily Cap ₹${capping}. Payout: ₹${payout}. Carry: L:${newCarryLeft}, R:${newCarryRight}`;

  await client.query(
    `INSERT INTO transactions (id, user_id, type, amount, description, status, date)
     VALUES ($1, $2, 'BINARY_MATCHING', $3, $4, 'COMPLETED', $5)`,
    [txId, user.id, payout, desc, dateStr]
  );

  // Distribute 2-Level Leadership Supporting Bonus (15% Level 1, 5% Level 2) to direct sponsor hierarchy
  await distributeLeadershipBonus(
    client,
    {
      id: user.id,
      memberId: user.member_id,
      fullName: user.full_name,
      sponsorId: user.sponsor_id,
    },
    payout
  );

  return { memberId: user.member_id, matchedPv, payout, newLeft: newCarryLeft, newRight: newCarryRight };
}

/**
 * Records an Activation purchase:
 * - Updates user's personal_pv
 * - Computes user's daily_capping (<100 PV = 0 / Red, >=100 PV = 1000+ / Green)
 * - Propagates PV UPWARD through the binary ancestor chain
 * - Automatically executes REAL-TIME 1:1 Binary Matching for every ancestor with matching legs!
 */
export async function creditPurchasePV(
  userId: string,
  pv: number,
  purchaseType: "ACTIVATION" | "REPURCHASE" = "ACTIVATION",
  packageName: string,
  amount: number,
  items: unknown[] = [],
  skipOrderCreation: boolean = false
): Promise<{
  newPersonalPv: number;
  newCapping: number;
  instantMatches: Array<{
    memberId: string;
    matchedPv: number;
    payout: number;
  }>;
}> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create order record only if not skipped (prevents duplicate orders)
    if (!skipOrderCreation) {
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await client.query(
        `INSERT INTO orders (id, user_id, purchase_type, package_name, amount, pv, items, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [orderId, userId, purchaseType, packageName, amount, pv, JSON.stringify(items), "APPROVED"]
      );
    }

    // 2. Update user's personal_pv and daily_capping in user_binary_pv
    const userRes = await client.query(
      `SELECT u.id, b.personal_pv, b.binary_parent_id, b.binary_position 
       FROM users u
       JOIN user_binary_pv b ON u.id = b.user_id
       WHERE u.id = $1 FOR UPDATE`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new Error(`User ${userId} not found`);
    }

    const currentPv = parseFloat(userRes.rows[0].personal_pv || "0");
    const updatedPersonalPv = currentPv + pv;
    const updatedCapping = calculateDailyCapping(updatedPersonalPv);
    const newStatus = updatedPersonalPv >= 100 ? "ACTIVE" : "INACTIVE";

    // Update status in users
    await client.query(
      "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2",
      [newStatus, userId]
    );

    // Update personal_pv and daily_capping in user_binary_pv
    await client.query(
      `UPDATE user_binary_pv 
       SET personal_pv = $1, 
           daily_capping = $2, 
           updated_at = NOW() 
       WHERE user_id = $3`,
      [updatedPersonalPv, updatedCapping, userId]
    );

    const instantMatches: Array<{ memberId: string; matchedPv: number; payout: number }> = [];

    // Check if the user themselves has matching volume ready now that they are activated
    const selfMatch = await matchBinaryForUser(client, userId);
    if (selfMatch) instantMatches.push(selfMatch);

    // 3. Propagate PV UPWARD through ancestors in the binary tree & execute INSTANT matching
    let currentChildId = userId;
    let parentId = userRes.rows[0].binary_parent_id;

    while (parentId) {
      const parentRes = await client.query(
        "SELECT user_id, left_child_id, right_child_id, binary_parent_id FROM user_binary_pv WHERE user_id = $1 FOR UPDATE",
        [parentId]
      );

      if (parentRes.rows.length === 0) break;

      const parent = parentRes.rows[0];

      if (parent.left_child_id === currentChildId) {
        // PV belongs to Parent's LEFT Leg (Updates cumulative lifetime and carry-forward balance)
        await client.query(
          "UPDATE user_binary_pv SET left_pv = left_pv + $1, carry_left_pv = carry_left_pv + $1, updated_at = NOW() WHERE user_id = $2",
          [pv, parent.user_id]
        );
      } else if (parent.right_child_id === currentChildId) {
        // PV belongs to Parent's RIGHT Leg (Updates cumulative lifetime and carry-forward balance)
        await client.query(
          "UPDATE user_binary_pv SET right_pv = right_pv + $1, carry_right_pv = carry_right_pv + $1, updated_at = NOW() WHERE user_id = $2",
          [pv, parent.user_id]
        );
      }

      // INSTANT MATCHING: Check and credit matching bonus to parent immediately!
      const parentMatch = await matchBinaryForUser(client, parent.user_id);
      if (parentMatch) instantMatches.push(parentMatch);

      // Climb up
      currentChildId = parent.user_id;
      parentId = parent.binary_parent_id;
    }

    await client.query("COMMIT");

    return {
      newPersonalPv: updatedPersonalPv,
      newCapping: updatedCapping,
      instantMatches,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Manual / Audit Run for 1:1 Binary Matching across all active members
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

    const candidates = await client.query(
      `SELECT u.id, u.member_id, u.full_name, b.left_pv, b.right_pv, b.carry_left_pv, b.carry_right_pv, b.personal_pv, b.daily_capping
       FROM users u
       JOIN user_binary_pv b ON u.id = b.user_id
       WHERE (COALESCE(b.carry_left_pv, b.left_pv) > 0) AND (COALESCE(b.carry_right_pv, b.right_pv) > 0) AND b.personal_pv >= 100
       FOR UPDATE`
    );

    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);
    let totalPayout = 0;
    const results = [];

    for (const row of candidates.rows) {
      const carryLeft = parseFloat(row.carry_left_pv !== null && row.carry_left_pv !== undefined ? row.carry_left_pv : row.left_pv || "0");
      const carryRight = parseFloat(row.carry_right_pv !== null && row.carry_right_pv !== undefined ? row.carry_right_pv : row.right_pv || "0");
      const personalPv = parseFloat(row.personal_pv || "0");
      const capping = calculateDailyCapping(personalPv);

      const matchedPv = Math.min(carryLeft, carryRight);
      if (matchedPv <= 0) continue;

      const finalPayout = Math.min(matchedPv, capping);
      const newCarryLeft = carryLeft - matchedPv;
      const newCarryRight = carryRight - matchedPv;

      // Update ONLY carry_left_pv and carry_right_pv in user_binary_pv
      await client.query(
        `UPDATE user_binary_pv
         SET carry_left_pv = $1,
             carry_right_pv = $2,
             updated_at = NOW()
         WHERE user_id = $3`,
        [newCarryLeft, newCarryRight, row.id]
      );

      // Update wallet in user_wallets
      await client.query(
        `UPDATE user_wallets
         SET wallet_balance = wallet_balance + $1,
             total_earnings = total_earnings + $1,
             today_earnings = today_earnings + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [finalPayout, row.id]
      );

      const txId = `tx_${Date.now()}_bin_${row.member_id}`;
      const description = `1:1 Binary Match ${matchedPv} PV. Daily Cap ₹${capping}. Payout ₹${finalPayout}. Carry: L:${newCarryLeft}, R:${newCarryRight}`;

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
        carryLeft: newCarryLeft,
        carryRight: newCarryRight,
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
 * Builds recursive Binary Tree structure up to 4 levels deep for visual UI
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
        `SELECT u.id, u.member_id, u.full_name, u.status, b.personal_pv, b.left_pv, b.right_pv, b.daily_capping, b.binary_position, b.left_child_id, b.right_child_id
         FROM users u
         LEFT JOIN user_binary_pv b ON u.id = b.user_id
         WHERE UPPER(u.member_id) = UPPER($1) OR u.id = $1
         LIMIT 1`,
        [memberIdOrId]
      );

      if (res.rows.length === 0) return null;

      const row = res.rows[0];
      const pPv = parseFloat(row.personal_pv || "0");
      const status = pPv >= 100 ? "ACTIVE" : "INACTIVE";
      const capping = calculateDailyCapping(pPv);

      const leftChild = row.left_child_id ? await fetchNode(row.left_child_id, depth + 1) : null;
      const rightChild = row.right_child_id ? await fetchNode(row.right_child_id, depth + 1) : null;

      return {
        id: row.id,
        memberId: row.member_id,
        fullName: row.full_name,
        status,
        personalPv: pPv,
        leftPv: parseFloat(row.left_pv || "0"),
        rightPv: parseFloat(row.right_pv || "0"),
        dailyCapping: capping,
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
