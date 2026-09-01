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

async function check() {
  const client = await pool.connect();
  try {
    const u = await client.query("SELECT COUNT(*) FROM users");
    const o = await client.query("SELECT COUNT(*) FROM orders");
    const k = await client.query("SELECT COUNT(*) FROM user_kyc");
    const w = await client.query("SELECT COUNT(*) FROM user_wallets");
    const p = await client.query("SELECT COUNT(*) FROM user_binary_pv");

    console.log("=== CURRENT DATABASE RECORD COUNTS ===");
    console.log(`Users in DB:        ${u.rows[0].count}`);
    console.log(`Orders in DB:       ${o.rows[0].count}`);
    console.log(`KYC Records:        ${k.rows[0].count}`);
    console.log(`Wallet Records:     ${w.rows[0].count}`);
    console.log(`Binary PV Records:  ${p.rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
