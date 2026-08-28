const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join("D:\\aviracare\\avira", file);
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Checking and adding missing columns to orders table...");
    await client.query(`
      ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS state VARCHAR(100),
        ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
        ADD COLUMN IF NOT EXISTS order_date_raw VARCHAR(100),
        ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS net_amount NUMERIC(15, 2) DEFAULT 0;
    `);
    console.log("✅ Orders table columns updated successfully!");
  } catch (err) {
    console.error("Error updating orders table:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
