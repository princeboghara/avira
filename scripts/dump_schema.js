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

async function inspectFullSchema() {
  const client = await pool.connect();
  try {
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log("=== ALL TABLES IN DATABASE ===");
    console.table(tablesRes.rows);

    const fullSchema = {};

    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const colsRes = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length, 
          is_nullable, 
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      fullSchema[tableName] = colsRes.rows;
    }

    fs.writeFileSync(
      "D:\\aviracare\\avira\\scripts\\full_db_schema.json",
      JSON.stringify(fullSchema, null, 2)
    );
    console.log("\nSaved full schema dump to scripts/full_db_schema.json");

  } finally {
    client.release();
    await pool.end();
  }
}

inspectFullSchema();
