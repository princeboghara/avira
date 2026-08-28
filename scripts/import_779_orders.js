const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join("D:\\aviracare\\avira", file);
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

// Helper to parse dates like "2st June 2026 6:05:37 PM", "3nd June 2026 11:12:30 AM", "28th August 2026"
function parseOrderDate(rawDate) {
  if (!rawDate) return new Date();
  try {
    // Remove st, nd, rd, th from day (e.g. 2st -> 2, 3nd -> 3, 28th -> 28)
    const cleaned = rawDate.replace(/(\d+)(st|nd|rd|th)/i, "$1").replace(/^[a-zA-Z]+,?\s*/, "").replace(" at ", " ");
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  } catch {
    // fallback
  }
  return new Date();
}

// Simple robust CSV parser handling quoted multi-line JSON values
function parseCSV(text) {
  const cleanText = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const c = cleanText[i];
    const next = cleanText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      row.push(cur);
      cur = "";
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(cur);
      if (row.some(field => field.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    if (row.some(field => field.trim().length > 0)) {
      rows.push(row);
    }
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj = {};
    headers.forEach((h, colIdx) => {
      obj[h] = (r[colIdx] || "").trim();
    });
    data.push(obj);
  }

  return data;
}

async function run() {
  const client = await pool.connect();
  try {
    const csvPath = "C:\\Users\\pc\\Desktop\\aviralifecare_master_orders_779_2026-08-28.csv";
    console.log(`1. Reading CSV from: ${csvPath}`);
    const rawCSV = fs.readFileSync(csvPath, "utf-8");
    const records = parseCSV(rawCSV);
    console.log(`Parsed ${records.length} total orders from CSV!`);

    // 2. Fetch Users Map
    const userRes = await client.query("SELECT id, member_id, mobile, email, full_name FROM users");
    const memberIdMap = new Map();
    const phoneMap = new Map();
    const emailMap = new Map();

    userRes.rows.forEach(u => {
      if (u.member_id) memberIdMap.set(u.member_id.trim().toUpperCase(), u);
      if (u.mobile) phoneMap.set(u.mobile.trim().replace(/\D/g, "").slice(-10), u);
      if (u.email) emailMap.set(u.email.trim().toLowerCase(), u);
    });

    console.log(`Found ${userRes.rows.length} users in database for matching.`);

    await client.query("BEGIN");

    // Optional: Clear old orders if replacing
    await client.query("DELETE FROM orders;");
    console.log("Cleared old orders table before master import.");

    let inserted = 0;

    for (const rec of records) {
      const orderNumber = (rec["Order Number"] || "").trim() || `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const rawDate = rec["Ordered Date"] || "";
      const orderDate = parseOrderDate(rawDate);

      const billBy = (rec["BillBy"] || "AV0001").trim();
      const memberId = (rec["MemberID"] || "").trim().toUpperCase();
      const name = (rec["Name"] || rec["Shipping Full Name"] || "").trim();
      const email = (rec["Email"] || rec["Shipping Email"] || "").trim();
      const phone = (rec["Shipping Phone No"] || "").trim();
      const address = (rec["Shipping Address"] || "").trim();
      const state = (rec["Shipping State"] || "").trim();
      const pincode = (rec["Shipping Post Code"] || "").trim();

      const totalPv = parseFloat(rec["Total PV"]) || 0;
      const totalAmount = parseFloat(rec["Total Net Amount"]) || 0;
      
      const rawStatus = (rec["Status"] || "delivered").toLowerCase();
      let status = "DELIVERED";
      if (rawStatus.includes("cancel")) status = "CANCELLED";
      else if (rawStatus.includes("pending")) status = "PENDING";
      else if (rawStatus.includes("approved")) status = "APPROVED";
      else if (rawStatus.includes("dispatch")) status = "DISPATCHED";

      // Parse Items JSON
      let items = [];
      const rawItemsJson = rec["Items Details JSON"];
      if (rawItemsJson) {
        try {
          items = JSON.parse(rawItemsJson);
        } catch {
          // fallback
        }
      }

      // Calculate total GST
      let totalGst = 0;
      let totalNet = 0;
      if (Array.isArray(items)) {
        for (const it of items) {
          totalGst += parseFloat(it.gstAmount) || 0;
          totalNet += parseFloat(it.netAmount) || 0;
        }
      }

      // Package Name / Item Name
      const packageName = items.length > 0 ? items[0].itemName : (rec["Items Summary"] ? rec["Items Summary"].split("(")[0].trim() : "Standard Order");

      // Match User ID
      let matchedUser = null;
      if (memberId && memberIdMap.has(memberId)) {
        matchedUser = memberIdMap.get(memberId);
      } else if (phone) {
        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        if (phoneMap.has(cleanPhone)) matchedUser = phoneMap.get(cleanPhone);
      } else if (email && emailMap.has(email.toLowerCase())) {
        matchedUser = emailMap.get(email.toLowerCase());
      }

      const userId = matchedUser ? matchedUser.id : (memberId || "AV0001");
      const fullShipping = [address, state, pincode].filter(Boolean).join(", ");

      await client.query(`
        INSERT INTO orders (
          id, user_id, purchase_type, package_name, amount, pv,
          created_at, items, status, billed_by, customer_name,
          customer_mobile, customer_email, shipping_address, state,
          pincode, order_date_raw, gst_amount, net_amount
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18, $19
        )
      `, [
        orderNumber,
        userId,
        "REPURCHASE",
        packageName,
        totalAmount,
        totalPv,
        orderDate,
        JSON.stringify(items),
        status,
        billBy,
        name,
        phone,
        email,
        fullShipping,
        state,
        pincode,
        rawDate,
        totalGst,
        totalAmount
      ]);

      inserted++;
    }

    await client.query("COMMIT");
    console.log(`\n🎉 100% SUCCESS: Imported all ${inserted} orders into Supabase Database!\n`);

    // Verification Statistics
    const statsRes = await client.query(`
      SELECT status, COUNT(*) as order_count, SUM(amount) as total_revenue, SUM(pv) as total_pv
      FROM orders
      GROUP BY status
      ORDER BY order_count DESC
    `);
    console.log("=== Orders Breakdown by Status ===");
    console.table(statsRes.rows);

    const billByRes = await client.query(`
      SELECT billed_by, COUNT(*) as order_count, SUM(amount) as total_revenue
      FROM orders
      GROUP BY billed_by
      ORDER BY order_count DESC
      LIMIT 10
    `);
    console.log("\n=== Top Billing Entities (BillBy) ===");
    console.table(billByRes.rows);

    const sampleRes = await client.query(`
      SELECT id, user_id, billed_by, customer_name, customer_mobile, amount, pv, status, state, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log("\n=== Sample 10 Imported Orders ===");
    console.table(sampleRes.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error importing master orders:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
