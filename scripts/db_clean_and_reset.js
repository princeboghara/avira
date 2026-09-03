require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function cleanAndReset() {
  const client = await pool.connect();
  try {
    console.log('--- STARTING COMPLETE DATABASE CLEANUP ---');

    await client.query('BEGIN');

    // 1. Drop all backup tables
    const backupTables = [
      '_backup_fund_requests',
      '_backup_orders',
      '_backup_support_tickets',
      '_backup_transactions',
      '_backup_user_binary_pv',
      '_backup_user_kyc',
      '_backup_user_wallets',
      '_backup_users',
    ];

    for (const tbl of backupTables) {
      console.log(`Dropping table if exists: ${tbl}`);
      await client.query(`DROP TABLE IF EXISTS "${tbl}" CASCADE;`);
    }

    // 2. Truncate user and transaction tables (Keep products, categories, hsn_codes, system_settings)
    console.log('Truncating all user, order, kyc, binary, and transaction tables...');
    await client.query(`
      TRUNCATE TABLE 
        transactions,
        payouts,
        fund_requests,
        support_tickets,
        orders,
        user_kyc,
        user_wallets,
        user_binary_pv,
        users
      CASCADE;
    `);

    // 3. Seed Main Member (AV0001)
    const memberPasswordHash = bcrypt.hashSync('156951', 10);

    // Main Member (AV0001)
    console.log('Seeding Main Member (AV0001 - pass: 156951)...');
    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, email, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, address, role, status, joined_date, created_at, updated_at
      ) VALUES (
        'usr_main_member_001',
        'AV0001',
        'Avira Principal Member',
        '9876543210',
        'member@aviralifecare.com',
        $1,
        'AV10001',
        'Avira Enterprise Administrator',
        '395001',
        'Surat',
        'Gujarat',
        'Avira Life Care Associate Residence',
        'MEMBER',
        'ACTIVE',
        '2024-01-01',
        NOW(),
        NOW()
      );
    `, [memberPasswordHash]);

    await client.query(`
      INSERT INTO user_wallets (user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings, direct_referrals_count, total_team_count, updated_at)
      VALUES ('usr_main_member_001', 0.00, 0.00, 0.00, 0.00, 0.00, 0, 0, NOW());
    `);
    await client.query(`
      INSERT INTO user_binary_pv (user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv, daily_capping, updated_at)
      VALUES ('usr_main_member_001', 1000, 0, 0, 0, 0, 5000, NOW());
    `);
    await client.query(`
      INSERT INTO user_kyc (user_id, kyc_status, aadhaar_status, pan_status, bank_status, updated_at)
      VALUES ('usr_main_member_001', 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', NOW());
    `);

    await client.query('COMMIT');
    console.log('--- DATABASE CLEANUP & RESET COMPLETED SUCCESSFULLY ---');

    // 4. Verify table counts
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n=== CURRENT DATABASE STATE ===');
    for (const t of tables.rows) {
      try {
        const c = await client.query(`SELECT count(*) as count FROM "${t.table_name}"`);
        console.log(`Table: ${t.table_name.padEnd(25)} | Rows: ${c.rows[0].count}`);
      } catch (e) {
        console.log(`Table: ${t.table_name.padEnd(25)} | View/Error: ${e.message}`);
      }
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database cleanup failed with error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanAndReset();
