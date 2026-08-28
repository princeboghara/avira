require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function inspect() {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('=== ALL TABLES IN DATABASE ===');
  for (const t of tables.rows) {
    const countRes = await pool.query(`SELECT count(*) as c FROM "${t.table_name}"`);
    const colCount = await pool.query(`
      SELECT count(*) as c FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
    `, [t.table_name]);
    console.log(`Table: ${t.table_name.padEnd(25)} | Rows: ${countRes.rows[0].c.toString().padEnd(6)} | Columns: ${colCount.rows[0].c}`);
  }
}

inspect()
  .catch(err => console.error(err))
  .finally(() => pool.end());
