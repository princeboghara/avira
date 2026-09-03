import { PoolClient } from "pg";

export interface RoyaltyQualificationResult {
  isQualified: boolean;
  leftDirects1000Pv: number;
  rightDirects1000Pv: number;
  leftRequired: number;
  rightRequired: number;
  leftList: Array<{ id: string; memberId: string; fullName: string; personalPv: number }>;
  rightList: Array<{ id: string; memberId: string; fullName: string; personalPv: number }>;
}

export interface RoyaltyPoolSummary {
  monthIdentifier: string; // e.g. "2026-08"
  monthLabel: string;      // e.g. "August 2026"
  startDate: string;
  endDate: string;
  totalCompanyPv: number;
  royaltyPercentage: number; // 5%
  poolAmount: number;
  totalAchieversCount: number;
  projectedSharePerAchiever: number;
}

/**
 * Checks whether an associate meets the Royalty Achiever criteria:
 * - At least 5 direct referrals with 1000+ PV in LEFT leg
 * - At least 5 direct referrals with 1000+ PV in RIGHT leg
 */
export async function checkRoyaltyQualification(
  client: PoolClient,
  userId: string,
  memberId: string
): Promise<RoyaltyQualificationResult> {
  // 1. Fetch direct referrals of this member
  const directsRes = await client.query(
    `SELECT id, member_id, full_name, personal_pv, binary_position, binary_parent_id
     FROM v_users_full
     WHERE UPPER(sponsor_id) = UPPER($1) OR sponsor_id = $2 OR sponsor_id = 'usr_' || $1
     ORDER BY created_at ASC`,
    [memberId, userId]
  );

  // 2. Fetch all members in Left subtree and Right subtree of this user
  const leftTreeRes = await client.query(
    `WITH RECURSIVE left_tree AS (
       SELECT id FROM v_users_full WHERE binary_parent_id = $1 AND binary_position = 'LEFT'
       UNION ALL
       SELECT u.id FROM v_users_full u INNER JOIN left_tree lt ON u.binary_parent_id = lt.id
     )
     SELECT id FROM left_tree`,
    [userId]
  );

  const rightTreeRes = await client.query(
    `WITH RECURSIVE right_tree AS (
       SELECT id FROM v_users_full WHERE binary_parent_id = $1 AND binary_position = 'RIGHT'
       UNION ALL
       SELECT u.id FROM v_users_full u INNER JOIN right_tree rt ON u.binary_parent_id = rt.id
     )
     SELECT id FROM right_tree`,
    [userId]
  );

  const leftUserIds = new Set(leftTreeRes.rows.map((r) => r.id));
  const rightUserIds = new Set(rightTreeRes.rows.map((r) => r.id));

  const leftList: Array<{ id: string; memberId: string; fullName: string; personalPv: number }> = [];
  const rightList: Array<{ id: string; memberId: string; fullName: string; personalPv: number }> = [];

  for (const d of directsRes.rows) {
    const pv = parseFloat(d.personal_pv || "0");
    const isLeft = leftUserIds.has(d.id) || (leftUserIds.size === 0 && d.binary_position === "LEFT" && d.binary_parent_id === userId);
    const isRight = rightUserIds.has(d.id) || (rightUserIds.size === 0 && d.binary_position === "RIGHT" && d.binary_parent_id === userId);

    if (pv >= 1000) {
      if (isLeft) {
        leftList.push({
          id: d.id,
          memberId: d.member_id,
          fullName: d.full_name,
          personalPv: pv,
        });
      } else if (isRight) {
        rightList.push({
          id: d.id,
          memberId: d.member_id,
          fullName: d.full_name,
          personalPv: pv,
        });
      }
    }
  }

  const leftDirects1000Pv = leftList.length;
  const rightDirects1000Pv = rightList.length;
  const isQualified = leftDirects1000Pv >= 5 && rightDirects1000Pv >= 5;

  return {
    isQualified,
    leftDirects1000Pv,
    rightDirects1000Pv,
    leftRequired: 5,
    rightRequired: 5,
    leftList,
    rightList,
  };
}

/**
 * Calculates current calendar month's Royalty Pool (5% of Total Company Activation PV)
 */
