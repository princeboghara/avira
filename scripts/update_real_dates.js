const { Pool } = require("pg");
const fs = require("fs");
const envFile = fs.existsSync("D:\\aviracare\\avira\\.env.local") ? "D:\\aviracare\\avira\\.env.local" : "D:\\aviracare\\avira\\.env";
const content = fs.readFileSync(envFile, "utf-8");
const match = content.match(/DATABASE_URL\s*=\s*(.*)/);
const dbUrl = match ? match[1].trim().replace(/^\"|\"$/g, '') : '';
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (const l of lines) {
    const parts = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { parts.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    parts.push(cur.trim());
    rows.push(parts);
  }
  return rows;
}

async function updateRealJoiningDates() {
  const client = await pool.connect();
  try {
    const csvPath = "D:\\aviracare\\avira\\scripts\\aviralifecare_master_all_details.csv";
    const raw = fs.readFileSync(csvPath, "utf8");
    const rows = parseCSV(raw);

    const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim());
    const mIdIdx = headers.indexOf('Member ID');
    const dateIdx = headers.indexOf('Joining Date');

    await client.query("BEGIN");
    let count = 0;
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const mId = r[mIdIdx]?.toUpperCase();
      const jDate = r[dateIdx];
      if (mId && jDate && jDate !== '-') {
        await client.query("UPDATE users SET joined_date = $1 WHERE UPPER(member_id) = UPPER($2)", [jDate, mId]);
        count++;
      }
    }
    await client.query("COMMIT");
    console.log(`Updated real Joining Dates for ${count} members!`);

    const sample = await client.query("SELECT member_id, full_name, joined_date FROM users WHERE member_id IN ('AV0001', 'AV43341', 'AV72516')");
    console.table(sample.rows);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}

updateRealJoiningDates();
