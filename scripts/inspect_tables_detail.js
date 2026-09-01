const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const tables = ["users", "user_wallets", "user_kyc", "user_binary_pv", "orders", "transactions", "fund_requests", "support_tickets"];
    for (const t of tables) {
      const res = await client.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
        [t]
      );
      console.log(`\n=== Table: ${t} (${res.rows.length} columns) ===`);
      console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(", "));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
