require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verify() {
  const userCount = await pool.query('SELECT count(*) FROM users');
  const kycCount = await pool.query('SELECT count(*) FROM user_kyc WHERE pan_number IS NOT NULL');
  const aadhaarCount = await pool.query('SELECT count(*) FROM user_kyc WHERE aadhaar_number IS NOT NULL');
  const bankCount = await pool.query('SELECT count(*) FROM user_kyc WHERE bank_account_number IS NOT NULL');
  const walletSum = await pool.query('SELECT sum(wallet_balance) as total_ewallet, sum(fund_wallet) as total_fund FROM user_wallets');
  
  const sampleUsers = await pool.query(`
    SELECT u.member_id, u.full_name, u.mobile, u.email, u.city, u.state,
           k.pan_number, k.aadhaar_number, k.bank_name, k.bank_account_number,
           w.wallet_balance, w.fund_wallet
    FROM users u
    LEFT JOIN user_kyc k ON u.id = k.user_id
    LEFT JOIN user_wallets w ON u.id = w.user_id
    WHERE k.pan_number IS NOT NULL
    LIMIT 5
  `);

  console.log('--- VERIFICATION SUMMARY ---');
  console.log('Total Users in DB:', userCount.rows[0].count);
  console.log('PAN Cards in DB:', kycCount.rows[0].count);
  console.log('Aadhaar Cards in DB:', aadhaarCount.rows[0].count);
  console.log('Bank Accounts in DB:', bankCount.rows[0].count);
  console.log('Total Wallets Balance:', walletSum.rows[0]);
  console.log('\nSample Real Records:');
  console.table(sampleUsers.rows);

  await pool.end();
}

verify().catch(console.error);
