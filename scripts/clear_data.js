const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, "..", file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = (match[2] || "").trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  }
}
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function clearData() {
  const client = await pool.connect();
  try {
    console.log("================================================================");
    console.log(" 🧹 AVIRA LIFECARE: ERASING TEST DATA & RESETTING CLEAN STATE");
    console.log("================================================================");

    await client.query("BEGIN");

    // 1. Clear operational tables
    console.log("1. Clearing test operational data...");
    await client.query("DELETE FROM payouts;");
    await client.query("DELETE FROM support_tickets;");
    await client.query("DELETE FROM fund_requests;");
    await client.query("DELETE FROM transactions;");
    await client.query("DELETE FROM orders;");
    
    // Clear user child tables & users
    await client.query("DELETE FROM user_binary_pv;");
    await client.query("DELETE FROM user_kyc;");
    await client.query("DELETE FROM user_wallets;");
    await client.query("DELETE FROM users;");
    console.log("   - Cleared payouts, orders, transactions, tickets, fund requests & user records.");

    // 2. Initialize Clean Root Master Admin Account (AV0001)
    console.log("\n2. Initializing fresh Root Admin Account (AV0001)...");
    const masterPasswordHash = await bcrypt.hash("123123", 10);
    const rootUserId = "usr_avira_root_master";

    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, joined_date, created_at, updated_at
      ) VALUES (
        $1, 'AV0001', 'Avira Lifecare Master', '9712326273',
        $2, NULL, 'Avira Lifecare Global Private Limited',
        '395006', 'Surat', 'Gujarat', 'ADMIN', 'ACTIVE',
        TO_CHAR(NOW(), 'YYYY-MM-DD'), NOW(), NOW()
      );
    `, [rootUserId, masterPasswordHash]);

    await client.query(`
      INSERT INTO user_wallets (
        user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings,
        direct_referrals_count, total_team_count, updated_at
      ) VALUES (
        $1, 0.00, 0.00, 0.00, 0.00, 0.00, 0, 0, NOW()
      );
    `, [rootUserId]);

    await client.query(`
      INSERT INTO user_binary_pv (
        user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
        binary_parent_id, binary_position, left_child_id, right_child_id,
        daily_capping, last_cutoff_at, updated_at
      ) VALUES (
        $1, 1000.00, 0.00, 0.00, 0.00, 0.00,
        NULL, 'ROOT', NULL, NULL,
        5000.00, NOW(), NOW()
      );
    `, [rootUserId]);

    await client.query(`
      INSERT INTO user_kyc (
        user_id, kyc_status, pan_status, aadhaar_status, bank_status, updated_at
      ) VALUES (
        $1, 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', NOW()
      );
    `, [rootUserId]);

    await client.query("COMMIT");

    console.log("\n3. Verifying Clean Database State...");
    const counts = await client.query(`
      SELECT 
        (SELECT count(*) FROM users) as users_count,
        (SELECT count(*) FROM user_wallets) as wallets_count,
        (SELECT count(*) FROM user_binary_pv) as binary_pv_count,
        (SELECT count(*) FROM user_kyc) as kyc_count,
        (SELECT count(*) FROM orders) as orders_count,
        (SELECT count(*) FROM transactions) as transactions_count,
        (SELECT count(*) FROM payouts) as payouts_count,
        (SELECT count(*) FROM fund_requests) as fund_requests_count,
        (SELECT count(*) FROM products) as products_count,
        (SELECT count(*) FROM categories) as categories_count
    `);

    console.table(counts.rows[0]);

    console.log("================================================================");
    console.log(" ✅ ALL TEST DATA SUCCESSFULLY ERASED & CLEAN STATE INITIALIZED!");
    console.log("================================================================");
    console.log("🔑 Master Root Admin Login Credentials:");
    console.log("   - Member ID: AV0001");
    console.log("   - Password:  123123");
    console.log("   - Mobile:    9712326273");
    console.log("   - Role:      ADMIN");
    console.log("================================================================");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FATAL ERROR clearing data:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

clearData();
