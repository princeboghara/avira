const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, "..", file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = (match[2] || "").trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  }
}
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function backupAndClearForTest() {
  const client = await pool.connect();
  try {
    console.log("================================================================");
    console.log(" 📦 AVIRA LIFECARE: BACKUP OLD DATA & PREPARE CLEAN TEST MODE");
    console.log("================================================================");

    // 1. Ensure Backups Directory
    const backupDir = path.join(__dirname, "..", "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonBackupFile = path.join(backupDir, `backup_full_${timestamp}.json`);
    const latestBackupFile = path.join(backupDir, `backup_latest.json`);

    const tablesToBackup = [
      "users",
      "user_wallets",
      "user_kyc",
      "user_binary_pv",
      "orders",
      "transactions",
      "fund_requests",
      "support_tickets",
    ];

    const backupData = {
      createdAt: new Date().toISOString(),
      counts: {},
      tables: {},
    };

    console.log("\n1. Exporting current database data to JSON backup...");
    for (const tableName of tablesToBackup) {
      try {
        const res = await client.query(`SELECT * FROM "${tableName}"`);
        backupData.tables[tableName] = res.rows;
        backupData.counts[tableName] = res.rows.length;
        console.log(`   - Backed up ${tableName.padEnd(20)}: ${res.rows.length} rows`);
      } catch (err) {
        console.warn(`   ⚠️ Table ${tableName} could not be queried:`, err.message);
      }
    }

    fs.writeFileSync(jsonBackupFile, JSON.stringify(backupData, null, 2), "utf-8");
    fs.writeFileSync(latestBackupFile, JSON.stringify(backupData, null, 2), "utf-8");
    console.log(`\n✅ Backup successfully saved to:\n   ${jsonBackupFile}\n   ${latestBackupFile}`);

    console.log("\n2. Creating SQL backup tables inside PostgreSQL...");
    await client.query("BEGIN");

    for (const tableName of tablesToBackup) {
      try {
        await client.query(`DROP TABLE IF EXISTS "_backup_${tableName}" CASCADE;`);
        await client.query(`CREATE TABLE "_backup_${tableName}" AS TABLE "${tableName}";`);
        console.log(`   - Created database backup table: _backup_${tableName}`);
      } catch (err) {
        console.warn(`   ⚠️ Error creating _backup_${tableName}:`, err.message);
      }
    }

    // 3. Clear Old Activity Data
    console.log("\n3. Clearing operational data for clean testing...");
    await client.query("DELETE FROM support_tickets;");
    await client.query("DELETE FROM fund_requests;");
    await client.query("DELETE FROM transactions;");
    await client.query("DELETE FROM orders;");
    
    // Clear user child tables & users
    await client.query("DELETE FROM user_binary_pv;");
    await client.query("DELETE FROM user_kyc;");
    await client.query("DELETE FROM user_wallets;");
    await client.query("DELETE FROM users;");
    console.log("   - Cleared orders, transactions, tickets, fund requests & user records.");

    // 4. Initialize Clean Root Master Admin Account (AV00001)
    console.log("\n4. Initializing fresh Root Admin Account (AV00001)...");
    const masterPasswordHash = await bcrypt.hash("123123", 10);
    const rootUserId = "usr_avira_root_master";

    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, joined_date, created_at, updated_at
      ) VALUES (
        $1, 'AV00001', 'Avira Lifecare Master', '9712326273',
        $2, NULL, 'Avira Lifecare Global Private Limited',
        '395006', 'Surat', 'Gujarat', 'ADMIN', 'ACTIVE',
        TO_CHAR(NOW(), 'YYYY-MM-DD'), NOW(), NOW()
      );
    `, [rootUserId, masterPasswordHash]);

    await client.query(`
      INSERT INTO user_wallets (
        user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings,
        direct_referrals_count, total_team_count, updated_at
      ) VALUES (
        $1, 0.00, 0.00, 0.00, 0.00, 0.00, 0, 0, NOW()
      );
    `, [rootUserId]);

    await client.query(`
      INSERT INTO user_binary_pv (
        user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
        binary_parent_id, binary_position, left_child_id, right_child_id,
        daily_capping, last_cutoff_at, updated_at
      ) VALUES (
        $1, 1000.00, 0.00, 0.00, 0.00, 0.00,
        NULL, 'ROOT', NULL, NULL,
        5000.00, NOW(), NOW()
      );
    `, [rootUserId]);

    await client.query(`
      INSERT INTO user_kyc (
        user_id, kyc_status, pan_status, aadhaar_status, bank_status, updated_at
      ) VALUES (
        $1, 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', NOW()
      );
    `, [rootUserId]);

    await client.query("COMMIT");

    console.log("\n5. Verifying Clean Test State...");
    const counts = await client.query(`
      SELECT 
        (SELECT count(*) FROM users) as users_count,
        (SELECT count(*) FROM orders) as orders_count,
        (SELECT count(*) FROM transactions) as transactions_count,
        (SELECT count(*) FROM fund_requests) as fund_requests_count,
        (SELECT count(*) FROM products) as products_count,
        (SELECT count(*) FROM categories) as categories_count
    `);

    console.table(counts.rows[0]);

    console.log("================================================================");
    console.log(" 🎉 CLEAN TEST ENVIRONMENT IS READY!");
    console.log("================================================================");
    console.log("🔑 Master Login Credentials:");
    console.log("   - Member ID: AV00001");
    console.log("   - Password:  123123");
    console.log("   - Mobile:    9712326273");
    console.log("   - Role:      ADMIN");
    console.log("\n💡 All previous data is safely preserved in:");
    console.log(`   - File: backups/backup_latest.json`);
    console.log(`   - Tables: _backup_users, _backup_orders, etc.`);
    console.log(`   - To restore later, run: node scripts/restore_production_data.js`);
    console.log("================================================================");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FATAL ERROR backing up and clearing data:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

backupAndClearForTest();
