const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function testTeam() {
  const client = await pool.connect();
  try {
    const rootRes = await client.query("SELECT id, member_id, left_pv, right_pv, total_team_count FROM users WHERE member_id = 'AV0001'");
    const root = rootRes.rows[0];
    console.log("Root AV0001 Row in users table:", root);

    const downlineRes = await client.query(`
      WITH RECURSIVE downline AS (
        SELECT id, member_id, binary_position, binary_position AS side, 1 as level
        FROM users WHERE binary_parent_id = $1
        UNION ALL
        SELECT u.id, u.member_id, u.binary_position, d.side, d.level + 1
        FROM users u INNER JOIN downline d ON u.binary_parent_id = d.id
      )
      SELECT side, count(*) FROM downline GROUP BY side;
    `, [root.id]);
    console.log("Downline breakdown by side:", downlineRes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

testTeam();
