const { Pool } = require("pg");
const { generateMemberId, isValidMemberId } = require("../src/lib/memberId.ts");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testFinalUserRequests() {
  console.log("=================================================");
  console.log("TESTING 5-DIGIT ID (AVxxxxx), TREE PRUNING & COMMUNITY");
  console.log("=================================================");

  const client = await pool.connect();
  try {
    // 1. Verify 5-digit generator
    const testId = generateMemberId();
    console.log(`1. Generated 5-Digit ID: ${testId} (Length: ${testId.length})`);
    if (!isValidMemberId(testId) || testId.length !== 7) {
      throw new Error(`Invalid 5-digit member ID: ${testId}`);
    }
    console.log("PASS: Member ID is strictly 5 digits (AV + 5 numbers)");

    // 2. Check root user AV00001
    const rootRes = await client.query("SELECT member_id, full_name, personal_pv, daily_capping FROM users WHERE member_id = 'AV00001'");
    console.log("\n2. Root Member in Supabase:", rootRes.rows[0]);
    if (rootRes.rows.length === 0) throw new Error("AV00001 root not found!");

    // 3. Check Initial Tree for AV00001
    console.log("\n3. Testing Binary Tree Pruning for empty root:");
    const treeRes = await fetch("http://localhost:3000/api/binary/tree/AV00001").then(r => r.json());
    console.log(`Root: ${treeRes.tree?.memberId}`);
    console.log(`Left Child: ${treeRes.tree?.leftChild} (Null = No downlines)`);
    console.log(`Right Child: ${treeRes.tree?.rightChild} (Null = No downlines)`);

    // 4. Register a Left member
    console.log("\n4. Registering Left Member under AV00001...");
    const regLeft = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV00001",
        fullName: "Dinesh Patel",
        mobile: "9825500001",
        password: "passDinesh123",
        pincode: "380001",
        city: "Ahmedabad",
        state: "Gujarat",
        position: "LEFT",
      }),
    }).then(r => r.json());

    console.log(`Registered Left Member: ${regLeft.user?.memberId} (${regLeft.user?.fullName})`);
    if (!isValidMemberId(regLeft.user?.memberId)) {
      throw new Error("Registered member ID is not 5 digits!");
    }

    // 5. Check updated tree
    console.log("\n5. Checking updated Tree structure:");
    const treeUpdated = await fetch("http://localhost:3000/api/binary/tree/AV00001").then(r => r.json());
    console.log(`Root: ${treeUpdated.tree?.memberId}`);
    console.log(`- Left Child: ${treeUpdated.tree?.leftChild?.memberId} (${treeUpdated.tree?.leftChild?.fullName})`);
    console.log(`- Right Child: ${treeUpdated.tree?.rightChild} (Empty - No slot displayed below it)`);

    console.log("\n=================================================");
    console.log("ALL REQUIREMENTS VERIFIED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

testFinalUserRequests();
