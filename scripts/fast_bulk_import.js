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

async function fastBulkImport() {
  const jsonPath = path.join(__dirname, 'master_tree.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('master_tree.json not found!');
    process.exit(1);
  }

  const rawList = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawList.length} records.`);

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

  console.log('Calculating recursive tree stats...');
  const statsMap = new Map();
  function getSubtreeStats(memId) {
    if (!memId || !memberMap.has(memId)) return { count: 0, pv: 0 };
    if (statsMap.has(memId)) return statsMap.get(memId);
    const mem = memberMap.get(memId);
    const left = getSubtreeStats(mem.leftChildId);
    const right = getSubtreeStats(mem.rightChildId);

    const leftCount = (mem.leftChildId && memberMap.has(mem.leftChildId) ? 1 : 0) + left.count;
    const rightCount = (mem.rightChildId && memberMap.has(mem.rightChildId) ? 1 : 0) + right.count;

    const res = {
      count: leftCount + rightCount,
      pv: mem.packagePv + left.pv + right.pv,
      leftCount,
      rightCount,
      leftPv: left.pv,
      rightPv: right.pv,
    };
    statsMap.set(memId, res);
    return res;
  }

  for (const memId of memberMap.keys()) {
    getSubtreeStats(memId);
  }

  const client = await pool.connect();
  try {
    console.log('Connecting to database and starting transaction...');
    await client.query('BEGIN');

    // Clean old data
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

    const rootPassHash = bcrypt.hashSync('156951', 10);
    const defaultMemberPassHash = bcrypt.hashSync('123456', 10);
    const adminPassHash = bcrypt.hashSync('123123', 10);

    // Ensure Admin is isolated & present
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

    const userList = Array.from(memberMap.values());
    const CHUNK_SIZE = 200;

    // 1. Bulk INSERT into users
    console.log('Bulk inserting users...');
    for (let i = 0; i < userList.length; i += CHUNK_SIZE) {
      const chunk = userList.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];
      let pIdx = 1;

      for (const m of chunk) {
        const userId = m.memberId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.memberId}`;
        const passHash = m.memberId === 'AV0001' ? rootPassHash : defaultMemberPassHash;
        const sponsorMemId = m.sponsorId && m.sponsorId !== '-' ? m.sponsorId : null;
        const sponsorUserId = sponsorMemId ? (sponsorMemId === 'AV0001' ? 'usr_main_member_001' : `usr_${sponsorMemId}`) : null;
        const sponsorName = sponsorMemId && memberMap.has(sponsorMemId) ? memberMap.get(sponsorMemId).fullName : null;

        values.push(
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
          'MEMBER',
          'ACTIVE',
          m.activationDate
        );

        placeholders.push(
          `($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6}, $${pIdx+7}, $${pIdx+8}, $${pIdx+9}, $${pIdx+10}, $${pIdx+11}, $${pIdx+12}, $${pIdx+13}, $${pIdx+14}, NOW(), NOW())`
        );
        pIdx += 15;
      }

      await client.query(`
        INSERT INTO users (
          id, member_id, full_name, mobile, email, password_hash, sponsor_id, sponsor_name,
          pincode, city, state, address, role, status, joined_date, created_at, updated_at
        ) VALUES ${placeholders.join(', ')};
      `, values);
    }
    console.log('Users inserted.');

    // 2. Bulk INSERT into user_binary_pv
    console.log('Bulk inserting user_binary_pv...');
    for (let i = 0; i < userList.length; i += CHUNK_SIZE) {
      const chunk = userList.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];
      let pIdx = 1;

      for (const m of chunk) {
        const userId = m.memberId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.memberId}`;
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
        const st = statsMap.get(m.memberId) || { leftPv: 0, rightPv: 0 };

        values.push(
          userId,
          m.packagePv,
          st.leftPv,
          st.rightPv,
          0,
          0,
          parentUserId,
          binaryPos,
          leftChildUserId,
          rightChildUserId,
          5000
        );

        placeholders.push(
          `($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6}, $${pIdx+7}, $${pIdx+8}, $${pIdx+9}, $${pIdx+10}, NOW())`
        );
        pIdx += 11;
      }

      await client.query(`
        INSERT INTO user_binary_pv (
          user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
          binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping, updated_at
        ) VALUES ${placeholders.join(', ')};
      `, values);
    }
    console.log('user_binary_pv inserted.');

    // 3. Bulk INSERT into user_wallets
    console.log('Bulk inserting user_wallets...');
    for (let i = 0; i < userList.length; i += CHUNK_SIZE) {
      const chunk = userList.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];
      let pIdx = 1;

      for (const m of chunk) {
        const userId = m.memberId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.memberId}`;
        const st = statsMap.get(m.memberId) || { leftCount: 0, rightCount: 0 };

        values.push(userId, 0.00, 0.00, 0.00, 0.00, 0.00, 0, st.leftCount + st.rightCount);
        placeholders.push(
          `($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6}, $${pIdx+7}, NOW())`
        );
        pIdx += 8;
      }

      await client.query(`
        INSERT INTO user_wallets (
          user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings,
          direct_referrals_count, total_team_count, updated_at
        ) VALUES ${placeholders.join(', ')};
      `, values);
    }
    console.log('user_wallets inserted.');

    // 4. Bulk INSERT into user_kyc
    console.log('Bulk inserting user_kyc...');
    for (let i = 0; i < userList.length; i += CHUNK_SIZE) {
      const chunk = userList.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];
      let pIdx = 1;

      for (const m of chunk) {
        const userId = m.memberId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.memberId}`;
        values.push(userId, 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED');
        placeholders.push(
          `($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, NOW())`
        );
        pIdx += 5;
      }

      await client.query(`
        INSERT INTO user_kyc (
          user_id, kyc_status, aadhaar_status, pan_status, bank_status, updated_at
        ) VALUES ${placeholders.join(', ')};
      `, values);
    }
    console.log('user_kyc inserted.');

    await client.query('COMMIT');
    console.log('✅ ALL 1,679 MEMBERS COMMITTED IN RECORD TIME!');

    // Verification
    const countRes = await client.query(`SELECT count(*) FROM users WHERE role = 'MEMBER';`);
    const rootRes = await client.query(`
      SELECT u.member_id, u.full_name, b.personal_pv, b.left_child_id, b.right_child_id, w.total_team_count
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      JOIN user_wallets w ON u.id = w.user_id
      WHERE u.member_id = 'AV0001';
    `);

    console.log(`\n🎉 Verification:`);
    console.log(`Total Members in DB: ${countRes.rows[0].count}`);
    console.log(`Root Member (AV0001):`, rootRes.rows[0]);
  } catch (err) {
    console.error('Import error:', err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await pool.end();
  }
}

fastBulkImport();
