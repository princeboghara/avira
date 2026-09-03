require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    // 1. Check current direct referrals counts
    const res = await pool.query(`
      SELECT u.id, u.member_id, u.full_name, COUNT(d.id) as direct_count
      FROM users u
      LEFT JOIN users d ON (d.sponsor_id = u.id OR UPPER(d.sponsor_id) = UPPER(u.member_id) OR d.sponsor_id = 'usr_' || u.member_id)
      WHERE u.role != 'ADMIN'
      GROUP BY u.id, u.member_id, u.full_name
      HAVING COUNT(d.id) > 0
      ORDER BY direct_count DESC
      LIMIT 15;
    `);

    console.log('Top 15 members with direct referrals:');
    console.table(res.rows);

    // 2. Update user_wallets direct_referrals_count to match reality
    const updateRes = await pool.query(`
      WITH counts AS (
        SELECT u.id as user_id, COUNT(d.id) as cnt
        FROM users u
        LEFT JOIN users d ON (d.sponsor_id = u.id OR UPPER(d.sponsor_id) = UPPER(u.member_id) OR d.sponsor_id = 'usr_' || u.member_id)
        GROUP BY u.id
      )
      UPDATE user_wallets w
      SET direct_referrals_count = counts.cnt
      FROM counts
      WHERE w.user_id = counts.user_id;
    `);

    console.log('Successfully updated direct_referrals_count in user_wallets for', updateRes.rowCount, 'members.');

    // 3. Check AV0001 (Main member)
    const av1 = await pool.query(`
      SELECT u.member_id, u.full_name, w.direct_referrals_count
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      WHERE u.member_id = 'AV0001';
    `);
    console.log('AV0001 record:', av1.rows[0]);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
