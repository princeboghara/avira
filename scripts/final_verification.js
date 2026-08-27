const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function verifyAll() {
  const client = await pool.connect();
  try {
    // 1. Total users
    const usersCount = await client.query("SELECT COUNT(*) FROM users");
    console.log("1. Total users in Supabase database:", usersCount.rows[0].count);

    // 2. Root AV0001
    const root = (await client.query("SELECT member_id, full_name, left_pv, right_pv, total_team_count FROM users WHERE member_id = 'AV0001'")).rows[0];
    console.log("2. AV0001 Summary in DB:", root);

    // 3. Check sample members and their real sponsor names
    const sponsorsSample = await client.query(`
      SELECT member_id, full_name, sponsor_id, sponsor_name, binary_position, personal_pv 
      FROM users 
      WHERE member_id IN ('AV43341', 'AV72516', 'AV62928', 'AV94925', 'AV56270')
      ORDER BY member_id
    `);
    console.log("\n3. Sample Real Sponsor Names:");
    console.table(sponsorsSample.rows);

    // 4. Downline count verification
    const dl = await client.query(`
      WITH RECURSIVE downline AS (
        SELECT id, member_id, binary_position, binary_position AS side, 1 as level
        FROM users WHERE binary_parent_id = 'usr_av00001_root'
        UNION ALL
        SELECT u.id, u.member_id, u.binary_position, d.side, d.level + 1
        FROM users u INNER JOIN downline d ON u.binary_parent_id = d.id
      )
      SELECT side, count(*) FROM downline GROUP BY side;
    `);
    console.log("\n4. Downline side counts under AV0001:");
    console.table(dl.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

verifyAll();
