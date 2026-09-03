require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

function parseDate(dateStr) {
  if (!dateStr || dateStr === '-' || dateStr === 'null') {
    return '2024-01-01';
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // fallback
  }
  return '2024-01-01';
}

async function runImport() {
  const client = await pool.connect();
  try {
    console.log('=== ULTRA-FAST 1,679 MEMBER MASTER BINARY TREE IMPORT ===');

    // 1. Read Binary Tree Records from JSON
    const treeJsonPath = path.join(__dirname, 'tree_data.json');
    const treeRecords = JSON.parse(fs.readFileSync(treeJsonPath, 'utf8'));
    console.log(`Loaded ${treeRecords.length} records from tree_data.json.`);

    await client.query('BEGIN');

    // 2. Drop NOT NULL constraints if present
    await client.query(`
      ALTER TABLE users ALTER COLUMN pincode DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN city DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN state DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN address DROP NOT NULL;
    `);

    // 3. Hash passwords
    console.log('Generating password hashes...');
    const memberPassHash = bcrypt.hashSync('156951', 10);

    const idMap = new Map();
    idMap.set('AV0001', 'usr_main_member_001');

    for (const r of treeRecords) {
      if (!idMap.has(r.memberId)) {
        idMap.set(r.memberId, `usr_${r.memberId.toLowerCase()}`);
      }
    }

    const usedMobiles = new Set();

    // 4. Build arrays of user data for batch inserts (Pure tree data ONLY)
    const preparedUsers = [];
    let memberCount = 0;

    for (const r of treeRecords) {
      const uId = idMap.get(r.memberId);
      const isRoot = r.memberId === 'AV0001';

      const numPart = r.memberId.replace(/\D/g, '').padStart(6, '0');
      let mobile = `98${numPart.slice(-8).padStart(8, '7')}`;
      if (usedMobiles.has(mobile)) {
        mobile = `97${String(10000000 + memberCount).slice(-8)}`;
      }
      usedMobiles.add(mobile);

      const email = `${r.memberId.toLowerCase()}@aviralifecare.com`;
      const joinedDate = parseDate(r.activationDate);
      const sponsorId = isRoot ? null : (r.sponsorId || 'AV0001');
      const sponsorName = isRoot ? null : 'Avira LifeCare';

      preparedUsers.push({
        id: uId,
        memberId: r.memberId,
        fullName: r.name || `Associate ${r.memberId}`,
        mobile,
        email,
        passwordHash: memberPassHash,
        sponsorId,
        sponsorName,
        pincode: null,
        city: null,
        state: null,
        address: null,
        joinedDate,
        packageAmount: Number(r.packageAmount || 0),
        parentId: r.parentId ? idMap.get(r.parentId) || null : null,
        position: (r.position === 'LEFT' || r.position === 'RIGHT') ? r.position : null,
        leftChildId: r.leftChildId ? idMap.get(r.leftChildId) || null : null,
        rightChildId: r.rightChildId ? idMap.get(r.rightChildId) || null : null,
      });

      memberCount++;
    }

    // 6. Batch Insert into `users` in chunks of 100
    console.log('Batch inserting users in chunks of 100...');
    const CHUNK_SIZE = 100;
    for (let i = 0; i < preparedUsers.length; i += CHUNK_SIZE) {
      const chunk = preparedUsers.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];

      chunk.forEach((u, idx) => {
        const offset = idx * 13;
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, 'MEMBER', 'ACTIVE', NOW(), NOW())`);
        values.push(u.id, u.memberId, u.fullName, u.mobile, u.email, u.passwordHash, u.sponsorId, u.sponsorName, u.pincode, u.city, u.state, u.address, u.joinedDate);
      });

      const sql = `
        INSERT INTO users (
          id, member_id, full_name, mobile, email, password_hash, sponsor_id, sponsor_name,
          pincode, city, state, address, joined_date, role, status, created_at, updated_at
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (member_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          mobile = EXCLUDED.mobile,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          sponsor_id = EXCLUDED.sponsor_id,
          pincode = EXCLUDED.pincode,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          address = EXCLUDED.address,
          status = 'ACTIVE',
          joined_date = EXCLUDED.joined_date,
          updated_at = NOW();
      `;

      await client.query(sql, values);
    }
    console.log(`Inserted all ${preparedUsers.length} users successfully.`);

    // 7. Batch Insert into `user_wallets`
    console.log('Batch inserting user_wallets...');
    for (let i = 0; i < preparedUsers.length; i += CHUNK_SIZE) {
      const chunk = preparedUsers.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];

      chunk.forEach((u, idx) => {
        placeholders.push(`($${idx + 1}, 0, 0, 0, 0, 0, 0, 0, NOW())`);
        values.push(u.id);
      });

      const sql = `
        INSERT INTO user_wallets (user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings, direct_referrals_count, total_team_count, updated_at)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (user_id) DO NOTHING;
      `;
      await client.query(sql, values);
    }

    // 8. Batch Insert into `user_kyc`
    console.log('Batch inserting user_kyc...');
    for (let i = 0; i < preparedUsers.length; i += CHUNK_SIZE) {
      const chunk = preparedUsers.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];

      chunk.forEach((u, idx) => {
        placeholders.push(`($${idx + 1}, 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', NOW())`);
        values.push(u.id);
      });

      const sql = `
        INSERT INTO user_kyc (user_id, kyc_status, aadhaar_status, pan_status, bank_status, updated_at)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (user_id) DO NOTHING;
      `;
      await client.query(sql, values);
    }

    // 9. Batch Insert/Update `user_binary_pv`
    console.log('Batch inserting user_binary_pv with tree links...');
    for (let i = 0; i < preparedUsers.length; i += CHUNK_SIZE) {
      const chunk = preparedUsers.slice(i, i + CHUNK_SIZE);
      const values = [];
      const placeholders = [];

      chunk.forEach((u, idx) => {
        const offset = idx * 6;
        placeholders.push(`($${offset + 1}, $${offset + 2}, 0, 0, 0, 0, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, 5000, NOW())`);
        values.push(u.id, u.packageAmount, u.parentId, u.position, u.leftChildId, u.rightChildId);
      });

      const sql = `
        INSERT INTO user_binary_pv (
          user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
          binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping, updated_at
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (user_id) DO UPDATE SET
          personal_pv = EXCLUDED.personal_pv,
          binary_parent_id = EXCLUDED.binary_parent_id,
          binary_position = EXCLUDED.binary_position,
          left_child_id = EXCLUDED.left_child_id,
          right_child_id = EXCLUDED.right_child_id,
          daily_capping = 5000,
          updated_at = NOW();
      `;
      await client.query(sql, values);
    }

    await client.query('COMMIT');
    console.log('=== ULTRA-FAST MASTER BINARY TREE IMPORT COMPLETED SUCCESSFULLY ===');

    // 10. Verification
    const userCountRes = await client.query('SELECT count(*) as count FROM users');
    const binaryCountRes = await client.query('SELECT count(*) as count FROM user_binary_pv');
    const rootNodeRes = await client.query(`
      SELECT u.member_id, u.full_name, b.personal_pv, b.binary_position,
             lp.member_id as left_child, rp.member_id as right_child
      FROM users u
      JOIN user_binary_pv b ON u.id = b.user_id
      LEFT JOIN users lp ON b.left_child_id = lp.id
      LEFT JOIN users rp ON b.right_child_id = rp.id
      WHERE u.member_id = 'AV0001'
    `);

    console.log('\n--- VERIFICATION STATS ---');
    console.log(`Total Users in DB: ${userCountRes.rows[0].count}`);
    console.log(`Total Binary Nodes: ${binaryCountRes.rows[0].count}`);
    console.log('Root Node AV0001:', rootNodeRes.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed with error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
