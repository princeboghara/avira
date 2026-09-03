require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function updateSuratHub() {
  const client = await pool.connect();
  try {
    console.log('Connecting to database...');
    
    // Hash password '123456'
    const passwordHash = await bcrypt.hash('123456', 10);
    
    // Delete other shoppies
    await client.query(`DELETE FROM shoppies WHERE shoppy_id != 'AVS01'`);
    console.log('Deleted non-AVS01 shoppies.');

    // Upsert AVS01
    const check = await client.query(`SELECT id FROM shoppies WHERE shoppy_id = 'AVS01'`);
    if (check.rows.length === 0) {
      await client.query(`
        INSERT INTO shoppies (
          id, shoppy_id, store_name, owner_name, mobile, email, password_hash,
          address, city, state, pincode, status, created_at, updated_at
        ) VALUES (
          'shp_surat_hub_01', 'AVS01', 'SURAT PARCEL HUB', 'Hub Manager',
          '9876543210', 'suratparcelhub@aviralifecare.com', $1,
          'Surat Central Logistics & Parcel Hub, Ring Road', 'Surat', 'Gujarat', '395002',
          'ACTIVE', NOW(), NOW()
        )
      `, [passwordHash]);
      console.log('Created SURAT PARCEL HUB (AVS01) with password 123456.');
    } else {
      await client.query(`
        UPDATE shoppies SET
          store_name = 'SURAT PARCEL HUB',
          password_hash = $1,
          status = 'ACTIVE',
          updated_at = NOW()
        WHERE shoppy_id = 'AVS01'
      `, [passwordHash]);
      console.log('Updated SURAT PARCEL HUB (AVS01) with password 123456.');
    }

    // Update any existing orders
    const resOrders = await client.query(`
      UPDATE orders 
      SET shoppy_id = 'AVS01' 
      WHERE status IN ('CONFIRMED', 'PACKING', 'DISPATCHED', 'DELIVERED')
    `);
    console.log(`Updated ${resOrders.rowCount} orders to point to AVS01.`);

    // Verify
    const verify = await client.query(`SELECT shoppy_id, store_name, status FROM shoppies`);
    console.log('Current shoppies:', verify.rows);

  } finally {
    client.release();
    process.exit(0);
  }
}

updateSuratHub().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
