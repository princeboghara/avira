const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function testBreadcrumbs(memberId) {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      WITH RECURSIVE ancestors AS (
        SELECT id, member_id, full_name, binary_parent_id, binary_position, 1 as depth
        FROM users
        WHERE UPPER(member_id) = UPPER($1)
        UNION ALL
        SELECT u.id, u.member_id, u.full_name, u.binary_parent_id, u.binary_position, a.depth + 1
        FROM users u
        INNER JOIN ancestors a ON u.id = a.binary_parent_id
      )
      SELECT member_id, full_name, binary_position, depth 
      FROM ancestors 
      ORDER BY depth DESC;
    `, [memberId]);
    console.log(`Ancestors for ${memberId}:`);
    console.table(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

testBreadcrumbs('AV62928');
