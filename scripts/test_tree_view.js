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

async function testTree() {
  const client = await pool.connect();
  try {
    async function fetchNode(memberIdOrId, depth = 1) {
      if (depth > 3) return null;
      const res = await client.query(
        `SELECT id, member_id, full_name, status, personal_pv, left_pv, right_pv, binary_position, left_child_id, right_child_id
         FROM users
         WHERE UPPER(member_id) = UPPER($1) OR id = $1
         LIMIT 1`,
        [memberIdOrId]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      const leftChild = row.left_child_id ? await fetchNode(row.left_child_id, depth + 1) : null;
      const rightChild = row.right_child_id ? await fetchNode(row.right_child_id, depth + 1) : null;
      return {
        memberId: row.member_id,
        name: row.full_name,
        position: row.binary_position,
        leftPv: row.left_pv,
        rightPv: row.right_pv,
        leftChild: leftChild ? { memberId: leftChild.memberId, name: leftChild.name, position: leftChild.position } : null,
        rightChild: rightChild ? { memberId: rightChild.memberId, name: rightChild.name, position: rightChild.position } : null,
      };
    }

    const tree = await fetchNode('AV0001');
    console.log("🌳 Rendered Tree Hierarchy (Top 2 Levels):");
    console.log(JSON.stringify(tree, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

testTree();
