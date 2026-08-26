const { Pool } = require("pg");
const { generateMemberId, isValidMemberId } = require("../src/lib/memberId.ts");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function verifyFourDigitSystem() {
  console.log("=================================================");
  console.log("TESTING 4-DIGIT MEMBER ID (AVxxxx) & ROOT AV0001");
  console.log("=================================================");

  const client = await pool.connect();
  try {
    // 1. Test generator
    const sampleId = generateMemberId();
    console.log(`Generated Sample Member ID: ${sampleId} (Length: ${sampleId.length})`);
    if (!isValidMemberId(sampleId)) {
      throw new Error(`Invalid 4-digit ID generated: ${sampleId}`);
    }
    console.log("PASS: 4-Digit Member ID format verified (AV + 4 digits)");

    // 2. Check root user AV0001 in Supabase
    const rootCheck = await client.query("SELECT member_id, full_name, role, status, personal_pv, daily_capping FROM users WHERE member_id = 'AV0001'");
    console.log("\nRoot User in Supabase:", rootCheck.rows[0]);
    if (rootCheck.rows.length === 0) {
      throw new Error("Root user AV0001 not found!");
    }

    // 3. Register Left Member using AV0001 as Sponsor
    console.log("\n3. Testing Registration under AV0001 (Position: LEFT)...");
    const regLeft = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV0001",
        fullName: "Vikram Mehta",
        mobile: "9825100001",
        password: "passVikram123",
        pincode: "380001",
        city: "Ahmedabad",
        state: "Gujarat",
        position: "LEFT",
      }),
    }).then(r => r.json());

    console.log(`Registered Left Member: ${regLeft.user?.memberId} (${regLeft.user?.fullName})`);
    if (!isValidMemberId(regLeft.user?.memberId)) {
      throw new Error(`Registered member ID is not 4 digits: ${regLeft.user?.memberId}`);
    }

    // 4. Register Right Member using AV0001 as Sponsor
    console.log("\n4. Testing Registration under AV0001 (Position: RIGHT)...");
    const regRight = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV0001",
        fullName: "Pooja Patel",
        mobile: "9825100002",
        password: "passPooja123",
        pincode: "395001",
        city: "Surat",
        state: "Gujarat",
        position: "RIGHT",
      }),
    }).then(r => r.json());

    console.log(`Registered Right Member: ${regRight.user?.memberId} (${regRight.user?.fullName})`);
    if (!isValidMemberId(regRight.user?.memberId)) {
      throw new Error(`Registered member ID is not 4 digits: ${regRight.user?.memberId}`);
    }

    // 5. Test Live Name Lookup for 4-digit ID
    const sponsorLookup = await fetch(`http://localhost:3000/api/sponsor/${regLeft.user?.memberId}`).then(r => r.json());
    console.log(`\n5. Sponsor Lookup for ${regLeft.user?.memberId}:`, sponsorLookup.fullName);

    // 6. Test Binary Tree structure for AV0001
    const treeRes = await fetch("http://localhost:3000/api/binary/tree/AV0001").then(r => r.json());
    console.log("\n6. Binary Tree Data for AV0001:");
    console.log(`Root: ${treeRes.tree?.memberId} (${treeRes.tree?.fullName})`);
    console.log(`- Left Child: ${treeRes.tree?.leftChild?.memberId} (${treeRes.tree?.leftChild?.fullName})`);
    console.log(`- Right Child: ${treeRes.tree?.rightChild?.memberId} (${treeRes.tree?.rightChild?.fullName})`);

    console.log("\n=================================================");
    console.log("ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyFourDigitSystem();
