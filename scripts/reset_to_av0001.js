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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetRootToAV0001() {
  const client = await pool.connect();
  try {
    console.log("Starting erase and reset to sole AV0001 root member...");

    await client.query("BEGIN");

    // 1. Delete all transactions, payouts, orders
    await client.query("DELETE FROM transactions");
    await client.query("DELETE FROM payouts");
    await client.query("DELETE FROM orders");

    // 2. Unlink parent/child relations in users
    await client.query(`
      UPDATE users 
      SET binary_parent_id = NULL,
          left_child_id = NULL,
          right_child_id = NULL
    `);

    // 3. Delete any other users
    await client.query(`
      DELETE FROM users 
      WHERE id != 'usr_av00001_root' AND member_id NOT IN ('AV00001', 'AV0001')
    `);

    // 4. Update the root user to AV0001 with 100% clean data
    const passwordHash = await bcrypt.hash("123123", 10);

    const updateRes = await client.query(`
      UPDATE users
      SET member_id = 'AV0001',
          full_name = 'Avira Lifecare Global Private Limited',
          password_hash = $1,
          sponsor_id = NULL,
          sponsor_name = 'Avira Lifecare Global Private Limited',
          binary_parent_id = NULL,
          binary_position = 'ROOT',
          left_child_id = NULL,
          right_child_id = NULL,
          personal_pv = 100.00,
          left_pv = 0.00,
          right_pv = 0.00,
          carry_left_pv = 0.00,
          carry_right_pv = 0.00,
          wallet_balance = 0.00,
          today_earnings = 0.00,
          total_earnings = 0.00,
          rp_wallet = 0.00,
          direct_referrals_count = 0,
          total_team_count = 0,
          daily_capping = 1000.00,
          status = 'ACTIVE',
          kyc_status = 'VERIFIED',
          aadhaar_status = 'VERIFIED',
          pan_status = 'VERIFIED',
          bank_status = 'VERIFIED',
          updated_at = NOW()
      WHERE id = 'usr_av00001_root' OR member_id IN ('AV00001', 'AV0001')
      RETURNING id, member_id, full_name, personal_pv, wallet_balance, status;
    `, [passwordHash]);

    await client.query("COMMIT");

    console.log("SUCCESS! AV0001 reset complete:", updateRes.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating root user:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetRootToAV0001();
