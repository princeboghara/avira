const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join("D:\\aviracare\\avira", file);
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

async function resetFields() {
  const client = await pool.connect();
  try {
    console.log("Resetting WALLET BALANCE, TOTAL EARNINGS, LEFT/RIGHT PV, CARRY FORWARD PV, ADDRESS, and RP WALLET across all users...");

    await client.query("BEGIN");

    const result = await client.query(`
      UPDATE users
      SET
        wallet_balance = 0.00,
        total_earnings = 0.00,
        today_earnings = 0.00,
        left_pv = 0.00,
        right_pv = 0.00,
        carry_left_pv = 0.00,
        carry_right_pv = 0.00,
        rp_wallet = 0.00,
        address = NULL,
        updated_at = NOW()
    `);

    await client.query("COMMIT");
    console.log(`✅ Successfully cleared specified fields for all ${result.rowCount} users!`);

    // Verify AV0001 and random user
    const check = await client.query(`
      SELECT member_id, full_name, wallet_balance, total_earnings, left_pv, right_pv, carry_left_pv, carry_right_pv, rp_wallet, address
      FROM users
      WHERE member_id IN ('AV0001', 'AV43341', 'AV94925')
    `);
    console.log("\nVerification of reset fields:");
    console.table(check.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error resetting fields:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetFields();
