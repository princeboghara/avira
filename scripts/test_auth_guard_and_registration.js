const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testAuthGuardAndRegistration() {
  console.log("=================================================");
  console.log("TESTING AUTH GUARD, LOGIN & DUPLICATE MOBILE");
  console.log("=================================================");

  // 1. Test Login strictly with Member ID
  console.log("\n1. Testing Login strictly with Member ID:");
  const validLogin = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      loginIdentifier: "AV00001",
      password: "admin123",
    }),
  }).then((r) => r.json());

  console.log("Member ID Login Result:", validLogin.success ? "SUCCESS" : "FAILED", validLogin.user?.memberId);
  if (!validLogin.success) throw new Error("Root AV00001 login failed!");

  // 2. Test Login with mobile number should be rejected
  console.log("\n2. Testing Login with Mobile Number (should reject, Member ID only):");
  const mobileLogin = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      loginIdentifier: "9876543210",
      password: "admin123",
    }),
  }).then((r) => r.json());

  console.log("Mobile Login Result (Expected Failed):", mobileLogin.success ? "UNEXPECTED PASS" : "CORRECTLY REJECTED");
  console.log("Response Message:", mobileLogin.message);
  if (mobileLogin.success) throw new Error("Mobile login should NOT be accepted!");

  // 3. Test Registration with Duplicate Mobile Number
  console.log("\n3. Testing Duplicate Mobile Number Support:");
  const testMobile = "9898000001";

  // Register Member 1
  const reg1 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sponsorId: "AV00001",
      fullName: "Member One",
      mobile: testMobile,
      password: "password123",
      pincode: "380001",
      city: "Ahmedabad",
      state: "Gujarat",
      position: "LEFT",
    }),
  }).then((r) => r.json());
  console.log("Member 1 Register:", reg1.success ? "SUCCESS" : "FAILED", reg1.user?.memberId, `Mobile: ${testMobile}`);
  if (!reg1.success) throw new Error(`Member 1 registration failed: ${reg1.message}`);

  // Register Member 2 with SAME mobile
  const reg2 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sponsorId: "AV00001",
      fullName: "Member Two",
      mobile: testMobile,
      password: "password123",
      pincode: "380001",
      city: "Ahmedabad",
      state: "Gujarat",
      position: "RIGHT",
    }),
  }).then((r) => r.json());
  console.log("Member 2 Register with SAME Mobile:", reg2.success ? "SUCCESS" : "FAILED", reg2.user?.memberId, `Mobile: ${testMobile}`);
  if (!reg2.success) throw new Error(`Duplicate mobile should be allowed! Error: ${reg2.message}`);

  // 4. Test Pincode Lookup
  console.log("\n4. Testing Pincode API for 380001:");
  const pinRes = await fetch("http://localhost:3000/api/pincode/380001").then((r) => r.json());
  console.log("Pincode 380001 Result:", pinRes);
  if (!pinRes.success || pinRes.city !== "Ahmedabad") throw new Error("Pincode lookup failed!");

  // 5. Test Middleware Guard: Unauthenticated access to /dashboard
  console.log("\n5. Testing Protected Route Guard on /dashboard:");
  const unauthRes = await fetch("http://localhost:3000/dashboard", {
    redirect: "manual",
  });
  console.log("Unauthenticated /dashboard Status:", unauthRes.status, `(Expected 307 redirect)`);
  console.log("Redirect Location:", unauthRes.headers.get("location"));
  if (unauthRes.status !== 307 && unauthRes.status !== 302) {
    throw new Error(`Expected redirect 307/302 from /dashboard, got ${unauthRes.status}`);
  }

  console.log("\n=================================================");
  console.log("ALL TESTS PASSED WITH 100% ACCURACY!");
  console.log("=================================================");

  await pool.end();
}

testAuthGuardAndRegistration().catch((e) => {
  console.error("Test Error:", e);
  process.exit(1);
});
