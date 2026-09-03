require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function seedShoppy() {
  const client = await pool.connect();
  try {
    const existing = await client.query(`SELECT id FROM shoppies WHERE shoppy_id = 'SHP1001' LIMIT 1`);
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash('123123', 10);
      await client.query(`
        INSERT INTO shoppies (
          id, shoppy_id, store_name, owner_name, mobile, email, password_hash,
          address, city, state, pincode, status, created_at, updated_at
        ) VALUES (
          'shp_demo_001', 'SHP1001', 'Avira LifeCare Hub Surat', 'Ramesh Patel',
          '9876543210', 'shoppy.surat@aviralifecare.com', $1,
          'Shop No 14, Emerald Trade Center, Ring Road', 'Surat', 'Gujarat', '395002',
          'ACTIVE', NOW(), NOW()
        )
      `, [passwordHash]);
      console.log('Demo Shoppy (SHP1001 / pass: 123123) seeded successfully!');
    } else {
      console.log('Shoppy SHP1001 already exists.');
    }
  } finally {
    client.release();
    process.exit(0);
  }
}

seedShoppy().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
