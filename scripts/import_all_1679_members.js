require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

function parseDateStr(dStr) {
  if (!dStr || dStr === '-' || dStr === '') return '2026-06-01';
  try {
    const d = new Date(dStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return '2026-06-01';
}

async function importTreeData() {
  const jsonPath = path.join(__dirname, 'master_tree.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('master_tree.json not found! Please run the parser first.');
    process.exit(1);
  }

  const rawList = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawList.length} member records from master_tree.json.`);

  // 1. Build lookup map for fast traversal
  const memberMap = new Map();
  for (const row of rawList) {
    const memId = row['Member ID'].trim();
    memberMap.set(memId, {
      memberId: memId,
      fullName: (row['Name'] || memId).trim(),
      parentId: (row['Binary Parent ID'] || '').trim(),
      position: (row['Binary Position'] || '').trim(),
      leftChildId: (row['Left Child ID'] || '').trim(),
      rightChildId: (row['Right Child ID'] || '').trim(),
      sponsorId: (row['Sponsor ID'] || '').trim(),
      activationDate: parseDateStr(row['Activation Date']),
      packagePv: parseInt(row['Package Amount'] || '0', 10) || 0,
      depth: parseInt(row['Tree Level Depth'] || '0', 10) || 0,
    });
  }

  // 2. Pre-calculate downline tree team count and PV totals
  console.log('Calculating recursive network volumes and team counts...');
  const statsMap = new Map();

  function getSubtreeStats(memId) {
    if (!memId || !memberMap.has(memId)) {
      return { count: 0, pv: 0 };
    }
    if (statsMap.has(memId)) {
      return statsMap.get(memId);
    }
    const mem = memberMap.get(memId);
    const left = getSubtreeStats(mem.leftChildId);
    const right = getSubtreeStats(mem.rightChildId);

    const leftCount = (mem.leftChildId && memberMap.has(mem.leftChildId) ? 1 : 0) + left.count;
    const rightCount = (mem.rightChildId && memberMap.has(mem.rightChildId) ? 1 : 0) + right.count;
    const leftPv = left.pv;
    const rightPv = right.pv;

    const res = {
      count: leftCount + rightCount,
      pv: mem.packagePv + left.pv + right.pv,
      leftCount,
      rightCount,
      leftPv,
      rightPv,
    };
    statsMap.set(memId, res);
    return res;
  }

  // Run stats for all nodes
  for (const memId of memberMap.keys()) {
    getSubtreeStats(memId);
  }
  console.log('Finished calculating tree statistics.');

  // 3. Connect to Database
  const client = await pool.connect();
  try {
    console.log('Starting atomic database transaction for 1,679 members...');
    await client.query('BEGIN');

    // Remove old member records, preserving admin
    await client.query(`
      DELETE FROM transactions;
      DELETE FROM payouts;
      DELETE FROM fund_requests;
      DELETE FROM support_tickets;
      DELETE FROM orders;
      DELETE FROM user_kyc WHERE user_id != 'usr_admin_root';
      DELETE FROM user_wallets WHERE user_id != 'usr_admin_root';
      DELETE FROM user_binary_pv WHERE user_id != 'usr_admin_root';
      DELETE FROM users WHERE role != 'ADMIN' AND id != 'usr_admin_root';
    `);

    // Pre-generate password hashes
    const rootPassHash = bcrypt.hashSync('156951', 10);
    const defaultMemberPassHash = bcrypt.hashSync('123456', 10);
    const adminPassHash = bcrypt.hashSync('123123', 10);

    // Ensure Admin is always present
    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, email, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, address, role, status, joined_date, created_at, updated_at
      ) VALUES (
        'usr_admin_root', 'ADMIN', 'Avira Enterprise Administrator', '9999999999',
        'admin@aviralifecare.com', $1, NULL, NULL, '395001', 'Surat', 'Gujarat',
        'Avira Executive Control Headquarters', 'ADMIN', 'ACTIVE', '2024-01-01', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET password_hash = $1, role = 'ADMIN', status = 'ACTIVE';
    `, [adminPassHash]);

    // Insert 1,679 Members in batches
    console.log('Inserting 1,679 users into database...');
    const userList = Array.from(memberMap.values());

    const BATCH_SIZE = 100;
    for (let i = 0; i < userList.length; i += BATCH_SIZE) {
      const batch = userList.slice(i, i + BATCH_SIZE);
      
      // Batch INSERT users
      for (const m of batch) {
        const userId = m.memberId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.memberId}`;
        const passHash = m.memberId === 'AV0001' ? rootPassHash : defaultMemberPassHash;
        const sponsorMemId = m.sponsorId && m.sponsorId !== '-' ? m.sponsorId : null;
        const sponsorUserId = sponsorMemId ? (sponsorMemId === 'AV0001' ? 'usr_main_member_001' : `usr_${sponsorMemId}`) : null;
        const sponsorName = sponsorMemId && memberMap.has(sponsorMemId) ? memberMap.get(sponsorMemId).fullName : null;

        await client.query(`
          INSERT INTO users (
            id, member_id, full_name, mobile, email, password_hash, sponsor_id, sponsor_name,
            pincode, city, state, address, role, status, joined_date, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'MEMBER', 'ACTIVE', $13, NOW(), NOW()
          );
        `, [
          userId,
          m.memberId,
          m.fullName,
          '9876543210',
          `${m.memberId.toLowerCase()}@aviralifecare.com`,
          passHash,
          sponsorUserId,
          sponsorName,
          '395001',
          'Surat',
          'Gujarat',
          'Gujarat, India',
          m.activationDate,
        ]);

        // Binary PV
        const parentUserId = m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)
          ? (m.parentId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.parentId}`)
          : null;
        const binaryPos = m.position === 'LEFT' || m.position === 'RIGHT' ? m.position : null;
        const leftChildUserId = m.leftChildId && memberMap.has(m.leftChildId)
          ? (m.leftChildId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.leftChildId}`)
          : null;
        const rightChildUserId = m.rightChildId && memberMap.has(m.rightChildId)
          ? (m.rightChildId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.rightChildId}`)
          : null;

        const st = statsMap.get(m.memberId) || { leftPv: 0, rightPv: 0, leftCount: 0, rightCount: 0 };

        await client.query(`
          INSERT INTO user_binary_pv (
            user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
            binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping, updated_at
          ) VALUES (
            $1, $2, $3, $4, 0, 0, $5, $6, $7, $8, 5000, NOW()
          );
        `, [
          userId,
          m.packagePv,
          st.leftPv,
          st.rightPv,
          parentUserId,
          binaryPos,
          leftChildUserId,
          rightChildUserId,
        ]);

        // Wallet
        await client.query(`
          INSERT INTO user_wallets (
            user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings,
            direct_referrals_count, total_team_count, updated_at
          ) VALUES (
            $1, 0.00, 0.00, 0.00, 0.00, 0.00, 0, $2, NOW()
          );
        `, [userId, st.leftCount + st.rightCount]);

        // KYC
        await client.query(`
          INSERT INTO user_kyc (
            user_id, kyc_status, aadhaar_status, pan_status, bank_status, updated_at
          ) VALUES (
            $1, 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', NOW()
          );
        `, [userId]);
      }
      process.stdout.write(`Processed ${Math.min(i + BATCH_SIZE, userList.length)} / ${userList.length} members...\r`);
    }

    console.log('\nAll 1,679 members processed. Committing transaction...');
    await client.query('COMMIT');
    console.log('✅ TRANSACTION COMMITTED SUCCESSFULLY!');

    // Verification
    const countRes = await client.query(`SELECT count(*) FROM users WHERE role = 'MEMBER';`);
    const rootRes = await client.query(`
      SELECT u.member_id, u.full_name, b.personal_pv, b.left_child_id, b.right_child_id
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      WHERE u.member_id = 'AV0001';
    `);

    console.log(`\n🎉 Verification:`);
    console.log(`Total Members in DB: ${countRes.rows[0].count}`);
    console.log(`Root Member (AV0001):`, rootRes.rows[0]);

  } catch (err) {
    console.error('Error during import:', err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await pool.end();
  }
}

importTreeData();
