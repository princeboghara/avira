require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function cleanupColumns() {
  console.log("🚀 Cleaning up bloated columns from users table...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Drop KYC columns from users (they are safely in user_kyc)
    const kycCols = [
      "pan_number", "aadhaar_number", "bank_name", "bank_account_number", "ifsc_code",
      "upi_id", "nominee_name", "nominee_relation", "kyc_document_url", "kyc_status",
      "kyc_submitted_at", "kyc_verified_at", "kyc_rejection_reason", "gst_number",
      "aadhaar_name", "aadhaar_front_url", "aadhaar_back_url", "pan_card_url",
      "bank_proof_url", "aadhaar_status", "pan_status", "bank_status",
      "aadhaar_rejection_reason", "pan_rejection_reason", "bank_rejection_reason"
    ];

    // Drop Binary & PV columns from users (they are safely in user_binary_pv)
    const binaryCols = [
      "personal_pv", "left_pv", "right_pv", "carry_left_pv", "carry_right_pv",
      "binary_parent_id", "binary_position", "left_child_id", "right_child_id", "daily_capping"
    ];

    // Drop Wallet & Income columns from users (they are safely in user_wallets)
    const walletCols = [
      "wallet_balance", "total_earnings", "direct_referrals_count", "total_team_count",
      "today_earnings", "rp_wallet", "fund_balance", "fund_wallet"
    ];

    const allToDrop = [...kycCols, ...binaryCols, ...walletCols];

    // Drop and recreate view to ensure clean schema dependency
    await client.query("DROP VIEW IF EXISTS v_users_full CASCADE;");

    for (const col of allToDrop) {
      await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS "${col}" CASCADE;`);
    }

    // Recreate clean View v_users_full
    console.log("Recreating clean View v_users_full...");
    await client.query(`
      CREATE OR REPLACE VIEW v_users_full AS
      SELECT 
        u.id,
        u.member_id,
        u.full_name,
        u.mobile,
        u.email,
        u.password_hash,
        u.sponsor_id,
        u.sponsor_name,
        u.pincode,
        u.city,
        u.state,
        u.address,
        u.role,
        u.status,
        u.avatar_url,
        u.joined_date,
        u.created_at,
        u.updated_at,
        -- Wallets
        COALESCE(w.wallet_balance, 0)::numeric AS wallet_balance,
        COALESCE(w.rp_wallet, 0)::numeric AS rp_wallet,
        COALESCE(w.fund_wallet, 0)::numeric AS fund_wallet,
        COALESCE(w.total_earnings, 0)::numeric AS total_earnings,
        COALESCE(w.today_earnings, 0)::numeric AS today_earnings,
        COALESCE(w.direct_referrals_count, 0)::int AS direct_referrals_count,
        COALESCE(w.total_team_count, 0)::int AS total_team_count,
        -- Binary MLM PV
        COALESCE(b.personal_pv, 0)::numeric AS personal_pv,
        COALESCE(b.left_pv, 0)::numeric AS left_pv,
        COALESCE(b.right_pv, 0)::numeric AS right_pv,
        COALESCE(b.carry_left_pv, 0)::numeric AS carry_left_pv,
        COALESCE(b.carry_right_pv, 0)::numeric AS carry_right_pv,
        b.binary_parent_id,
        b.binary_position,
        b.left_child_id,
        b.right_child_id,
        COALESCE(b.daily_capping, 1000)::numeric AS daily_capping,
        b.last_cutoff_at,
        -- KYC
        k.pan_number,
        k.pan_card_url,
        COALESCE(k.pan_status, 'NOT_SUBMITTED') AS pan_status,
        k.pan_rejection_reason,
        k.aadhaar_number,
        k.aadhaar_name,
        k.aadhaar_front_url,
        k.aadhaar_back_url,
        COALESCE(k.aadhaar_status, 'NOT_SUBMITTED') AS aadhaar_status,
        k.aadhaar_rejection_reason,
        k.bank_name,
        k.bank_account_number,
        k.ifsc_code,
        k.bank_proof_url,
        COALESCE(k.bank_status, 'NOT_SUBMITTED') AS bank_status,
        k.bank_rejection_reason,
        k.upi_id,
        k.gst_number,
        k.nominee_name,
        k.nominee_relation,
        COALESCE(k.kyc_status, 'NOT_SUBMITTED') AS kyc_status,
        k.kyc_document_url,
        k.kyc_submitted_at,
        k.kyc_verified_at,
        k.kyc_rejection_reason
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      LEFT JOIN user_binary_pv b ON u.id = b.user_id
      LEFT JOIN user_kyc k ON u.id = k.user_id;
    `);

    // Recreate indexes on users
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_member_id_upper ON users (UPPER(member_id));
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile);
      CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON users (sponsor_id);
    `);

    await client.query("COMMIT");
    console.log("✅ users table cleaned up and optimized into clean normalized schema!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Cleanup error:", err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

cleanupColumns();
