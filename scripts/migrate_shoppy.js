require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Connecting and creating shoppies table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS shoppies (
        id VARCHAR(50) PRIMARY KEY,
        shoppy_id VARCHAR(50) UNIQUE NOT NULL,
        store_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(150),
        password_hash VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_shoppies_shoppy_id ON shoppies(shoppy_id);
      CREATE INDEX IF NOT EXISTS idx_shoppies_mobile ON shoppies(mobile);

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shoppy_id VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shoppy_transferred_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP WITH TIME ZONE;

      CREATE INDEX IF NOT EXISTS idx_orders_shoppy_id ON orders(shoppy_id);
    `);
    console.log('Shoppy migration executed successfully!');
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
