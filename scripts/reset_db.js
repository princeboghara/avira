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

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log("1. Deleting all old transactions, orders, and users from Supabase...");
    await client.query("DROP TABLE IF EXISTS orders;");
    await client.query("DELETE FROM transactions;");
    await client.query("DELETE FROM users;");

    console.log("2. Seeding sole root 5-digit member: AV00001 (Avira Life Care Global)...");
    const adminHash = bcrypt.hashSync("admin123", 10);

    await client.query(
      `
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date,
        personal_pv, left_pv, right_pv, daily_capping, binary_position
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23
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
        1000.0,
        0.0,
        0.0,
        5000.0,
        "ROOT",
      ]
    );

    console.log("SUCCESS! Supabase database reset with 5-Digit Root Member AV00001:");
    const res = await client.query(
      "SELECT member_id, full_name, mobile, sponsor_id, role, status, personal_pv, daily_capping, wallet_balance FROM users;"
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
