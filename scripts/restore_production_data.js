const { Pool } = require("pg");
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

async function restoreProductionData() {
  const client = await pool.connect();
  try {
    console.log("================================================================");
    console.log(" 🔄 RESTORING PREVIOUS PRODUCTION DATA FROM BACKUP");
    console.log("================================================================");

    const tables = [
      "users",
      "user_wallets",
      "user_kyc",
      "user_binary_pv",
      "orders",
      "transactions",
      "fund_requests",
      "support_tickets",
    ];

    await client.query("BEGIN");

    // Check if _backup_ tables exist
    let restoredFromDb = true;
    for (const t of tables) {
      const checkRes = await client.query(`
        SELECT to_regclass('_backup_${t}') as exists;
      `);
      if (!checkRes.rows[0].exists) {
        restoredFromDb = false;
        break;
      }
    }

    if (restoredFromDb) {
      console.log("1. Restoring directly from database backup tables (_backup_*)...");
      for (const t of tables) {
        await client.query(`TRUNCATE TABLE "${t}" CASCADE;`);
        await client.query(`INSERT INTO "${t}" SELECT * FROM "_backup_${t}";`);
        const count = await client.query(`SELECT count(*) FROM "${t}";`);
        console.log(`   - Restored ${t.padEnd(20)}: ${count.rows[0].count} rows`);
      }
    } else {
      console.log("1. Database backup tables not found. Restoring from backups/backup_latest.json...");
      const backupFile = path.join(__dirname, "..", "backups", "backup_latest.json");
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Backup file not found at: ${backupFile}`);
      }

      const raw = fs.readFileSync(backupFile, "utf-8");
      const backupData = JSON.parse(raw);

      for (const t of tables) {
        const rows = backupData.tables[t] || [];
        await client.query(`TRUNCATE TABLE "${t}" CASCADE;`);
        if (rows.length > 0) {
          const sample = rows[0];
          const cols = Object.keys(sample);
          const colList = cols.map(c => `"${c}"`).join(", ");

          for (const row of rows) {
            const vals = cols.map(c => row[c]);
            const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
            await client.query(
              `INSERT INTO "${t}" (${colList}) VALUES (${placeholders});`,
              vals
            );
          }
        }
        console.log(`   - Restored ${t.padEnd(20)}: ${rows.length} rows from JSON`);
      }
    }

    await client.query("COMMIT");

    console.log("================================================================");
    console.log(" ✅ ALL PREVIOUS DATA HAS BEEN FULLY RESTORED!");
    console.log("================================================================");

    const counts = await client.query(`
      SELECT 
        (SELECT count(*) FROM users) as users_count,
        (SELECT count(*) FROM orders) as orders_count,
        (SELECT count(*) FROM transactions) as transactions_count,
        (SELECT count(*) FROM user_wallets) as wallets_count,
        (SELECT count(*) FROM products) as products_count
    `);
    console.table(counts.rows[0]);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FATAL ERROR restoring data:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreProductionData();
