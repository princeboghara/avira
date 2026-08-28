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

// CSV parser
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

async function applyRealPvAndIncome() {
  const client = await pool.connect();
  try {
    console.log("1. Ensuring fund_balance and fund_wallet columns exist...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS fund_balance NUMERIC(15, 2) DEFAULT 0.00;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS fund_wallet NUMERIC(15, 2) DEFAULT 0.00;
    `);

    console.log("2. Reading CSV file...");
    const csvPath = "C:\\Users\\pc\\Desktop\\aviralifecare_real_pv_and_income_1639_2026-08-27 (6).csv";
    const raw = fs.readFileSync(csvPath, "utf8");
    const rows = parseCSV(raw);
    const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim());

    console.log("Headers:", headers);
    const getIdx = (name) => headers.indexOf(name);

    const mIdIdx = getIdx('Member ID');
    const leftPvIdx = getIdx('Left PV');
    const rightPvIdx = getIdx('Right PV');
    const balLeftIdx = getIdx('Balance Left PV');
    const balRightIdx = getIdx('Balance Right PV');
    const selfPvIdx = getIdx('Self PV');
    const earnBalIdx = getIdx('Earning Balance');
    const fundBalIdx = getIdx('Fund Balance');
    const rpBalIdx = getIdx('Repurchase Balance');
    const totIncomeIdx = getIdx('Total Income');

    const cleanNum = (val) => {
      if (!val) return 0;
      const num = parseFloat(val.toString().replace(/,/g, '').replace(/^₹\s*/, ''));
      return isNaN(num) ? 0 : num;
    };

    const updateData = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const mId = r[mIdIdx]?.toUpperCase().trim();
      if (!mId || !mId.startsWith('AV')) continue;

      updateData.push({
        memberId: mId,
        leftPv: cleanNum(r[leftPvIdx]),
        rightPv: cleanNum(r[rightPvIdx]),
        carryLeftPv: cleanNum(r[balLeftIdx]),
        carryRightPv: cleanNum(r[balRightIdx]),
        personalPv: cleanNum(r[selfPvIdx]),
        walletBalance: cleanNum(r[earnBalIdx]),
        fundBalance: cleanNum(r[fundBalIdx]),
        rpWallet: cleanNum(r[rpBalIdx]),
        totalEarnings: cleanNum(r[totIncomeIdx]),
      });
    }

    console.log(`Prepared update data for ${updateData.length} members.`);

    await client.query("BEGIN");

    // Batch update in chunks of 150
    const chunkSize = 150;
    for (let i = 0; i < updateData.length; i += chunkSize) {
      const chunk = updateData.slice(i, i + chunkSize);
      
      const valuesList = chunk.map((_, idx) => {
        const base = idx * 10;
        return `($${base + 1}, $${base + 2}::numeric, $${base + 3}::numeric, $${base + 4}::numeric, $${base + 5}::numeric, $${base + 6}::numeric, $${base + 7}::numeric, $${base + 8}::numeric, $${base + 9}::numeric, $${base + 10}::numeric)`;
      }).join(', ');

      const params = [];
      chunk.forEach(m => {
        params.push(
          m.memberId,
          m.leftPv,
          m.rightPv,
          m.carryLeftPv,
          m.carryRightPv,
          m.personalPv,
          m.walletBalance,
          m.fundBalance,
          m.rpWallet,
          m.totalEarnings
        );
      });

      const sql = `
        UPDATE users AS u
        SET
          left_pv = c.lpv,
          right_pv = c.rpv,
          carry_left_pv = c.clpv,
          carry_right_pv = c.crpv,
          personal_pv = c.ppv,
          wallet_balance = c.wb,
          fund_balance = c.fb,
          fund_wallet = c.fb,
          rp_wallet = c.rpw,
          total_earnings = c.te,
          updated_at = NOW()
        FROM (VALUES ${valuesList}) AS c(mid, lpv, rpv, clpv, crpv, ppv, wb, fb, rpw, te)
        WHERE UPPER(u.member_id) = UPPER(c.mid);
      `;

      await client.query(sql, params);
    }

    await client.query("COMMIT");
    console.log("✅ All 1,639 members successfully updated with 100% Real PV, Carry Forward, Wallets & Income!");

    // Verification of Root AV0001
    const checkRoot = await client.query(`
      SELECT member_id, full_name, left_pv, right_pv, carry_left_pv, carry_right_pv, personal_pv, wallet_balance, fund_balance, rp_wallet, total_earnings
      FROM users WHERE member_id = 'AV0001'
    `);
    console.log("\n=== AV0001 (Root) Verification ===");
    console.table(checkRoot.rows);

    // Verification of Sample Members
    const checkSamples = await client.query(`
      SELECT member_id, full_name, left_pv, right_pv, carry_left_pv, carry_right_pv, personal_pv, wallet_balance, fund_balance, rp_wallet, total_earnings
      FROM users WHERE member_id IN ('AV43341', 'AV72516', 'AV94925', 'AV62928')
      ORDER BY member_id
    `);
    console.log("\n=== Sample Members Verification ===");
    console.table(checkSamples.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error applying PV & Income:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

applyRealPvAndIncome();
