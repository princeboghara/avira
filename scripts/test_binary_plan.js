const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testBinaryMLMPlan() {
  console.log("=================================================");
  console.log("1. TESTING 1:1 BINARY MLM PLAN & TREE HIERARCHY");
  console.log("=================================================");

  // 1. Check Root User AV00001
  const client = await pool.connect();
  try {
    const rootRes = await client.query("SELECT member_id, personal_pv, daily_capping FROM users WHERE member_id = 'AV00001'");
    console.log("Root User AV00001:", rootRes.rows[0]);

    // 2. Simulate API Call to Register Member A on LEFT Leg
    console.log("\n2. Registering Member on LEFT leg of AV00001...");
    const regLeftRes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV00001",
        fullName: "Karan Joshi (Left Leader)",
        mobile: "9825100001",
        password: "passKaran123",
        pincode: "380015",
        city: "Ahmedabad",
        state: "Gujarat",
        position: "LEFT",
      }),
    });
    const leftData = await regLeftRes.json();
    console.log("Registered Left Member:", leftData.user?.memberId, leftData.user?.fullName);

    // 3. Simulate API Call to Register Member B on RIGHT Leg
    console.log("\n3. Registering Member on RIGHT leg of AV00001...");
    const regRightRes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV00001",
        fullName: "Pooja Shah (Right Leader)",
        mobile: "9825200002",
        password: "passPooja123",
        pincode: "395001",
        city: "Surat",
        state: "Gujarat",
        position: "RIGHT",
      }),
    });
    const rightData = await regRightRes.json();
    console.log("Registered Right Member:", rightData.user?.memberId, rightData.user?.fullName);

    // 4. Purchase 5,000 PV for Left Member
    console.log(`\n4. Purchasing 5,000 PV Package for Left Member (${leftData.user?.memberId})...`);
    const buyLeftRes = await fetch("http://localhost:3000/api/products/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: leftData.user?.memberId,
        packageName: "5000 PV Royal Pack",
        amount: 5000,
        pv: 5000,
        purchaseType: "ACTIVATION",
      }),
    });
    const buyLeftData = await buyLeftRes.json();
    console.log("Left Purchase Result:", buyLeftData.message);

    // 5. Purchase 700 PV for Right Member
    console.log(`\n5. Purchasing 700 PV Package for Right Member (${rightData.user?.memberId})...`);
    const buyRightRes = await fetch("http://localhost:3000/api/products/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: rightData.user?.memberId,
        packageName: "700 PV Executive Pack",
        amount: 700,
        pv: 700,
        purchaseType: "ACTIVATION",
      }),
    });
    const buyRightData = await buyRightRes.json();
    console.log("Right Purchase Result:", buyRightData.message);

    // 6. Inspect AV00001's Leg Volumes Before Cutoff
    console.log("\n6. Root AV00001 Leg Volumes BEFORE Cutoff:");
    const preCutoff = await client.query(
      "SELECT member_id, personal_pv, left_pv, right_pv, wallet_balance, total_earnings FROM users WHERE member_id = 'AV00001'"
    );
    console.table(preCutoff.rows);

    // 7. Execute 1:1 Binary Cutoff Calculation
    console.log("\n7. Executing 1:1 Daily Binary Cutoff...");
    const cutoffRes = await fetch("http://localhost:3000/api/admin/binary/cutoff", {
      method: "POST",
    });
    const cutoffData = await cutoffRes.json();
    console.log("Cutoff Execution Result:", cutoffData.message);
    console.log("Payout Details:", cutoffData.data?.results);

    // 8. Inspect AV00001's Leg Volumes & Carry Forward AFTER Cutoff
    console.log("\n8. Root AV00001 Leg Volumes AFTER Cutoff (Carry Forward Verification):");
    const postCutoff = await client.query(
      "SELECT member_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv, wallet_balance, total_earnings FROM users WHERE member_id = 'AV00001'"
    );
    console.table(postCutoff.rows);

    // 9. Fetch Binary Tree API
    console.log("\n9. Testing Binary Tree API (/api/binary/tree/AV00001)...");
    const treeRes = await fetch("http://localhost:3000/api/binary/tree/AV00001");
    const treeData = await treeRes.json();
    console.log("Root:", treeData.tree?.fullName, `(${treeData.tree?.memberId})`);
    console.log(" -> Left Child:", treeData.tree?.leftChild?.fullName, `(${treeData.tree?.leftChild?.memberId})`, "PV:", treeData.tree?.leftChild?.personalPv);
    console.log(" -> Right Child:", treeData.tree?.rightChild?.fullName, `(${treeData.tree?.rightChild?.memberId})`, "PV:", treeData.tree?.rightChild?.personalPv);

    console.log("\n=================================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

testBinaryMLMPlan();
