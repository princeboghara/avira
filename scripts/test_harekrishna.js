require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const res = await pool.query(`
    WITH RECURSIVE tree_nodes AS (
      SELECT 
        u.id, u.member_id, u.full_name, b.left_child_id, b.right_child_id, 1 AS depth
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      WHERE u.member_id = 'AV72516'

      UNION ALL

      SELECT 
        u.id, u.member_id, u.full_name, b.left_child_id, b.right_child_id, tn.depth + 1
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      INNER JOIN tree_nodes tn ON (u.id = tn.left_child_id OR u.id = tn.right_child_id)
      WHERE tn.depth < 3
    )
    SELECT * FROM tree_nodes;
  `);

  console.log('Returned rows for AV72516 (HAREKRISHNA):', res.rows.length);
  for (const r of res.rows) {
    console.log(`Depth ${r.depth}: ${r.member_id} (${r.full_name}) -> Left: ${r.left_child_id}, Right: ${r.right_child_id}`);
  }
  await pool.end();
}

run();
