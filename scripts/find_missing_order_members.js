const fs = require("fs");
const { Pool } = require("pg");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = "D:\\aviracare\\avira\\" + file;
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

function parseCSV(text) {
  const cleanText = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const c = cleanText[i];
    const next = cleanText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      row.push(cur);
      cur = "";
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(cur);
      if (row.some(field => field.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    if (row.some(field => field.trim().length > 0)) {
      rows.push(row);
    }
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj = {};
    headers.forEach((h, colIdx) => {
      obj[h] = (r[colIdx] || "").trim();
    });
    data.push(obj);
  }

  return data;
}

async function checkMissingUsers() {
  const client = await pool.connect();
  try {
    const csvPath = "C:\\Users\\pc\\Desktop\\aviralifecare_master_orders_779_2026-08-28.csv";
    const rawCSV = fs.readFileSync(csvPath, "utf-8");
    const records = parseCSV(rawCSV);

    const userRes = await client.query("SELECT member_id, id FROM users");
    const existingMemberIds = new Set(userRes.rows.map(u => u.member_id.trim().toUpperCase()));

    const missing = [];
    for (const rec of records) {
      const rowText = Object.values(rec).join(" | ");
      const avMatches = Array.from(rowText.matchAll(/AV\d{4,}/gi)).map(m => m[0].toUpperCase());
      const memberId = avMatches.length >= 2 ? avMatches[1] : (avMatches[0] || "");

      if (memberId && !existingMemberIds.has(memberId)) {
        missing.push({
          memberId: memberId,
          name: rec["Shipping Full Name"] || rec["Name"] || "",
          phone: rec["Shipping Phone No"] || "",
          email: rec["Shipping Email"] || rec["Email"] || "",
          orderNo: (rowText.match(/ORD-[A-Za-z0-9]+/) || [])[0]
        });
      }
    }

    console.log(`Found ${missing.length} orders belonging to members not currently in users table:`);
    console.table(missing.slice(0, 15));

  } finally {
    client.release();
    await pool.end();
  }
}

checkMissingUsers();
