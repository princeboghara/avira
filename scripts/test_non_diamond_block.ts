import { pool } from "../src/lib/db";
import { runBinaryMatchingCutoff } from "../src/lib/binary";

async function testNonDiamond() {
  // Set A to 500 PV (Platinum - NOT Diamond)
  await pool.query("UPDATE user_binary_pv SET personal_pv = 500 WHERE user_id = 'usr_a'");
  
  const txBefore = await pool.query("SELECT count(*) FROM transactions WHERE user_id = 'usr_a' AND type = 'LEADERSHIP_BONUS'");
  const beforeCount = parseInt(txBefore.rows[0].count, 10);
  
  // Set B to have 500 L and 500 R carry
  await pool.query("UPDATE user_binary_pv SET carry_left_pv = 500, carry_right_pv = 500 WHERE user_id = 'usr_b'");
  
  // Run match on B
  await runBinaryMatchingCutoff();
  
  const txAfter = await pool.query("SELECT count(*) FROM transactions WHERE user_id = 'usr_a' AND type = 'LEADERSHIP_BONUS'");
  const afterCount = parseInt(txAfter.rows[0].count, 10);
  
  console.log("------------------------------------------------------------------");
  console.log("🔒 Non-Diamond Leadership Bonus Guard Test:");
  console.log("   - User A Personal PV:", 500, "(Platinum - Below 1000 Diamond PV)");
  console.log("   - Leadership Bonuses Before Match:", beforeCount);
  console.log("   - Leadership Bonuses After Match :", afterCount);
  console.log("   - Result:", afterCount === beforeCount ? "✅ PASS: Bonus correctly blocked when sponsor is NOT Diamond!" : "❌ FAIL");
  console.log("------------------------------------------------------------------");
}

testNonDiamond().then(() => pool.end());
