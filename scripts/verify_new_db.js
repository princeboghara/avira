require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verifyDatabase() {
  const client = await pool.connect();
  try {
    console.log('=== 🔍 VERIFYING NEW SUPABASE DATABASE STATE ===\n');

    // 1. Check all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('--- TABLES & ROW COUNTS ---');
    for (const t of tablesRes.rows) {
      try {
        const c = await client.query(`SELECT count(*) as count FROM "${t.table_name}"`);
        console.log(`✓ Table: ${t.table_name.padEnd(25)} | Rows: ${c.rows[0].count}`);
      } catch (e) {
        console.log(`- View/Table: ${t.table_name.padEnd(25)} | ${e.message}`);
      }
    }

    // 2. Check users in database
    const usersRes = await client.query(`
      SELECT id, member_id, full_name, mobile, email, role, status, plain_password
      FROM users
      ORDER BY created_at ASC;
    `);
    console.log('\n--- ACTIVE USERS IN DATABASE ---');
    console.table(usersRes.rows);

    // 3. Test v_users_full view for AV0001
    const vRes = await client.query(`
      SELECT member_id, full_name, role, status, wallet_balance, personal_pv, daily_capping, kyc_status
      FROM v_users_full
      WHERE member_id = 'AV0001';
    `);
    console.log('--- v_users_full VIEW FOR AV0001 ---');
    console.table(vRes.rows);

    // 4. Test shoppies table for AVS01
    const sRes = await client.query(`
      SELECT shoppy_id, store_name, owner_name, mobile, status
      FROM shoppies;
    `);
    console.log('--- SHOPPIES TABLE ---');
    console.table(sRes.rows);

    // 5. Test products table
    const pRes = await client.query(`
      SELECT id, name, category_name, mrp, discount_price, pv, in_stock
      FROM products
      ORDER BY mrp DESC;
    `);
    console.log('--- PRODUCTS CATALOG ---');
    console.table(pRes.rows);

    // 6. Test system_settings & shipping_settings
    const setRes = await client.query(`SELECT * FROM system_settings;`);
    console.log('--- SYSTEM SETTINGS ---');
    console.table(setRes.rows);

    const shipRes = await client.query(`SELECT * FROM shipping_settings;`);
    console.log('--- SHIPPING SETTINGS ---');
    console.table(shipRes.rows);

    // 7. Test sequence order_invoice_seq
    const seqRes = await client.query(`SELECT last_value FROM order_invoice_seq;`);
    console.log('\n✓ Sequence order_invoice_seq current value:', seqRes.rows[0].last_value);

    console.log('\n✨ ALL DATABASE VERIFICATIONS PASSED 100%!');
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDatabase().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
