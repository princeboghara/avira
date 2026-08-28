import { Pool } from "pg";
import { User, Transaction, Order } from "@/types";

const DEFAULT_DATABASE_URL =
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

function getConnectionString(): string {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
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
    fundWallet: Number(row.fund_wallet || 0),
    totalEarnings: Number(row.total_earnings || 0),
    directReferralsCount: Number(row.direct_referrals_count || 0),
    totalTeamCount: Number(row.total_team_count || 0),
    todayEarnings: Number(row.today_earnings || 0),
    joinedDate: row.joined_date,

    // Binary Fields (from user_binary_pv)
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

    // KYC and Banking (from user_kyc)
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
      "SELECT * FROM v_users_full WHERE UPPER(member_id) = UPPER($1) LIMIT 1",
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
    const res = await client.query("SELECT * FROM v_users_full WHERE mobile = $1 LIMIT 1", [mobile]);
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
      "SELECT * FROM v_users_full WHERE UPPER(member_id) = UPPER($1) OR mobile = $1 LIMIT 1",
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

    // 1. Insert or update core user record in users
    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, email, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, address, role, status, avatar_url, joined_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
      )
      ON CONFLICT (member_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        mobile = EXCLUDED.mobile,
        email = EXCLUDED.email,
        pincode = EXCLUDED.pincode,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        address = EXCLUDED.address,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    `,
      [
        user.id,
        user.memberId,
        user.fullName,
        user.mobile,
        user.email || null,
        user.passwordHash || "",
        user.sponsorId || null,
        user.sponsorName || null,
        user.pincode,
        user.city,
        user.state,
        user.address || "",
        user.role || "MEMBER",
        user.status || "ACTIVE",
        user.avatarUrl || null,
        user.joinedDate,
      ]
    );

    // 2. Insert or update user_wallets
    await client.query(
      `
      INSERT INTO user_wallets (
        user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings, direct_referrals_count, total_team_count, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        wallet_balance = EXCLUDED.wallet_balance,
        rp_wallet = EXCLUDED.rp_wallet,
        fund_wallet = EXCLUDED.fund_wallet,
        total_earnings = EXCLUDED.total_earnings,
        today_earnings = EXCLUDED.today_earnings,
        direct_referrals_count = EXCLUDED.direct_referrals_count,
        total_team_count = EXCLUDED.total_team_count,
        updated_at = NOW();
    `,
      [
        user.id,
        user.walletBalance || 0,
        user.rpWallet || 0,
        user.fundWallet || 0,
        user.totalEarnings || 0,
        user.todayEarnings || 0,
        user.directReferralsCount || 0,
        user.totalTeamCount || 0,
      ]
    );

    // 3. Insert or update user_binary_pv
    await client.query(
      `
      INSERT INTO user_binary_pv (
        user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
        binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        personal_pv = EXCLUDED.personal_pv,
        left_pv = EXCLUDED.left_pv,
        right_pv = EXCLUDED.right_pv,
        carry_left_pv = EXCLUDED.carry_left_pv,
        carry_right_pv = EXCLUDED.carry_right_pv,
        binary_parent_id = EXCLUDED.binary_parent_id,
        binary_position = EXCLUDED.binary_position,
        left_child_id = EXCLUDED.left_child_id,
        right_child_id = EXCLUDED.right_child_id,
        daily_capping = EXCLUDED.daily_capping,
        updated_at = NOW();
    `,
      [
        user.id,
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

    // 4. Insert or update user_kyc
    await client.query(
      `
      INSERT INTO user_kyc (
        user_id, pan_number, pan_card_url, pan_status, pan_rejection_reason,
        aadhaar_number, aadhaar_name, aadhaar_front_url, aadhaar_back_url, aadhaar_status, aadhaar_rejection_reason,
        bank_name, bank_account_number, ifsc_code, bank_proof_url, bank_status, bank_rejection_reason,
        upi_id, gst_number, nominee_name, nominee_relation,
        kyc_status, kyc_document_url, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        pan_number = COALESCE(EXCLUDED.pan_number, user_kyc.pan_number),
        pan_card_url = COALESCE(EXCLUDED.pan_card_url, user_kyc.pan_card_url),
        pan_status = COALESCE(EXCLUDED.pan_status, user_kyc.pan_status),
        aadhaar_number = COALESCE(EXCLUDED.aadhaar_number, user_kyc.aadhaar_number),
        aadhaar_name = COALESCE(EXCLUDED.aadhaar_name, user_kyc.aadhaar_name),
        aadhaar_front_url = COALESCE(EXCLUDED.aadhaar_front_url, user_kyc.aadhaar_front_url),
        aadhaar_back_url = COALESCE(EXCLUDED.aadhaar_back_url, user_kyc.aadhaar_back_url),
        aadhaar_status = COALESCE(EXCLUDED.aadhaar_status, user_kyc.aadhaar_status),
        bank_name = COALESCE(EXCLUDED.bank_name, user_kyc.bank_name),
        bank_account_number = COALESCE(EXCLUDED.bank_account_number, user_kyc.bank_account_number),
        ifsc_code = COALESCE(EXCLUDED.ifsc_code, user_kyc.ifsc_code),
        bank_proof_url = COALESCE(EXCLUDED.bank_proof_url, user_kyc.bank_proof_url),
        bank_status = COALESCE(EXCLUDED.bank_status, user_kyc.bank_status),
        upi_id = COALESCE(EXCLUDED.upi_id, user_kyc.upi_id),
        gst_number = COALESCE(EXCLUDED.gst_number, user_kyc.gst_number),
        nominee_name = COALESCE(EXCLUDED.nominee_name, user_kyc.nominee_name),
        nominee_relation = COALESCE(EXCLUDED.nominee_relation, user_kyc.nominee_relation),
        kyc_status = COALESCE(EXCLUDED.kyc_status, user_kyc.kyc_status),
        kyc_document_url = COALESCE(EXCLUDED.kyc_document_url, user_kyc.kyc_document_url),
        updated_at = NOW();
    `,
      [
        user.id,
        user.panNumber || null,
        user.panCardUrl || null,
        user.panStatus || "NOT_SUBMITTED",
        user.panRejectionReason || null,
        user.aadhaarNumber || null,
        user.aadhaarName || null,
        user.aadhaarFrontUrl || null,
        user.aadhaarBackUrl || null,
        user.aadhaarStatus || "NOT_SUBMITTED",
        user.aadhaarRejectionReason || null,
        user.bankName || null,
        user.bankAccountNumber || null,
        user.ifscCode || null,
        user.bankProofUrl || null,
        user.bankStatus || "NOT_SUBMITTED",
        user.bankRejectionReason || null,
        user.upiId || null,
        user.gstNumber || null,
        user.nomineeName || null,
        user.nomineeRelation || null,
        user.kycStatus || "NOT_SUBMITTED",
        user.kycDocumentUrl || null,
      ]
    );

    // 5. If binary parent is defined, link parent's left_child_id or right_child_id in user_binary_pv
    if (user.binaryParentId && user.binaryPosition) {
      const childCol = user.binaryPosition === "LEFT" ? "left_child_id" : "right_child_id";
      await client.query(
        `UPDATE user_binary_pv SET ${childCol} = $1, updated_at = NOW() WHERE user_id = $2`,
        [user.id, user.binaryParentId]
      );
    }

    // 6. If user has a sponsor, update sponsor's metrics in user_wallets
    if (user.sponsorId) {
      await client.query(
        `
        UPDATE user_wallets 
        SET 
          direct_referrals_count = direct_referrals_count + 1,
          total_team_count = total_team_count + 1,
          updated_at = NOW()
        WHERE user_id = (SELECT id FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1)
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
