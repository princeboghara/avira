import { Pool } from "pg";
import { User, Transaction, Order } from "@/types";

const isProduction = process.env.NODE_ENV === "production";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (isProduction) {
      throw new Error("CRITICAL CONFIGURATION ERROR: DATABASE_URL environment variable is missing.");
    }
    return "postgresql://postgres:postgres@localhost:5432/avira_dev";
  }
  return url;
}

declare global {
  var __supabase_pool__: Pool | undefined;
}

export const pool: Pool =
  global.__supabase_pool__ ||
  (global.__supabase_pool__ = new Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }));

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client in pool:", err);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToUser(row: any): User {
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
    address: row.address || "",
    role: row.role as "MEMBER" | "ADMIN",
    status: row.status as "ACTIVE" | "PENDING" | "BLOCKED" | "INACTIVE",
    walletBalance: Number(row.wallet_balance || 0),
    rpWallet: Number(row.rp_wallet || 0),
    totalEarnings: Number(row.total_earnings || 0),
    directReferralsCount: Number(row.direct_referrals_count || 0),
    totalTeamCount: Number(row.total_team_count || 0),
    todayEarnings: Number(row.today_earnings || 0),
    joinedDate: row.joined_date,

    // Binary Fields
    personalPv: Number(row.personal_pv || 0),
    leftPv: Number(row.left_pv || 0),
    rightPv: Number(row.right_pv || 0),
    carryLeftPv: Number(row.carry_left_pv || 0),
    carryRightPv: Number(row.carry_right_pv || 0),
    binaryParentId: row.binary_parent_id || null,
    binaryPosition: row.binary_position || null,
    leftChildId: row.left_child_id || null,
    rightChildId: row.right_child_id || null,
    avatarUrl: row.avatar_url || "",
    dailyCapping: Number(row.daily_capping || 1000),

    // KYC and Banking
    email: row.email || "",
    gstNumber: row.gst_number || "",
    panNumber: row.pan_number || "",
    aadhaarNumber: row.aadhaar_number || "",
    aadhaarName: row.aadhaar_name || "",
    aadhaarFrontUrl: row.aadhaar_front_url || "",
    aadhaarBackUrl: row.aadhaar_back_url || "",
    panCardUrl: row.pan_card_url || "",
    bankProofUrl: row.bank_proof_url || "",
    bankName: row.bank_name || "",
    bankAccountNumber: row.bank_account_number || "",
    ifscCode: row.ifsc_code || "",
    upiId: row.upi_id || "",
    nomineeName: row.nominee_name || "",
    nomineeRelation: row.nominee_relation || "",
    kycDocumentUrl: row.kyc_document_url || "",
    kycStatus: row.kyc_status || "NOT_SUBMITTED",
    aadhaarStatus: row.aadhaar_status || "NOT_SUBMITTED",
    panStatus: row.pan_status || "NOT_SUBMITTED",
    bankStatus: row.bank_status || "NOT_SUBMITTED",
    aadhaarRejectionReason: row.aadhaar_rejection_reason || "",
    panRejectionReason: row.pan_rejection_reason || "",
    bankRejectionReason: row.bank_rejection_reason || "",
    kycSubmittedAt: row.kyc_submitted_at ? new Date(row.kyc_submitted_at).toISOString() : undefined,
    kycVerifiedAt: row.kyc_verified_at ? new Date(row.kyc_verified_at).toISOString() : undefined,
    kycRejectionReason: row.kyc_rejection_reason || "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToTransaction(row: any): Transaction {
  const gross = Number(row.amount || 0);
  const tds = row.tds_amount !== null && row.tds_amount !== undefined ? Number(row.tds_amount) : Math.round(gross * 0.02);
  const admin = row.admin_charge !== null && row.admin_charge !== undefined ? Number(row.admin_charge) : Math.round(gross * 0.08);
  const rp = row.rp_wallet_amount !== null && row.rp_wallet_amount !== undefined ? Number(row.rp_wallet_amount) : Math.round(gross * 0.05);
  const net = row.net_amount !== null && row.net_amount !== undefined ? Number(row.net_amount) : Math.round(gross - tds - admin - rp);

  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: gross,
    tdsAmount: tds,
    adminCharge: admin,
    rpWalletAmount: rp,
    netAmount: net,
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
      [memberId]
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
    const res = await client.query("SELECT * FROM users WHERE mobile = $1 LIMIT 1", [mobile]);
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0]);
  } finally {
    client.release();
  }
}

