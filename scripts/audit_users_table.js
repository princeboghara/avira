const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function auditUsers() {
  const client = await pool.connect();
  try {
    console.log("=== COMPREHENSIVE USERS TABLE AUDIT ===");

    // 1. Check Member IDs
    const sampleIds = await client.query("SELECT member_id, full_name, id FROM users ORDER BY created_at ASC LIMIT 10");
    console.log("\n1. Sample Member IDs & Names in DB:");
    console.table(sampleIds.rows);

    // 2. Check if any dummy mobiles (980000...) remain
    const dummyMobiles = await client.query("SELECT COUNT(*) FROM users WHERE mobile LIKE '980000%'");
    console.log(`\n2. Dummy mobile numbers (starting with 980000): ${dummyMobiles.rows[0].count}`);

    // 3. Check dummy addresses ('Avira Lifecare Network')
    const dummyAddresses = await client.query("SELECT COUNT(*) FROM users WHERE address = 'Avira Lifecare Network' OR address IS NULL OR address = ''");
    console.log(`\n3. Default or Empty addresses: ${dummyAddresses.rows[0].count} / 1639`);

    // 4. Check dummy cities/states ('Surat' / 'Gujarat')
    const defaultCities = await client.query("SELECT city, count(*) FROM users GROUP BY city ORDER BY count DESC LIMIT 5");
    console.log("\n4. Top Cities:");
    console.table(defaultCities.rows);

    // 5. Check joining dates
    const dates = await client.query("SELECT joined_date, count(*) FROM users GROUP BY joined_date ORDER BY count DESC LIMIT 5");
    console.log("\n5. Joining Dates:");
    console.table(dates.rows);

    // 6. Check earnings fields
    const earnings = await client.query("SELECT COUNT(*) as zero_total_earnings FROM users WHERE total_earnings = 0");
    console.log(`\n6. Members with total_earnings = 0: ${earnings.rows[0].zero_total_earnings} / 1639`);

    // 7. Check KYC document URLs (Cloudinary images)
    const docs = await client.query("SELECT COUNT(*) as with_pan_image FROM users WHERE pan_card_url IS NOT NULL");
    console.log(`\n7. Members with uploaded PAN image URLs: ${docs.rows[0].with_pan_image} / 1639`);

    // 8. Look at 3 random regular members
    const randomMembers = await client.query("SELECT member_id, full_name, mobile, email, sponsor_id, sponsor_name, wallet_balance, rp_wallet, city, state, pincode, pan_number, bank_name, bank_account_number FROM users WHERE member_id IN ('AV43341', 'AV72516', 'AV94925')");
    console.log("\n8. Sample Real Members in DB:");
    console.table(randomMembers.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

auditUsers();
