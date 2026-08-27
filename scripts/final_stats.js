const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function printStats() {
  const client = await pool.connect();
  try {
    const total = await client.query("SELECT COUNT(*) FROM users");
    const kyc = await client.query("SELECT COUNT(*) FROM users WHERE kyc_status = 'VERIFIED'");
    const bank = await client.query("SELECT COUNT(*) FROM users WHERE bank_account_number IS NOT NULL AND bank_account_number != ''");
    const wallets = await client.query("SELECT SUM(wallet_balance) as total_e_wallet, SUM(rp_wallet) as total_fund_wallet FROM users");
    console.log("=== FINAL SUPABASE DATABASE STATUS ===");
    console.log(`Total Members: ${total.rows[0].count}`);
    console.log(`Verified KYC Members: ${kyc.rows[0].count}`);
    console.log(`Members with Registered Bank Accounts: ${bank.rows[0].count}`);
    console.log(`Total E-Wallet Across All Members: ₹${wallets.rows[0].total_e_wallet}`);
    console.log(`Total Fund/RP Wallet Across All Members: ₹${wallets.rows[0].total_fund_wallet}`);
  } finally {
    client.release();
    await pool.end();
  }
}

printStats();
