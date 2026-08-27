const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding Supabase PostgreSQL with root admin and demo member...");

    const adminHash = bcrypt.hashSync("admin123", 10);
    const memberHash = bcrypt.hashSync("member123", 10);

    // Upsert Root Admin AV10001
    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (member_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        password_hash = EXCLUDED.password_hash;
    `,
      [
        "usr_admin_001",
        "AV10001",
        "Avira Founding Leader",
        "9876543210",
        adminHash,
        "AV10001",
        "Root System",
        "380001",
        "Ahmedabad",
        "Gujarat",
        "ADMIN",
        "ACTIVE",
        450000.0,
        1250000.0,
        42,
        1280,
        18500.0,
        "2024-01-01",
      ]
    );

    // Upsert Demo Member AV23900
    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (member_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        password_hash = EXCLUDED.password_hash;
    `,
      [
        "usr_member_002",
        "AV23900",
        "Rajesh Patel",
        "9988776655",
        memberHash,
        "AV10001",
        "Avira Founding Leader",
        "395001",
        "Surat",
        "Gujarat",
        "MEMBER",
        "ACTIVE",
        24500.0,
        87600.0,
        14,
        168,
        3200.0,
        "2024-06-15",
      ]
    );

    // Insert sample ledger transactions for AV23900
    await client.query(`
      INSERT INTO transactions (id, user_id, type, amount, description, status, date)
      VALUES 
        ('tx_101', 'usr_member_002', 'DIRECT_REFERRAL', 1500.00, 'Direct Referral Bonus from Member AV55124 (Virendra Shah)', 'COMPLETED', '2026-08-25 18:30'),
        ('tx_102', 'usr_member_002', 'LEVEL_BONUS', 850.00, 'Level 2 Matching Bonus (Team Growth)', 'COMPLETED', '2026-08-25 14:15'),
        ('tx_103', 'usr_member_002', 'MATCHING_BONUS', 1200.00, 'Binary Pair Matching Daily Cutoff Bonus', 'COMPLETED', '2026-08-24 23:59'),
        ('tx_104', 'usr_member_002', 'WITHDRAWAL', 10000.00, 'Instant Bank Transfer to HDFC Bank (A/C **4892)', 'COMPLETED', '2026-08-22 11:00')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("Seeding complete! AV10001 and AV23900 are active in Supabase.");
  } catch (err) {
    console.error("Seeding Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
