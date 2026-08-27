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

async function runImport() {
  const client = await pool.connect();
  try {
    console.log("Reading full CSV from Desktop / scripts...");
    const csvPath = "D:\\aviracare\\avira\\scripts\\binary_tree.csv";
    const rawContent = fs.readFileSync(csvPath, "utf8");
    const lines = rawContent.split(/\r?\n/).filter(l => l.trim().length > 0);

    console.log(`Total CSV lines: ${lines.length}`);
    const memberMap = new Map();
    let counter = 1;

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      const memberId = parts[0];
      const parentId = parts[1];
      const position = parts[2];
      const name = parts[3];
      const sponsorId = parts[4] || 'AV0001';
      const activationDate = parts[5] || '-';
      const packageAmount = parseFloat(parts[6]) || 0;

      if (!memberId) continue;
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
        parentDbId: null,
        dbId: memberId === 'AV0001' ? 'usr_av00001_root' : `usr_${memberId.toLowerCase()}`,
        directCount: 0,
        leftTeamCount: 0,
        rightTeamCount: 0,
        leftPV: 0,
        rightPV: 0,
      });
    }

    console.log(`Loaded ${memberMap.size} unique members from CSV.`);

    // 1. Resolve sponsor names and direct referral counts
    for (const m of memberMap.values()) {
      if (m.sponsorId === 'AV0001') {
        m.sponsorName = 'Avira LifeCare';
      } else if (memberMap.has(m.sponsorId)) {
        m.sponsorName = memberMap.get(m.sponsorId).name;
        memberMap.get(m.sponsorId).directCount++;
      } else {
        m.sponsorName = 'Avira LifeCare';
      }

      if (m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)) {
        const parent = memberMap.get(m.parentId);
        m.parentDbId = parent.dbId;
        if (m.position === 'LEFT') parent.leftChildId = m.dbId;
        else if (m.position === 'RIGHT') parent.rightChildId = m.dbId;
      }
    }

    // 2. Recursive subtree volume & team count rollup
    console.log("Calculating Recursive Subtree Volumes and Team Counts...");
    function rollupSubtree(nodeDbId) {
      if (!nodeDbId) return { pv: 0, count: 0 };
      let node = null;
      for (const m of memberMap.values()) {
        if (m.dbId === nodeDbId) {
          node = m;
          break;
        }
      }
      if (!node) return { pv: 0, count: 0 };

      const left = rollupSubtree(node.leftChildId);
      const right = rollupSubtree(node.rightChildId);

      node.leftPV = left.pv;
      node.rightPV = right.pv;
      node.leftTeamCount = left.count;
      node.rightTeamCount = right.count;

      return {
        pv: node.packageAmount + left.pv + right.pv,
        count: 1 + left.count + right.count,
      };
    }

    const rootNode = memberMap.get('AV0001');
    if (rootNode) {
      rollupSubtree(rootNode.dbId);
    }

    console.log("Root Summary:");
    console.log(`- Member ID: ${rootNode.memberId} (${rootNode.name})`);
    console.log(`- Left Team: ${rootNode.leftTeamCount} members | ${rootNode.leftPV} PV`);
    console.log(`- Right Team: ${rootNode.rightTeamCount} members | ${rootNode.rightPV} PV`);
    console.log(`- Total Team Count: ${rootNode.leftTeamCount + rootNode.rightTeamCount} members`);

    console.log("\nGenerating password hash...");
    const defaultPasswordHash = await bcrypt.hash("123123", 10);

    console.log("Writing all 1,639 members into Supabase...");
    await client.query("BEGIN");

    // We do batch upserts in chunks of 50 for max speed and reliability
    const allMembers = Array.from(memberMap.values());
    const chunkSize = 50;
    let totalDone = 0;

    for (let i = 0; i < allMembers.length; i += chunkSize) {
      const chunk = allMembers.slice(i, i + chunkSize);
      for (const m of chunk) {
        const capping = calculateDailyCapping(m.packageAmount);
        const status = m.packageAmount >= 100 ? 'ACTIVE' : 'INACTIVE';
        const role = m.memberId === 'AV0001' ? 'ADMIN' : 'MEMBER';
        const dummyMobile = `98${String(10000000 + m.index).substring(1)}`;
        const totalTeam = m.leftTeamCount + m.rightTeamCount;

        await client.query(`
          INSERT INTO users (
            id, member_id, full_name, mobile, password_hash, role, status,
            sponsor_id, sponsor_name,
            binary_parent_id, binary_position, left_child_id, right_child_id,
            personal_pv, daily_capping,
            left_pv, right_pv, carry_left_pv, carry_right_pv,
            total_team_count, direct_referrals_count,
            wallet_balance, total_earnings, today_earnings, rp_wallet,
            pincode, city, state, address,
            joined_date, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9,
            $10, $11, $12, $13,
            $14, $15,
            $16, $17, $16, $17,
            $18, $19,
            0.00, 0.00, 0.00, 0.00,
            '395006', 'Surat', 'Gujarat', 'Avira Lifecare Network',
            $20, NOW(), NOW()
          )
          ON CONFLICT (member_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            sponsor_id = EXCLUDED.sponsor_id,
            sponsor_name = EXCLUDED.sponsor_name,
            binary_parent_id = EXCLUDED.binary_parent_id,
            binary_position = EXCLUDED.binary_position,
            left_child_id = EXCLUDED.left_child_id,
            right_child_id = EXCLUDED.right_child_id,
            personal_pv = EXCLUDED.personal_pv,
            daily_capping = EXCLUDED.daily_capping,
            left_pv = EXCLUDED.left_pv,
            right_pv = EXCLUDED.right_pv,
            carry_left_pv = EXCLUDED.carry_left_pv,
            carry_right_pv = EXCLUDED.carry_right_pv,
            total_team_count = EXCLUDED.total_team_count,
            direct_referrals_count = EXCLUDED.direct_referrals_count,
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
          m.sponsorName,
          m.parentDbId,
          m.position,
          m.leftChildId,
          m.rightChildId,
          m.packageAmount,
          capping,
          m.leftPV,
          m.rightPV,
          totalTeam,
          m.directCount,
          m.activationDate !== '-' ? m.activationDate : '2026-06-01',
        ]);
        totalDone++;
      }
      process.stdout.write(`\rImported ${totalDone} / ${allMembers.length} members...`);
    }

    await client.query("COMMIT");
    console.log("\n\n✅ ALL 1,639 MEMBERS IMPORTED AND SYNCHRONIZED SUCCESSFULLY!");

    // Final verification
    const countCheck = await client.query("SELECT COUNT(*) FROM users");
    console.log(`Total users in DB: ${countCheck.rows[0].count}`);

    const downlineCheck = await client.query(`
      WITH RECURSIVE downline AS (
        SELECT id, member_id, binary_parent_id, 1 as level 
        FROM users 
        WHERE binary_parent_id = 'usr_av00001_root'
        UNION ALL
        SELECT u.id, u.member_id, u.binary_parent_id, d.level + 1 
        FROM users u 
        INNER JOIN downline d ON u.binary_parent_id = d.id
      )
      SELECT COUNT(*) as downline_count, MAX(level) as max_depth FROM downline;
    `);
    console.log("Live Downline under AV0001 in DB:", downlineCheck.rows[0]);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
