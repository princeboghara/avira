require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function inspect() {
  const userCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
  console.log("Users Columns:", userCols.rows.map(r => r.column_name).join(", "));
  
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log("Tables in DB:", tables.rows.map(r => r.table_name).join(", "));
}
inspect().finally(() => pool.end());
