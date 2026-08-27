const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, member_id, full_name, mobile, binary_parent_id, left_child_id, right_child_id, created_at, updated_at FROM users WHERE member_id = 'AV70407'");
    console.log("AV70407 in DB:", res.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}
check();
