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

function calculateDailyCapping(pv) {
  if (pv >= 1000) return 5000;
  if (pv >= 500) return 3000;
  if (pv >= 250) return 2000;
  if (pv >= 100) return 1000;
  return 0;
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function importBinaryTree() {
  const client = await pool.connect();
  try {
    console.log("Reading CSV file...");
    const csvPath = "D:\\aviracare\\avira\\scripts\\binary_tree.csv";
    const rawContent = fs.readFileSync(csvPath, "utf8");
    const lines = rawContent.split(/\r?\n/).filter(l => l.trim().length > 0);

    console.log(`Total CSV lines found: ${lines.length}`);
    if (lines.length <= 1) {
      throw new Error("CSV file is empty or only contains header!");
    }

    // Parse records
    const memberMap = new Map();
    let counter = 1;

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length < 4) continue;

      const memberId = parts[0];
      const parentId = parts[1];
      const position = parts[2];
      const name = parts[3];
      const sponsorId = parts[4] || 'AV0001';
      const activationDate = parts[5] || '-';
      const packageAmount = parseFloat(parts[6]) || 0;

      if (!memberId) continue;

      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          memberId,
          parentId,
          position: position.toUpperCase(),
          name,
          sponsorId: sponsorId.toUpperCase(),
          activationDate,
          packageAmount,
          index: counter++,
          leftChildId: null,
          rightChildId: null,
          dbId: memberId === 'AV0001' ? 'usr_av00001_root' : `usr_${memberId.toLowerCase()}`,
        });
      }
    }

    console.log(`Found ${memberMap.size} unique members in binary tree.`);

    // Build parent-child relationships in memory
    for (const [mId, m] of memberMap.entries()) {
      if (m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)) {
        const parent = memberMap.get(m.parentId);
        if (m.position === 'LEFT') {
          parent.leftChildId = m.dbId;
        } else if (m.position === 'RIGHT') {
          parent.rightChildId = m.dbId;
        }
      }
    }

    console.log("Generating password hash for members...");
    const defaultPasswordHash = await bcrypt.hash("123123", 10);

    await client.query("BEGIN");

    console.log("Upserting members into Supabase database...");
    let insertedCount = 0;

    for (const m of memberMap.values()) {
      const personalPv = m.packageAmount;
      const capping = calculateDailyCapping(personalPv);
      const status = personalPv >= 100 ? 'ACTIVE' : 'INACTIVE';
      const role = m.memberId === 'AV0001' ? 'ADMIN' : 'MEMBER';
      const parentDbId = (m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)) 
        ? memberMap.get(m.parentId).dbId 
        : null;

      // Unique mobile fallback
      const dummyMobile = `98${String(10000000 + m.index).substring(1)}`;

      await client.query(`
        INSERT INTO users (
          id, member_id, full_name, mobile, password_hash, role, status,
          sponsor_id, sponsor_name,
          binary_parent_id, binary_position, left_child_id, right_child_id,
          personal_pv, daily_capping,
          wallet_balance, total_earnings, today_earnings, rp_wallet,
          pincode, city, state, address,
          joined_date, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9,
          $10, $11, $12, $13,
          $14, $15,
          0.00, 0.00, 0.00, 0.00,
          '395006', 'Surat', 'Gujarat', 'Avira Lifecare Network',
          $16, NOW(), NOW()
        )
        ON CONFLICT (member_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          binary_parent_id = EXCLUDED.binary_parent_id,
          binary_position = EXCLUDED.binary_position,
          left_child_id = EXCLUDED.left_child_id,
          right_child_id = EXCLUDED.right_child_id,
          personal_pv = EXCLUDED.personal_pv,
          daily_capping = EXCLUDED.daily_capping,
          status = EXCLUDED.status,
          updated_at = NOW()
      `, [
        m.dbId,
        m.memberId,
        m.name,
        dummyMobile,
        defaultPasswordHash,
        role,
        status,
        m.sponsorId,
        'Avira Lifecare',
        parentDbId,
        m.position,
        m.leftChildId,
        m.rightChildId,
        personalPv,
        capping,
        m.activationDate !== '-' ? m.activationDate : '2026-06-01'
      ]);

      insertedCount++;
    }

    // Now update tree left_pv and right_pv by calculating subtree volumes
    console.log("Calculating Binary Team Volume (Left PV & Right PV)...");
    function calculateSubtreePV(nodeDbId) {
      if (!nodeDbId) return 0;
      let member = null;
      for (const m of memberMap.values()) {
        if (m.dbId === nodeDbId) {
          member = m;
          break;
        }
      }
      if (!member) return 0;

      const leftSubtreePV = calculateSubtreePV(member.leftChildId);
      const rightSubtreePV = calculateSubtreePV(member.rightChildId);

      member.computedLeftPV = leftSubtreePV;
      member.computedRightPV = rightSubtreePV;

      return member.packageAmount + leftSubtreePV + rightSubtreePV;
    }

    const rootMember = memberMap.get('AV0001');
    if (rootMember) {
      calculateSubtreePV(rootMember.dbId);

      // Update computed PVs
      for (const m of memberMap.values()) {
        if (m.computedLeftPV !== undefined || m.computedRightPV !== undefined) {
          await client.query(`
            UPDATE users
            SET left_pv = $1, right_pv = $2, carry_left_pv = $1, carry_right_pv = $2
            WHERE id = $3
          `, [m.computedLeftPV || 0, m.computedRightPV || 0, m.dbId]);
        }
      }
    }

    await client.query("COMMIT");

    console.log(`\n🎉 SUCCESS! Imported ${insertedCount} members into Supabase!`);
    
    // Check root node
    const rootCheck = await client.query(`
      SELECT member_id, full_name, left_child_id, right_child_id, left_pv, right_pv, personal_pv
      FROM users WHERE member_id = 'AV0001'
    `);
    console.log("Root AV0001 Node:", rootCheck.rows[0]);

    const totalCount = await client.query("SELECT COUNT(*) FROM users");
    console.log(`Total users currently in DB: ${totalCount.rows[0].count}`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

importBinaryTree();
