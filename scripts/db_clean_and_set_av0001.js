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

async function resetToSoleAV0001() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("1. Deleting all transactions, payouts, orders...");
    await client.query("DELETE FROM transactions");
    await client.query("DELETE FROM payouts");
    await client.query("DELETE FROM orders");

    console.log("2. Resetting binary parent/children links...");
    await client.query(`
      UPDATE users 
      SET binary_parent_id = NULL,
          left_child_id = NULL,
          right_child_id = NULL
    `);

    console.log("3. Deleting non-root members...");
    await client.query(`
      DELETE FROM users 
      WHERE member_id NOT IN ('AV00001', 'AV0001')
    `);

    const passwordHash = await bcrypt.hash("123123", 10);

    console.log("4. Inserting or updating AV0001 as root user...");
    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, email, mobile, password_hash, role, status, kyc_status,
        aadhaar_status, pan_status, bank_status, sponsor_id, sponsor_name,
        binary_parent_id, left_child_id, right_child_id,
        left_pv, right_pv, carry_left_pv, carry_right_pv, personal_pv,
        wallet_balance, today_earnings, total_earnings, rp_wallet, daily_capping,
        address, pincode, state, city, bank_name, bank_account_number, ifsc_code, upi_id,
        joined_date, created_at, updated_at
      ) VALUES (
        'usr_av0001_root', 'AV0001', 'Avira Lifecare Global Private Limited',
        'admin@aviracare.com', '9999999999', $1, 'MEMBER', 'ACTIVE', 'VERIFIED',
        'VERIFIED', 'VERIFIED', 'VERIFIED', '', 'Company Direct',
        NULL, NULL, NULL,
        0, 0, 0, 0, 100,
        0.00, 0.00, 0.00, 0.00, 1000,
        'Corporate Headquarters, Avira Lifecare Global', '395006', 'Gujarat', 'Surat',
        'State Bank of India', '123456789012', 'SBIN0001234', 'avira@upi',
        NOW(), NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        member_id = 'AV0001',
        full_name = 'Avira Lifecare Global Private Limited',
        email = 'admin@aviracare.com',
        mobile = '9999999999',
        password_hash = EXCLUDED.password_hash,
        role = 'MEMBER',
        status = 'ACTIVE',
        kyc_status = 'VERIFIED',
        aadhaar_status = 'VERIFIED',
        pan_status = 'VERIFIED',
        bank_status = 'VERIFIED',
        sponsor_id = '',
        sponsor_name = 'Company Direct',
        binary_parent_id = NULL,
        left_child_id = NULL,
        right_child_id = NULL,
        left_pv = 0,
        right_pv = 0,
        carry_left_pv = 0,
        carry_right_pv = 0,
        personal_pv = 100,
        wallet_balance = 0.00,
        today_earnings = 0.00,
        total_earnings = 0.00,
        rp_wallet = 0.00,
        daily_capping = 1000,
        updated_at = NOW();
    `, [passwordHash]);

    // Delete any old AV00001 if id was different
    await client.query(`
      DELETE FROM users 
      WHERE member_id = 'AV00001' AND id != 'usr_av0001_root'
    `);

    await client.query("COMMIT");

    const usersRes = await client.query("SELECT id, member_id, full_name, personal_pv, wallet_balance, status FROM users");
    console.log("SUCCESS! FINAL USERS IN DB:", usersRes.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error setting up AV0001:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetToSoleAV0001();
