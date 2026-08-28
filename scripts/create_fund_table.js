require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  console.log("🚀 Creating fund_requests table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fund_requests (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      member_id VARCHAR(32) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      amount NUMERIC NOT NULL,
      transaction_id VARCHAR(100) NOT NULL,
      slip_url TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      approved_at TIMESTAMP WITH TIME ZONE,
      approved_by VARCHAR(64)
    );

    CREATE INDEX IF NOT EXISTS idx_fund_requests_user_id ON fund_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_fund_requests_member_id ON fund_requests(member_id);
    CREATE INDEX IF NOT EXISTS idx_fund_requests_status ON fund_requests(status);
  `);

  console.log("✅ fund_requests table and indexes created successfully!");
}

migrate()
  .catch(err => console.error("Migration error:", err))
  .finally(() => pool.end());
