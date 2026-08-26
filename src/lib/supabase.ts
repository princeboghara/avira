import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function initSupabaseDatabase() {
  const client = await pool.connect();
  try {
    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        member_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        sponsor_id VARCHAR(20),
        sponsor_name VARCHAR(255),
        pincode VARCHAR(10) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'MEMBER',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        wallet_balance NUMERIC(15, 2) DEFAULT 500.00,
        total_earnings NUMERIC(15, 2) DEFAULT 500.00,
        direct_referrals_count INT DEFAULT 0,
        total_team_count INT DEFAULT 0,
        today_earnings NUMERIC(15, 2) DEFAULT 500.00,
        joined_date VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
      CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON users(sponsor_id);
    `);

    // 2. Create Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'COMPLETED',
        date VARCHAR(30) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);

    console.log("Supabase PostgreSQL tables initialized successfully.");
  } finally {
    client.release();
  }
}
