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

async function checkOrphans() {
  const client = await pool.connect();
  try {
    // Check members where binary_parent_id is null
    const nullParents = await client.query("SELECT member_id, full_name FROM users WHERE binary_parent_id IS NULL");
    console.log("Members with NULL binary_parent_id:", nullParents.rows);

    // Let's check a few members from CSV and see what their binary_parent_id is in the DB
    const sample = await client.query("SELECT member_id, binary_parent_id, left_child_id, right_child_id FROM users LIMIT 15");
    console.table(sample.rows);
  } finally {
    client.release();
    await pool.end();
  }
}
checkOrphans();
