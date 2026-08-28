const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync(".env.local") ? ".env.local" : ".env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function check() {
  const res = await pool.query("SELECT id, name, slug, category, mrp, dp, pv, hsn_code FROM products WHERE id LIKE '%choco%' OR slug LIKE '%choco%'");
  console.table(res.rows);
  await pool.end();
}

check();
