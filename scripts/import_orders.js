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

// Helper to parse dates like "Tue 02 Jun, 2026 at 6:05 pm" or "02/06/2026"
function parseOrderDate(rawDate) {
  if (!rawDate) return new Date();
  try {
    const cleaned = rawDate.replace(/^[a-zA-Z]+,?\s*/, '').replace(' at ', ' ');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  } catch {
    // fallback
  }
  return new Date();
}

async function importOrders(filePath) {
  const client = await pool.connect();
  try {
    // 1. Locate file
    let targetPath = filePath;
    if (!targetPath) {
      // Look in Desktop
      const desktopDir = "C:\\Users\\pc\\Desktop";
      const files = fs.readdirSync(desktopDir).filter(f => (f.startsWith("aviralifecare_master_orders_") || f.startsWith("aviralifecare_all_orders_")) && f.endsWith(".json"));
      if (files.length > 0) {
        targetPath = path.join(desktopDir, files[files.length - 1]);
      } else {
        // Look in scripts folder
        const scriptFiles = fs.readdirSync("D:\\aviracare\\avira\\scripts").filter(f => (f.startsWith("aviralifecare_master_orders_") || f.startsWith("aviralifecare_all_orders_")) && f.endsWith(".json"));
        if (scriptFiles.length > 0) {
          targetPath = path.join("D:\\aviracare\\avira\\scripts", scriptFiles[scriptFiles.length - 1]);
        }
      }
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      console.error("❌ Orders JSON file not found. Please place the downloaded file on Desktop or pass path.");
      return;
    }

    console.log(`📖 Reading Orders from: ${targetPath}`);
    const raw = fs.readFileSync(targetPath, "utf-8");
    const orders = JSON.parse(raw);
    console.log(`Found ${orders.length} orders to import into Supabase...`);

    // 2. Fetch users lookup map (by member_id, phone, email, and name)
    const userRes = await client.query("SELECT id, member_id, phone, email, full_name FROM users");
    const memberIdMap = new Map();
    const phoneMap = new Map();
    const emailMap = new Map();

    userRes.rows.forEach(u => {
      if (u.member_id) memberIdMap.set(u.member_id.trim().toUpperCase(), u);
      if (u.phone) phoneMap.set(u.phone.trim().replace(/\D/g, '').slice(-10), u);
      if (u.email) emailMap.set(u.email.trim().toLowerCase(), u);
    });

    await client.query("BEGIN");

    let inserted = 0;

    for (const ord of orders) {
      const orderNumber = (ord.orderNumber || '').trim() || `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const rawDate = ord.orderedDate || ord.orderDate || '';
      const orderDate = parseOrderDate(rawDate);
      const totalAmount = parseFloat(ord.totalNetAmount || ord.totalAmount) || 0;
      const totalPv = parseFloat(ord.totalPv || ord.pv) || 0;
      const billBy = (ord.billBy || 'Admin').trim();
      const rawStatus = (ord.status || ord.orderStatus || 'delivered').toUpperCase();
      const status = rawStatus === 'DELIVERED' ? 'DELIVERED' : (rawStatus === 'PENDING' ? 'PENDING' : 'CONFIRMED');

      const rawMemberId = (ord.memberId || '').trim().toUpperCase();
      const customerName = ord.shippingFullName || ord.memberName || ord.name || '';
      const customerPhone = ord.shippingPhone || ord.phone || '';
      const customerEmail = ord.shippingEmail || ord.memberEmail || ord.email || '';
      const address = ord.shippingAddress || ord.address || '';
      const state = ord.shippingState || ord.state || '';
      const postCode = ord.shippingPostCode || ord.postCode || '';

      const fullShipping = [address, state, postCode].filter(Boolean).join(", ");

      // Match User
      let matchedUser = null;
      if (rawMemberId && memberIdMap.has(rawMemberId)) {
        matchedUser = memberIdMap.get(rawMemberId);
      } else if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
        if (phoneMap.has(cleanPhone)) matchedUser = phoneMap.get(cleanPhone);
      } else if (customerEmail) {
        if (emailMap.has(customerEmail.toLowerCase())) matchedUser = emailMap.get(customerEmail.toLowerCase());
      }

      const userId = matchedUser ? matchedUser.id : (rawMemberId || 'AV0001');
      const items = Array.isArray(ord.items) ? ord.items : [];

      let totalGst = 0;
      for (const it of items) {
        totalGst += parseFloat(it.gstAmount) || 0;
      }

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
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          amount = EXCLUDED.amount,
          pv = EXCLUDED.pv,
          items = EXCLUDED.items,
          status = EXCLUDED.status,
          billed_by = EXCLUDED.billed_by,
          customer_name = EXCLUDED.customer_name,
          customer_mobile = EXCLUDED.customer_mobile,
          customer_email = EXCLUDED.customer_email,
          shipping_address = EXCLUDED.shipping_address,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          order_date_raw = EXCLUDED.order_date_raw,
          gst_amount = EXCLUDED.gst_amount,
          net_amount = EXCLUDED.net_amount
      `, [
        orderNumber,
        userId,
        'REPURCHASE',
        items.length > 0 ? items[0].itemName : 'Product Order',
        totalAmount,
        totalPv,
        orderDate,
        JSON.stringify(items),
        status,
        billBy,
        customerName,
        customerPhone,
        customerEmail,
        fullShipping,
        state,
        postCode,
        rawDate,
        totalGst,
        totalAmount
      ]);

      inserted++;
    }

    await client.query("COMMIT");
    console.log(`✅ Successfully imported ${inserted} orders with 100% full table & item details!`);

    // Verification Summary
    const stats = await client.query(`
      SELECT status, COUNT(*) as count, SUM(amount) as total_revenue, SUM(pv) as total_pv
      FROM orders
      GROUP BY status
    `);
    console.log("\n=== Orders Status Breakdown ===");
    console.table(stats.rows);

    const sample = await client.query(`
      SELECT id, user_id, billed_by, customer_name, amount, pv, status, state
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log("\n=== Sample Imported Orders ===");
    console.table(sample.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error importing orders:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

const argFile = process.argv[2];
importOrders(argFile);
