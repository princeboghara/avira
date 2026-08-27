const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, "..", file);
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

async function verifyAV0001() {
  const client = await pool.connect();
  try {
    console.log("1. Checking users table...");
    const res = await client.query("SELECT member_id, full_name, role, status, personal_pv FROM users");
    console.log("Registered users in DB:", res.rows);

    if (res.rows.length !== 1) {
      console.warn("WARNING: Expected exactly 1 root user, found:", res.rows.length);
    }

    const root = res.rows[0];
    if (root.member_id !== "AV0001") {
      throw new Error(`Expected root member_id to be AV0001, got ${root.member_id}`);
    }

    console.log("\n2. Checking 4-digit vs 5-digit rule...");
    const allMembersRes = await client.query("SELECT member_id FROM users");
    const fourDigitMembers = allMembersRes.rows.filter(r => r.member_id.length === 6); // "AV" + 4 digits = 6 chars
    console.log("4-digit member IDs count:", fourDigitMembers.length, "(Only AV0001 allowed)");

    if (fourDigitMembers.length !== 1 || fourDigitMembers[0].member_id !== "AV0001") {
      throw new Error("Violation of 4-digit rule: only AV0001 may have 4 digits!");
    }

    console.log("\n3. Testing sponsor lookup API for AV0001...");
    const sponsorRes = await fetch("http://localhost:3000/api/sponsor/AV0001").then(r => r.json());
    console.log("Sponsor API response for AV0001:", sponsorRes);

    console.log("\n4. Testing member login API for AV0001...");
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginIdentifier: "AV0001", password: "123123" }),
    }).then(r => r.json());
    console.log("Login API response for AV0001:", loginRes);

    if (!loginRes.success) {
      throw new Error("Failed to login as AV0001 with password 123123");
    }

    console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAV0001();
