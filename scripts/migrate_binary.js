const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function migrateBinary() {
  const client = await pool.connect();
  try {
    console.log("Adding Binary MLM columns to 'users' table in Supabase...");

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS personal_pv NUMERIC(12, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS left_pv NUMERIC(12, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS right_pv NUMERIC(12, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS carry_left_pv NUMERIC(12, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS carry_right_pv NUMERIC(12, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS binary_parent_id VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS binary_position VARCHAR(10) NULL,
      ADD COLUMN IF NOT EXISTS left_child_id VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS right_child_id VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS daily_capping NUMERIC(10, 2) DEFAULT 1000.00;

      CREATE INDEX IF NOT EXISTS idx_users_binary_parent ON users(binary_parent_id);
      CREATE INDEX IF NOT EXISTS idx_users_left_child ON users(left_child_id);
      CREATE INDEX IF NOT EXISTS idx_users_right_child ON users(right_child_id);

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        purchase_type VARCHAR(20) NOT NULL, -- 'ACTIVATION' | 'REPURCHASE'
        package_name VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        pv NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_mobile_key;
    `);

    // Ensure root AV00001 has default 1000 PV and 5000 capping
    await client.query(`
      UPDATE users 
      SET 
        personal_pv = 1000.00,
        daily_capping = 5000.00,
        binary_parent_id = NULL,
        binary_position = 'ROOT'
      WHERE member_id = 'AV00001';
    `);

    console.log("SUCCESS! Binary columns and orders table migrated to Supabase.");
    const checkCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name LIKE '%pv%' OR column_name LIKE '%binary%' OR column_name LIKE '%child%';
    `);
    console.table(checkCols.rows);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateBinary();
