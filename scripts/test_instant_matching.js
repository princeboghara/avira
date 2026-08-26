const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testInstantMatching() {
  console.log("=================================================");
  console.log("TESTING REAL-TIME 1:1 MATCHING, RED/GREEN STATUS, AND MEMBER ID ACTIVATION");
  console.log("=================================================");

  const client = await pool.connect();
  try {
    // 1. Register Member A on LEFT Leg
    console.log("\n1. Registering Member on LEFT leg of AV00001...");
    const regLeft = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV00001",
        fullName: "Rahul Verma",
        mobile: "9825300001",
        password: "passRahul123",
        pincode: "380001",
        city: "Ahmedabad",
        state: "Gujarat",
        position: "LEFT",
      }),
    });
    const leftData = await regLeft.json();
    const leftId = leftData.user?.memberId;
    console.log(`Registered Left Member: ${leftId} (${leftData.user?.fullName})`);
    console.log(`Initial Status: ${leftData.user?.status} (Personal PV: ${leftData.user?.personalPv}, Cap: ₹${leftData.user?.dailyCapping})`);

    // 2. Register Member B on RIGHT Leg
    console.log("\n2. Registering Member on RIGHT leg of AV00001...");
    const regRight = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorId: "AV00001",
        fullName: "Neha Sharma",
        mobile: "9825400002",
        password: "passNeha123",
        pincode: "395001",
        city: "Surat",
        state: "Gujarat",
        position: "RIGHT",
      }),
    });
    const rightData = await regRight.json();
    const rightId = rightData.user?.memberId;
    console.log(`Registered Right Member: ${rightId} (${rightData.user?.fullName})`);
    console.log(`Initial Status: ${rightData.user?.status} (Personal PV: ${rightData.user?.personalPv}, Cap: ₹${rightData.user?.dailyCapping})`);

    // 3. Test Live Name Lookup by Member ID (as in Store Page)
    console.log(`\n3. Testing Live Name Fetch for ${leftId}...`);
    const checkUser = await fetch(`http://localhost:3000/api/sponsor/${leftId}`).then(r => r.json());
    console.log(`Fetched Member Name: "${checkUser.fullName}", PV: ${checkUser.personalPv}, Status: ${checkUser.status}`);

    // 4. Activate Left Member with 250 PV
    console.log(`\n4. Activating 250 PV Package for ${leftId} (${checkUser.fullName})...`);
    const actLeft = await fetch("http://localhost:3000/api/products/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: leftId,
        packageName: "250 PV Executive Kit",
        amount: 2500,
        pv: 250,
        purchaseType: "ACTIVATION",
      }),
    }).then(r => r.json());
    console.log("Left Activation Result:", actLeft.message);
    console.log(`New Status for ${leftId}: Personal PV = ${actLeft.data.personalPv}, Daily Capping = ₹${actLeft.data.dailyCapping}/day`);

    // Check AV00001 Leg Volumes
    const midCheck = await client.query("SELECT member_id, left_pv, right_pv, wallet_balance FROM users WHERE member_id = 'AV00001'");
    console.log("AV00001 Volumes after Left Activation (Right is still 0):", midCheck.rows[0]);

    // 5. Activate Right Member with 100 PV (SHOULD TRIGGER INSTANT 1:1 MATCHING!)
    console.log(`\n5. Activating 100 PV Package for ${rightId} (Should trigger INSTANT 1:1 Matching!)...`);
    const actRight = await fetch("http://localhost:3000/api/products/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: rightId,
        packageName: "100 PV Starter Kit",
        amount: 1000,
        pv: 100,
        purchaseType: "ACTIVATION",
      }),
    }).then(r => r.json());
    console.log("Right Activation Result:", actRight.message);

    // 6. Check AV00001 Volumes & Wallet Balance (MUST HAVE INSTANT PAYOUT & CARRY FORWARD!)
    console.log("\n6. Checking AV00001 Balance & Carry Forward (WITHOUT CLICKING ANY ADMIN BUTTON!):");
    const finalCheck = await client.query(
      "SELECT member_id, left_pv, right_pv, carry_left_pv, carry_right_pv, wallet_balance, total_earnings FROM users WHERE member_id = 'AV00001'"
    );
    console.table(finalCheck.rows);

    // 7. Check Latest Transactions for AV00001
    const txCheck = await client.query(
      "SELECT type, amount, description, date FROM transactions WHERE user_id = 'usr_av00001_root' ORDER BY created_at DESC LIMIT 2"
    );
    console.log("Latest Transactions:");
    console.table(txCheck.rows);

    console.log("\n=================================================");
    console.log("VERIFICATION COMPLETE!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

testInstantMatching();
