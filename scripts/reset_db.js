const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log("1. Deleting all old transactions and fake data from Supabase...");
    await client.query("DELETE FROM transactions;");
    await client.query("DELETE FROM users;");

    console.log("2. Seeding sole root member: AV00001 (Avira Life Care Global)...");
    const adminHash = bcrypt.hashSync("admin123", 10);

    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      );
    `,
      [
        "usr_av00001_root",
        "AV00001",
        "Avira Life Care Global",
        "9876543210",
        adminHash,
        "AV00001",
        "Avira Root System",
        "380001",
        "Ahmedabad",
        "Gujarat",
        "ADMIN",
        "ACTIVE",
        0.0,
        0.0,
        0,
        0,
        0.0,
        "2026-01-01",
      ]
    );

    console.log("SUCCESS! Supabase database reset. Live users table:");
    const res = await client.query(
      "SELECT member_id, full_name, mobile, sponsor_id, role, status, wallet_balance FROM users;"
    );
    console.table(res.rows);
  } catch (err) {
    console.error("Database reset error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
