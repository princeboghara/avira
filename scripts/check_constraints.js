const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function checkConstraints() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass;
    `);
    console.table(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}
checkConstraints();
