require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkPerformance() {
  const client = await pool.connect();
  try {
    const t0 = Date.now();
    const res1 = await client.query("EXPLAIN ANALYZE SELECT * FROM v_users_full WHERE UPPER(member_id) = 'AV0001'");
    const t1 = Date.now();
    console.log('Query roundtrip:', t1 - t0, 'ms');
    console.log('Explain plan:\n', res1.rows.map(r => r['QUERY PLAN']).join('\n'));

    // Check indexes on users table
    const idxRes = await client.query("SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'");
    console.log('\nIndexes in DB:');
    idxRes.rows.forEach(r => console.log(`[${r.tablename}] ${r.indexname}: ${r.indexdef}`));

  } finally {
    client.release();
    await pool.end();
  }
}
checkPerformance();
