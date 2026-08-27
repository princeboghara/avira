const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function batchUpdateDates() {
  const client = await pool.connect();
  try {
    const dates = JSON.parse(fs.readFileSync("D:\\aviracare\\avira\\scripts\\joining_dates.json", "utf-8"));
    const entries = Object.entries(dates);
    console.log(`Updating ${entries.length} members with real joining dates...`);

    // In chunks of 200
    const chunkSize = 200;
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      const valuesList = chunk.map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(', ');
      const params = [];
      chunk.forEach(([mId, date]) => {
        params.push(mId, date);
      });

      const sql = `
        UPDATE users AS u
        SET joined_date = c.jdate
        FROM (VALUES ${valuesList}) AS c(mid, jdate)
        WHERE u.member_id = c.mid;
      `;
      await client.query(sql, params);
    }

    console.log("✅ All Joining Dates updated successfully!");

    const sample = await client.query("SELECT member_id, full_name, joined_date FROM users WHERE member_id IN ('AV0001', 'AV43341', 'AV72516', 'AV94925', 'AV62928')");
    console.table(sample.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

batchUpdateDates();
