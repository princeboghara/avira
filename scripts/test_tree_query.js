require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const searchId = 'AV62928';
  const rootId = 'AV0001';

  const res = await pool.query(`
    WITH RECURSIVE ancestors AS (
      SELECT u.id, u.member_id, b.binary_parent_id, 1 as depth
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      WHERE (UPPER(u.member_id) = UPPER($1) OR u.id = $1)

      UNION ALL

      SELECT u.id, u.member_id, b.binary_parent_id, a.depth + 1
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      INNER JOIN ancestors a ON u.id = a.binary_parent_id
      WHERE u.role != 'ADMIN'
    ),
    root_seed AS (
      SELECT u.id, u.member_id, b.left_child_id, b.right_child_id, 1 as depth
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      WHERE (UPPER(u.member_id) = UPPER($2) OR u.id = $2)

      UNION ALL

      SELECT u.id, u.member_id, b.left_child_id, b.right_child_id, rs.depth + 1
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      INNER JOIN root_seed rs ON (u.id = rs.left_child_id OR u.id = rs.right_child_id)
      WHERE rs.depth < 3
    ),
    ancestor_children AS (
      SELECT b.left_child_id as child_id FROM ancestors a JOIN user_binary_pv b ON a.id = b.user_id WHERE b.left_child_id IS NOT NULL
      UNION
      SELECT b.right_child_id as child_id FROM ancestors a JOIN user_binary_pv b ON a.id = b.user_id WHERE b.right_child_id IS NOT NULL
    ),
    all_needed_ids AS (
      SELECT id FROM ancestors
      UNION
      SELECT child_id AS id FROM ancestor_children
      UNION
      SELECT id FROM root_seed
    )
    SELECT u.id, u.member_id, u.full_name, b.binary_position, b.left_child_id, b.right_child_id
    FROM all_needed_ids ani
    JOIN users u ON ani.id = u.id
    JOIN user_binary_pv b ON u.id = b.user_id
    WHERE u.role != 'ADMIN';
  `, [searchId, rootId]);

  console.log('Total nodes returned:', res.rows.length);
  for (const r of res.rows) {
    console.log(`${r.member_id} (${r.full_name}) -> Left: ${r.left_child_id}, Right: ${r.right_child_id}`);
  }
  await pool.end();
}

run();
