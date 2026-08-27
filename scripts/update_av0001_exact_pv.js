const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function updateAV0001() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE users
      SET 
        left_pv = 74369.00,
        right_pv = 178599.00,
        carry_left_pv = 0.00,
        carry_right_pv = 104230.00,
        updated_at = NOW()
      WHERE member_id = 'AV0001'
      RETURNING member_id, full_name, left_pv, right_pv, carry_left_pv, carry_right_pv, total_team_count;
    `);
    console.log("Updated AV0001 with exact PV values:", res.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAV0001();
