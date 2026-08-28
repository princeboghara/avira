const fs = require("fs");
const { Pool } = require("pg");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = "D:\\aviracare\\avira\\" + file;
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
    // 1. Check in DB
    const dbRes = await client.query(`
      SELECT o.id, o.user_id, u.member_id, u.full_name as member_name, o.billed_by, o.customer_name, o.customer_mobile, o.amount, o.pv, o.order_date_raw
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = 'ORD-99dgx5aSJt'
    `);
    console.log("=== DB RECORD FOR ORD-99dgx5aSJt ===");
    console.table(dbRes.rows);

    // 2. Check in CSV
    const csvPath = "C:\\Users\\pc\\Desktop\\aviralifecare_master_orders_779_2026-08-28.csv";
    const rawCSV = fs.readFileSync(csvPath, "utf-8");
    const lines = rawCSV.split("\n");
    const header = lines[0];
    const matchLine = lines.find(l => l.includes("ORD-99dgx5aSJt"));
    console.log("\n=== CSV HEADER ===");
    console.log(header);
    console.log("\n=== CSV ROW FOR ORD-99dgx5aSJt ===");
    console.log(matchLine);

    // Also search for Suneel Kumar Gautam in users table
    const userSearch = await client.query(`
      SELECT id, member_id, full_name, mobile, email
      FROM users
      WHERE full_name ILIKE '%Suneel%' OR mobile LIKE '%9714934929%' OR member_id = 'AV27922'
    `);
    console.log("\n=== USER LOOKUP IN DATABASE ===");
    console.table(userSearch.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

check();