export async function getMonthlyRoyaltyPool(
  client: PoolClient,
  customYearMonth?: string
): Promise<RoyaltyPoolSummary> {
  const now = new Date();
  const year = customYearMonth ? parseInt(customYearMonth.split("-")[0], 10) : now.getFullYear();
  const monthIndex = customYearMonth ? parseInt(customYearMonth.split("-")[1], 10) - 1 : now.getMonth();

  const start = new Date(year, monthIndex, 1, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  const startDateStr = start.toISOString().split("T")[0];
  const endDateStr = end.toISOString().split("T")[0];
  const monthIdentifier = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthLabel = `${monthNames[monthIndex]} ${year}`;

  // 1. Calculate Total Company PV generated in real-time from active orders and personal activation PVs
  const ordersPvRes = await client.query(
    `SELECT COALESCE(SUM(pv), 0) as total_pv
     FROM orders
     WHERE status IN ('CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'APPROVED', 'PAID')
       AND created_at >= $1::timestamp
       AND created_at <= ($2 || ' 23:59:59')::timestamp`,
    [startDateStr, endDateStr]
  );
  const ordersPv = parseFloat(ordersPvRes.rows[0]?.total_pv || "0");

  const cumulativePvRes = await client.query(
    `SELECT COALESCE(SUM(personal_pv), 0) as total_pv FROM user_binary_pv WHERE personal_pv > 0`
  );
  const userPvSum = parseFloat(cumulativePvRes.rows[0]?.total_pv || "0");

  // Real-time live total company PV turnover
  const totalCompanyPv = Math.max(ordersPv, userPvSum);

  const royaltyPercentage = 5; // 5% of monthly activation PV
  const poolAmount = Math.round(totalCompanyPv * 0.05 * 100) / 100;

  // 2. Count current qualified achievers
  const allUsersRes = await client.query(
    `SELECT id, member_id FROM users WHERE status = 'ACTIVE' OR id IN (SELECT user_id FROM user_binary_pv WHERE personal_pv >= 100)`
  );

  let totalAchieversCount = 0;
  for (const u of allUsersRes.rows) {
    const qual = await checkRoyaltyQualification(client, u.id, u.member_id);
    if (qual.isQualified) {
      totalAchieversCount++;
    }
  }

  const projectedSharePerAchiever =
    totalAchieversCount > 0 ? Math.round((poolAmount / totalAchieversCount) * 100) / 100 : poolAmount;

  return {
    monthIdentifier,
    monthLabel,
    startDate: startDateStr,
    endDate: endDateStr,
    totalCompanyPv,
    royaltyPercentage,
    poolAmount,
    totalAchieversCount,
    projectedSharePerAchiever,
  };
}

/**
 * Executes Monthly Royalty Closing:
 * - Computes the 5% Activation PV Pool for the given month
 * - Divides the pool equally among all qualified Royalty Achievers
 * - Credits wallets and logs 'ROYALTY_INCOME' transactions
 */
export async function executeMonthlyRoyaltyClosing(
  client: PoolClient,
  customYearMonth?: string
) {
  const poolSummary = await getMonthlyRoyaltyPool(client, customYearMonth);
  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);

  // 1. Identify all qualified achievers
  const allUsersRes = await client.query(
    `SELECT u.id, u.member_id, u.full_name
     FROM users u
     WHERE u.status = 'ACTIVE' OR u.id IN (SELECT user_id FROM user_binary_pv WHERE personal_pv >= 100)`
  );

  const achievers: Array<{ id: string; memberId: string; fullName: string }> = [];
  for (const u of allUsersRes.rows) {
    const qual = await checkRoyaltyQualification(client, u.id, u.member_id);
    if (qual.isQualified) {
      achievers.push({ id: u.id, memberId: u.member_id, fullName: u.full_name });
    }
  }

  if (achievers.length === 0 || poolSummary.poolAmount <= 0) {
    return {
      success: true,
      message: `Royalty closing evaluated: Pool ₹${poolSummary.poolAmount} with ${achievers.length} qualified achievers.`,
      poolSummary,
      distributedCount: 0,
      perAchieverAmount: 0,
      achievers,
    };
  }

  const perAchieverAmount = Math.round((poolSummary.poolAmount / achievers.length) * 100) / 100;

  for (const ach of achievers) {
    // Credit wallet
    await client.query(
      `UPDATE user_wallets
       SET wallet_balance = wallet_balance + $1,
           total_earnings = total_earnings + $1,
           today_earnings = today_earnings + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [perAchieverAmount, ach.id]
    );

    const txId = `tx_${Date.now()}_royalty_${ach.memberId}_${poolSummary.monthIdentifier}`;
    const desc = `Monthly Royalty Income Share (${poolSummary.monthLabel}) - 5% Company Activation PV Pool (₹${poolSummary.poolAmount.toLocaleString("en-IN")})`;

    await client.query(
      `INSERT INTO transactions (id, user_id, type, amount, description, status, date)
       VALUES ($1, $2, 'ROYALTY_INCOME', $3, $4, 'COMPLETED', $5)
       ON CONFLICT (id) DO NOTHING`,
      [txId, ach.id, perAchieverAmount, desc, dateStr]
    );
  }

  return {
    success: true,
    message: `Successfully distributed ₹${poolSummary.poolAmount} Royalty Pool equally among ${achievers.length} achievers (₹${perAchieverAmount} each).`,
    poolSummary,
    distributedCount: achievers.length,
    perAchieverAmount,
    achievers,
  };
}
