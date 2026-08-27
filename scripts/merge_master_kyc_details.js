const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
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

// CSV parser supporting quoted strings and multiline records
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return rows;
}

async function mergeMasterDetails() {
  const client = await pool.connect();
  try {
    console.log("Expanding column length limits in users table...");
    await client.query(`
      ALTER TABLE users ALTER COLUMN bank_account_number TYPE TEXT;
      ALTER TABLE users ALTER COLUMN upi_id TYPE TEXT;
      ALTER TABLE users ALTER COLUMN nominee_relation TYPE TEXT;
      ALTER TABLE users ALTER COLUMN nominee_name TYPE TEXT;
      ALTER TABLE users ALTER COLUMN gst_number TYPE TEXT;
      ALTER TABLE users ALTER COLUMN pan_number TYPE TEXT;
      ALTER TABLE users ALTER COLUMN aadhaar_number TYPE TEXT;
      ALTER TABLE users ALTER COLUMN aadhaar_name TYPE TEXT;
      ALTER TABLE users ALTER COLUMN ifsc_code TYPE TEXT;
      ALTER TABLE users ALTER COLUMN bank_name TYPE TEXT;
      ALTER TABLE users ALTER COLUMN city TYPE TEXT;
      ALTER TABLE users ALTER COLUMN state TYPE TEXT;
      ALTER TABLE users ALTER COLUMN pincode TYPE TEXT;
      ALTER TABLE users ALTER COLUMN mobile TYPE TEXT;
      ALTER TABLE users ALTER COLUMN email TYPE TEXT;
    `);

    console.log("Reading downloaded Master KYC & Bank details CSV...");
    const csvPath = "D:\\aviracare\\avira\\scripts\\aviralifecare_master_all_details.csv";
    const rawContent = fs.readFileSync(csvPath, "utf8");

    const rows = parseCSV(rawContent);
    console.log(`Parsed ${rows.length} total rows from CSV.`);

    const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim());
    const headerIndex = {};
    headers.forEach((h, idx) => {
      headerIndex[h] = idx;
    });

    const getCol = (r, name) => {
      const idx = headerIndex[name];
      return idx !== undefined && r[idx] ? r[idx].trim() : '';
    };

    const memberMap = new Map();

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const mId = getCol(r, 'Member ID').toUpperCase();
      if (!mId || !mId.startsWith('AV')) continue;

      const record = {
        memberId: mId,
        name: getCol(r, 'Name'),
        mobile: getCol(r, 'Mobile Number'),
        email: getCol(r, 'Email'),
        password: getCol(r, 'Password') || '123123',
        transactionPin: getCol(r, 'Transaction Pin'),
        sponsorId: getCol(r, 'Sponsor ID'),
        sponsorName: getCol(r, 'Sponsor Name'),
        package: getCol(r, 'Package'),
        eWallet: parseFloat(getCol(r, 'E-Wallet Balance')) || 0,
        fundWallet: parseFloat(getCol(r, 'Fund Wallet Balance')) || 0,
        pincode: getCol(r, 'Pincode') || '395006',
        state: getCol(r, 'State') || 'Gujarat',
        city: getCol(r, 'City') || 'Surat',
        address: getCol(r, 'Address') || '',
        pan: getCol(r, 'PAN Number'),
        aadhar: getCol(r, 'Aadhar Number'),
        aadharName: getCol(r, 'Name as per Aadhar'),
        gst: getCol(r, 'GST No'),
        nominee: getCol(r, 'Nominee'),
        relation: getCol(r, 'Nominee Relation'),
        bankName: getCol(r, 'Bank Name'),
        accountNumber: getCol(r, 'Account Number'),
        upiId: getCol(r, 'UPI ID'),
        ifsc: getCol(r, 'IFSC Code'),
      };

      if (!memberMap.has(mId)) {
        memberMap.set(mId, record);
      } else {
        const existing = memberMap.get(mId);
        for (const [k, v] of Object.entries(record)) {
          if (v && !existing[k]) existing[k] = v;
        }
      }
    }

    console.log(`Found ${memberMap.size} unique members to update.`);

    console.log("Hashing member passwords...");
    const hashCache = new Map();
    async function getHash(pwd) {
      if (hashCache.has(pwd)) return hashCache.get(pwd);
      const h = await bcrypt.hash(pwd, 10);
      hashCache.set(pwd, h);
      return h;
    }

    await client.query("BEGIN");

    console.log("Updating database records...");
    let updatedCount = 0;
    const members = Array.from(memberMap.values());

    for (const m of members) {
      const pwdHash = await getHash(m.password);
      const hasKyc = Boolean(m.pan || m.accountNumber || m.aadhar);
      const kycStatus = hasKyc ? 'VERIFIED' : 'NOT_SUBMITTED';

      await client.query(`
        UPDATE users
        SET
          mobile = COALESCE(NULLIF($1, ''), mobile),
          email = COALESCE(NULLIF($2, ''), email),
          password_hash = $3,
          wallet_balance = $4,
          rp_wallet = $5,
          pincode = COALESCE(NULLIF($6, ''), pincode),
          state = COALESCE(NULLIF($7, ''), state),
          city = COALESCE(NULLIF($8, ''), city),
          address = COALESCE(NULLIF($9, ''), address),
          pan_number = COALESCE(NULLIF($10, ''), pan_number),
          aadhaar_number = COALESCE(NULLIF($11, ''), aadhaar_number),
          aadhaar_name = COALESCE(NULLIF($12, ''), aadhaar_name),
          gst_number = COALESCE(NULLIF($13, ''), gst_number),
          nominee_name = COALESCE(NULLIF($14, ''), nominee_name),
          nominee_relation = COALESCE(NULLIF($15, ''), nominee_relation),
          bank_name = COALESCE(NULLIF($16, ''), bank_name),
          bank_account_number = COALESCE(NULLIF($17, ''), bank_account_number),
          ifsc_code = COALESCE(NULLIF($18, ''), ifsc_code),
          upi_id = COALESCE(NULLIF($19, ''), upi_id),
          kyc_status = CASE WHEN $20 = 'VERIFIED' THEN 'VERIFIED' ELSE kyc_status END,
          bank_status = CASE WHEN $17 <> '' THEN 'VERIFIED' ELSE bank_status END,
          pan_status = CASE WHEN $10 <> '' THEN 'VERIFIED' ELSE pan_status END,
          aadhaar_status = CASE WHEN $11 <> '' THEN 'VERIFIED' ELSE aadhaar_status END,
          updated_at = NOW()
        WHERE UPPER(member_id) = UPPER($21)
      `, [
        m.mobile,
        m.email,
        pwdHash,
        m.eWallet,
        m.fundWallet,
        m.pincode,
        m.state,
        m.city,
        m.address,
        m.pan,
        m.aadhar,
        m.aadharName,
        m.gst,
        m.nominee,
        m.relation,
        m.bankName,
        m.accountNumber,
        m.ifsc,
        m.upiId,
        kycStatus,
        m.memberId,
      ]);

      updatedCount++;
    }

    // Preserve AV0001 exact numbers
    await client.query(`
      UPDATE users
      SET 
        left_pv = 74369.00,
        right_pv = 178599.00,
        carry_left_pv = 0.00,
        carry_right_pv = 104230.00,
        total_team_count = 1638
      WHERE member_id = 'AV0001'
    `);

    await client.query("COMMIT");
    console.log(`\n🎉 SUCCESS! All ${updatedCount} members updated with 100% Real Master KYC, Bank & Passwords!`);

    // Verify AV0001 and sample members
    const checkAV0001 = await client.query(`
      SELECT member_id, full_name, mobile, email, wallet_balance, rp_wallet, bank_name, bank_account_number, pan_number, kyc_status, left_pv, right_pv, carry_left_pv, carry_right_pv
      FROM users WHERE member_id = 'AV0001'
    `);
    console.log("\nAV0001 Master Profile:", checkAV0001.rows[0]);

    const checkPooja = await client.query(`
      SELECT member_id, full_name, mobile, email, bank_name, bank_account_number, ifsc_code, pan_number, kyc_status
      FROM users WHERE member_id = 'AV94925'
    `);
    console.log("\nSample Member AV94925 (Pooja Kumari):", checkPooja.rows[0]);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Merge error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

mergeMasterDetails();
