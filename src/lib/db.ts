import { Pool } from "pg";
import { User, Transaction } from "@/types";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

declare global {
  // eslint-disable-next-line no-var
  var __supabase_pool__: Pool | undefined;
}

export const pool =
  global.__supabase_pool__ ||
  (global.__supabase_pool__ = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }));

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    memberId: row.member_id,
    fullName: row.full_name,
    mobile: row.mobile,
    passwordHash: row.password_hash,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor_name,
    pincode: row.pincode,
    city: row.city,
    state: row.state,
    role: row.role as "MEMBER" | "ADMIN",
    status: row.status as "ACTIVE" | "PENDING" | "BLOCKED",
    walletBalance: Number(row.wallet_balance || 0),
    totalEarnings: Number(row.total_earnings || 0),
    directReferralsCount: Number(row.direct_referrals_count || 0),
    totalTeamCount: Number(row.total_team_count || 0),
    todayEarnings: Number(row.today_earnings || 0),
    joinedDate: row.joined_date,
  };
}

function mapRowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: Number(row.amount || 0),
    description: row.description,
    status: row.status,
    date: row.date,
  };
}

export async function findUserByMemberId(memberId: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1",
      [memberId.trim()]
    );
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0]);
  } finally {
    client.release();
  }
}

export async function findUserByMobile(mobile: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM users WHERE mobile = $1 LIMIT 1",
      [mobile.trim()]
    );
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0]);
  } finally {
    client.release();
  }
}

export async function findUserByIdentifier(identifier: string): Promise<User | null> {
  const clean = identifier.trim();
  if (clean.toUpperCase().startsWith("AV")) {
    return findUserByMemberId(clean);
  }
  const byMobile = await findUserByMobile(clean);
  if (byMobile) return byMobile;
  return findUserByMemberId(clean);
}

export async function getAllMemberIds(): Promise<Set<string>> {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT member_id FROM users");
    return new Set(res.rows.map((r) => r.member_id.toUpperCase()));
  } finally {
    client.release();
  }
}

export async function saveUser(user: User): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert user into Supabase PostgreSQL
    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `,
      [
        user.id,
        user.memberId,
        user.fullName,
        user.mobile,
        user.passwordHash || "",
        user.sponsorId || null,
        user.sponsorName || null,
        user.pincode,
        user.city,
        user.state,
        user.role || "MEMBER",
        user.status || "ACTIVE",
        user.walletBalance,
        user.totalEarnings,
        user.directReferralsCount,
        user.totalTeamCount,
        user.todayEarnings,
        user.joinedDate,
      ]
    );

    // If user has a sponsor, update sponsor's metrics & award welcome referral incentive
    if (user.sponsorId) {
      await client.query(
        `
        UPDATE users 
        SET 
          direct_referrals_count = direct_referrals_count + 1,
          total_team_count = total_team_count + 1,
          wallet_balance = wallet_balance + 1000,
          total_earnings = total_earnings + 1000,
          today_earnings = today_earnings + 1000,
          updated_at = NOW()
        WHERE UPPER(member_id) = UPPER($1)
      `,
        [user.sponsorId]
      );

      // Fetch sponsor id to link transaction
      const sponsorRes = await client.query(
        "SELECT id FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1",
        [user.sponsorId]
      );

      if (sponsorRes.rows.length > 0) {
        const sponsorDbId = sponsorRes.rows[0].id;
        await client.query(
          `
          INSERT INTO transactions (id, user_id, type, amount, description, status, date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            `tx_${Date.now()}_ref`,
            sponsorDbId,
            "DIRECT_REFERRAL",
            1000.0,
            `Direct Referral Incentive for onboarding ${user.fullName} (${user.memberId})`,
            "COMPLETED",
            new Date().toISOString().replace("T", " ").substring(0, 16),
          ]
        );
      }
    }

    // Insert welcome bonus transaction for the new user
    await client.query(
      `
      INSERT INTO transactions (id, user_id, type, amount, description, status, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        `tx_${Date.now()}_wel`,
        user.id,
        "WELCOME_BONUS",
        500.0,
        "Avira Member Welcome Enrollment Credit",
        "COMPLETED",
        new Date().toISOString().replace("T", " ").substring(0, 16),
      ]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getTransactionsForUser(userId: string): Promise<Transaction[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    return res.rows.map(mapRowToTransaction);
  } finally {
    client.release();
  }
}
