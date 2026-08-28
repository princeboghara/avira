require("dotenv").config();
const { Pool } = require("pg");

const DATABASE_URL = (process.env.DATABASE_URL || "").replace(/^["']|["']$/g, "").trim();
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function runTests() {
  console.log("=== RUNNING DATABASE & QUERY INTEGRITY TESTS ===");

  const client = await pool.connect();
  try {
    // Test 1: Basic connection & health check
    const health = await client.query("SELECT NOW() as server_time, version();");
    console.log("✓ Test 1 Passed: PostgreSQL Connected successfully at", health.rows[0].server_time);

    // Test 2: Verify v_users_full view and core user lookup
    const userRes = await client.query("SELECT id, member_id, full_name, role, status, personal_pv, wallet_balance FROM v_users_full LIMIT 1;");
    console.log("✓ Test 2 Passed: v_users_full query succeeded with user:", userRes.rows[0]?.member_id, userRes.rows[0]?.full_name);

    // Test 3: Test Recursive CTE for Tree Breadcrumbs (Fixed Query)
    const sampleMemberId = userRes.rows[0]?.member_id || "AV0001";
    const breadcrumbRes = await client.query(`
      WITH RECURSIVE ancestors AS (
        SELECT id, member_id, full_name, binary_parent_id, binary_position, 1 as depth
        FROM v_users_full
        WHERE UPPER(member_id) = UPPER($1)
        UNION ALL
        SELECT u.id, u.member_id, u.full_name, u.binary_parent_id, u.binary_position, a.depth + 1
        FROM v_users_full u
        INNER JOIN ancestors a ON u.id = a.binary_parent_id
      )
      SELECT member_id, full_name, binary_position, depth 
      FROM ancestors 
      ORDER BY depth DESC;
    `, [sampleMemberId]);
    console.log(`✓ Test 3 Passed: Tree Breadcrumbs CTE executed without error. Nodes found: ${breadcrumbRes.rows.length}`);

    // Test 4: Test Admin Reports new joinings query with personal_pv (Fixed Query)
    const reportRes = await client.query(`
      SELECT id, member_id, full_name, mobile, personal_pv, status, created_at, sponsor_id
      FROM v_users_full
      WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    console.log(`✓ Test 4 Passed: Admin Reports new joinings query executed without error. Rows returned: ${reportRes.rows.length}`);

    // Test 5: Verify Orders query with grouped OR condition
    const ordersRes = await client.query(`
      SELECT 
        o.id, 
        u.member_id,
        b.full_name as buyer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
      WHERE (o.user_id = $1 OR UPPER(o.billed_by) = UPPER($2))
      ORDER BY o.created_at DESC LIMIT 5;
    `, [userRes.rows[0]?.id, sampleMemberId]);
    console.log(`✓ Test 5 Passed: Orders query executed with grouped OR conditions. Orders found: ${ordersRes.rows.length}`);

    console.log("\n>>> ALL DATABASE TESTS PASSED SUCCESSFULLY! <<<");
  } finally {
    client.release();
    await pool.end();
  }
}

runTests().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
