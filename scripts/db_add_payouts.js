const { Pool } = require("pg");
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

async function addPayoutsTable() {
  const client = await pool.connect();
  try {
    console.log("Creating / Updating 'payouts' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS payouts (
        id VARCHAR(100) PRIMARY KEY,
        week_identifier VARCHAR(50) NOT NULL,
        week_start_date DATE NOT NULL,
        week_end_date DATE NOT NULL,
        week_label VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        member_id VARCHAR(20) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20),
        gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        tds_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        admin_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        rp_wallet_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        bank_name VARCHAR(150) DEFAULT '',
        bank_account_number VARCHAR(100) DEFAULT '',
        ifsc_code VARCHAR(50) DEFAULT '',
        upi_id VARCHAR(100) DEFAULT '',
        kyc_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        paid_at TIMESTAMPTZ NULL,
        transaction_reference VARCHAR(100) DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_payouts_week ON payouts(week_identifier);
      CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_member_id ON payouts(member_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
    `);

    console.log("Payouts table created successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

addPayoutsTable();
