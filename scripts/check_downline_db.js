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
    const res = await client.query(`
      WITH RECURSIVE downline AS (
        SELECT id, member_id, binary_parent_id, 1 as level 
        FROM users 
        WHERE binary_parent_id = 'usr_av00001_root'
        UNION ALL
        SELECT u.id, u.member_id, u.binary_parent_id, d.level + 1 
        FROM users u 
        INNER JOIN downline d ON u.binary_parent_id = d.id
      )
      SELECT COUNT(*), MAX(level) FROM downline;
    `);
    console.log("Current DB Downline Count under AV0001:", res.rows[0]);

    // Check broken links
    const broken = await client.query(`
      SELECT count(*) FROM users WHERE binary_parent_id IS NOT NULL AND binary_parent_id NOT IN (SELECT id FROM users);
    `);
    console.log("Broken binary_parent_id count:", broken.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}
check();
