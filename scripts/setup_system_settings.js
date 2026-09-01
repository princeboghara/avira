require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setup() {
  const client = await pool.connect();
  try {
    console.log("Creating system_settings table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      INSERT INTO system_settings (key, value, description, updated_at)
      VALUES 
        ('leadership_level1_percent', '15', 'Leadership Supporting Bonus Level 1 Percentage', NOW()),
        ('leadership_level2_percent', '5', 'Leadership Supporting Bonus Level 2 Percentage', NOW())
      ON CONFLICT (key) DO NOTHING;
    `);

    const rows = await client.query("SELECT * FROM system_settings;");
    console.log("Current system_settings:", rows.rows);
  } catch (err) {
    console.error("Error setting up system_settings:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
