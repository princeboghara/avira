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

async function run() {
  const client = await pool.connect();
  try {
    console.log("1. Reading Profile & KYC CSV file...");
    const csvPath = "D:\\aviracare\\avira\\scripts\\full_profiles.csv";
    const raw = fs.readFileSync(csvPath, "utf8");
    const rows = parseCSV(raw);
    const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim());

    console.log("Headers:", headers);
    const getIdx = (name) => headers.indexOf(name);

    const mIdIdx = getIdx('Member ID');
    const nameIdx = getIdx('Name');
    const mobileIdx = getIdx('Mobile');
    const emailIdx = getIdx('Email');
    const pinIdx = getIdx('Pincode');
    const stateIdx = getIdx('State');
    const cityIdx = getIdx('City');
    const addrIdx = getIdx('Address');
    const panIdx = getIdx('PAN Number');
    const aadharIdx = getIdx('Aadhar Number');
    const aadharNameIdx = getIdx('Name as per Aadhar');
    const gstIdx = getIdx('GST No');
    const nomineeIdx = getIdx('Nominee');
    const relIdx = getIdx('Nominee Relation');
    const bankIdx = getIdx('Bank Name');
    const accIdx = getIdx('Account Number');
    const upiIdx = getIdx('UPI ID');
    const ifscIdx = getIdx('IFSC Code');

    const cleanStr = (val) => {
      if (!val) return null;
      let s = val.toString().trim();
      if (!s || s === 'null' || s === 'undefined' || s === '-') return null;
      return s;
    };

    const updateData = [];
    const seenIds = new Set();

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const mId = r[mIdIdx]?.toUpperCase().trim();
      if (!mId || !mId.startsWith('AV') || seenIds.has(mId)) continue;
      seenIds.add(mId);

      updateData.push({
        memberId: mId,
        mobile: cleanStr(r[mobileIdx]),
        email: cleanStr(r[emailIdx]),
        pincode: cleanStr(r[pinIdx]),
        state: cleanStr(r[stateIdx]),
        city: cleanStr(r[cityIdx]),
        address: cleanStr(r[addrIdx]),
        panNumber: cleanStr(r[panIdx]),
        aadhaarNumber: cleanStr(r[aadharIdx]),
        aadhaarName: cleanStr(r[aadharNameIdx]),
        gstNumber: cleanStr(r[gstIdx]),
        nomineeName: cleanStr(r[nomineeIdx]),
        nomineeRelation: cleanStr(r[relIdx]),
        bankName: cleanStr(r[bankIdx]),
        bankAccountNumber: cleanStr(r[accIdx]),
        upiId: cleanStr(r[upiIdx]),
        ifscCode: cleanStr(r[ifscIdx]),
      });
    }

    console.log(`2. Prepared profile data for ${updateData.length} unique members.`);

    await client.query("BEGIN");

    // Batch update in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < updateData.length; i += chunkSize) {
      const chunk = updateData.slice(i, i + chunkSize);
      
      const valuesList = chunk.map((_, idx) => {
        const base = idx * 17;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17})`;
      }).join(', ');

      const params = [];
      chunk.forEach(m => {
        params.push(
          m.memberId,
          m.mobile,
          m.email,
          m.pincode,
          m.state,
          m.city,
          m.address,
          m.panNumber,
          m.aadhaarNumber,
          m.aadhaarName,
          m.gstNumber,
          m.nomineeName,
          m.nomineeRelation,
          m.bankName,
          m.bankAccountNumber,
          m.upiId,
          m.ifscCode
        );
      });

      const sql = `
        UPDATE users AS u
        SET
          mobile = COALESCE(c.mob, u.mobile),
          email = COALESCE(c.em, u.email),
          pincode = COALESCE(c.pin, u.pincode),
          state = COALESCE(c.st, u.state),
          city = COALESCE(c.ct, u.city),
          address = COALESCE(c.addr, u.address),
          pan_number = COALESCE(c.pan, u.pan_number),
          aadhaar_number = COALESCE(c.adh, u.aadhaar_number),
          aadhaar_name = COALESCE(c.adhn, u.aadhaar_name),
          gst_number = COALESCE(c.gst, u.gst_number),
          nominee_name = COALESCE(c.nom, u.nominee_name),
          nominee_relation = COALESCE(c.rel, u.nominee_relation),
          bank_name = COALESCE(c.bnk, u.bank_name),
          bank_account_number = COALESCE(c.acc, u.bank_account_number),
          upi_id = COALESCE(c.upi, u.upi_id),
          ifsc_code = COALESCE(c.ifsc, u.ifsc_code),
          kyc_status = CASE 
            WHEN (COALESCE(c.pan, u.pan_number) IS NOT NULL AND COALESCE(c.adh, u.aadhaar_number) IS NOT NULL) THEN 'VERIFIED'
            WHEN (COALESCE(c.pan, u.pan_number) IS NOT NULL OR COALESCE(c.adh, u.aadhaar_number) IS NOT NULL) THEN 'SUBMITTED'
            ELSE u.kyc_status
          END,
          updated_at = NOW()
        FROM (VALUES ${valuesList}) AS c(mid, mob, em, pin, st, ct, addr, pan, adh, adhn, gst, nom, rel, bnk, acc, upi, ifsc)
        WHERE UPPER(u.member_id) = UPPER(c.mid);
      `;

      await client.query(sql, params);
    }

    await client.query("COMMIT");
    console.log("✅ All Profile & KYC data successfully merged into Supabase Database!\n");

    // 3. Verification of AV0001
    const checkRoot = await client.query(`
      SELECT member_id, full_name, mobile, email, city, state, pincode, address, pan_number, aadhaar_number, bank_account_number, kyc_status
      FROM users WHERE member_id = 'AV0001'
    `);
    console.log("=== AV0001 Profile & KYC Verification ===");
    console.table(checkRoot.rows);

    // 4. Verification of Sample Members with real Addresses/KYC
    const checkSamples = await client.query(`
      SELECT member_id, full_name, mobile, email, city, address, pan_number, aadhaar_number, bank_name, bank_account_number, ifsc_code, kyc_status
      FROM users WHERE address IS NOT NULL AND address != ''
      LIMIT 5
    `);
    console.log("\n=== Sample Members with Real Addresses in Database ===");
    console.table(checkSamples.rows);

    // 5. Complete Database Audit Report
    const userStats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(mobile) as total_mobiles,
        COUNT(email) as total_emails,
        COUNT(pincode) as total_pincodes,
        COUNT(city) as total_cities,
        COUNT(state) as total_states,
        COUNT(address) as total_addresses,
        COUNT(pan_number) as total_pans,
        COUNT(aadhaar_number) as total_aadhaars,
        COUNT(bank_account_number) as total_bank_accounts,
        COUNT(ifsc_code) as total_ifsc_codes,
        COUNT(upi_id) as total_upis,
        COUNT(nominee_name) as total_nominees,
        COUNT(gst_number) as total_gsts,
        COUNT(CASE WHEN kyc_status = 'VERIFIED' THEN 1 END) as kyc_verified_count,
        COUNT(CASE WHEN kyc_status = 'SUBMITTED' THEN 1 END) as kyc_submitted_count,
        COUNT(CASE WHEN left_pv > 0 OR right_pv > 0 THEN 1 END) as members_with_pv,
        COUNT(CASE WHEN wallet_balance > 0 THEN 1 END) as members_with_wallet,
        COUNT(CASE WHEN total_earnings > 0 THEN 1 END) as members_with_earnings
      FROM users;
    `);

    console.log("\n=== Users Table Field Coverage Audit ===");
    console.table(userStats.rows);

    // 6. Audit other database tables
    const tableCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM transactions) as transactions_count,
        (SELECT COUNT(*) FROM orders) as orders_count,
        (SELECT COUNT(*) FROM products) as products_count
    `);
    console.log("\n=== Other Tables Audit ===");
    console.table(tableCounts.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error applying profiles:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