export async function findUserByIdentifier(identifier: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM users WHERE UPPER(member_id) = UPPER($1) OR mobile = $1 LIMIT 1",
      [identifier]
    );
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0]);
  } finally {
    client.release();
  }
}

export async function checkMemberIdExists(memberId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT 1 FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1",
      [memberId]
    );
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function saveUser(user: User): Promise<User> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date,
        personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
        binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      )
      ON CONFLICT (member_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        mobile = EXCLUDED.mobile,
        wallet_balance = EXCLUDED.wallet_balance,
        total_earnings = EXCLUDED.total_earnings,
        updated_at = NOW();
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
        user.personalPv || 0,
        user.leftPv || 0,
        user.rightPv || 0,
        user.carryLeftPv || 0,
        user.carryRightPv || 0,
        user.binaryParentId || null,
        user.binaryPosition || null,
        user.leftChildId || null,
        user.rightChildId || null,
        user.dailyCapping || 1000,
      ]
    );

    // If binary parent is defined, link parent's left_child_id or right_child_id
    if (user.binaryParentId && user.binaryPosition) {
      const childCol = user.binaryPosition === "LEFT" ? "left_child_id" : "right_child_id";
      await client.query(
        `UPDATE users SET ${childCol} = $1, updated_at = NOW() WHERE id = $2`,
        [user.id, user.binaryParentId]
      );
    }

    // If user has a sponsor, update sponsor's metrics
    if (user.sponsorId) {
      await client.query(
        `
        UPDATE users 
        SET 
          direct_referrals_count = direct_referrals_count + 1,
          total_team_count = total_team_count + 1,
          updated_at = NOW()
        WHERE UPPER(member_id) = UPPER($1)
      `,
        [user.sponsorId]
      );
    }

    await client.query("COMMIT");
    return user;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToOrder(row: any): Order {
  let parsedItems = [];
  if (row.items) {
    try {
      parsedItems = typeof row.items === "string" ? JSON.parse(row.items) : row.items;
    } catch {
      parsedItems = [];
    }
  }
  return {
    id: row.id,
    userId: row.user_id,
    memberId: row.member_id || "",
    billedBy: row.billed_by || "",
    buyerName: row.buyer_name || "",
    buyerMobile: row.buyer_mobile || "",
    buyerAddress: row.buyer_address || "",
    buyerCity: row.buyer_city || "",
    buyerState: row.buyer_state || "",
    buyerPincode: row.buyer_pincode || "",
    customerName: row.customer_name || "",
    customerMobile: row.customer_mobile || "",
    shippingAddress: row.shipping_address || "",
    transactionId: row.transaction_id || "",
    paymentSlip: row.payment_slip || "",
    rejectionReason: row.rejection_reason || "",
    purchaseType: row.purchase_type,
    packageName: row.package_name,
    amount: Number(row.amount || 0),
    pv: Number(row.pv || 0),
    items: parsedItems,
    status: row.status || "COMPLETED",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function getOrdersForUser(userId: string, memberId?: string): Promise<Order[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        o.*, 
        u.member_id,
        b.full_name as buyer_name,
        b.mobile as buyer_mobile,
        b.address as buyer_address,
        b.city as buyer_city,
        b.state as buyer_state,
        b.pincode as buyer_pincode
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
      WHERE o.user_id = $1
    `;
    const params: unknown[] = [userId];

    if (memberId) {
      query += ` OR UPPER(o.billed_by) = UPPER($2)`;
      params.push(memberId);
    }

    query += ` ORDER BY o.created_at DESC LIMIT 100`;

    const res = await client.query(query, params);
    return res.rows.map(mapRowToOrder);
  } finally {
    client.release();
  }
}
