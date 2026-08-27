const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function resetAndInitDatabase() {
  const client = await pool.connect();
  try {
    console.log("==================================================");
    console.log("RESETTING & INITIALIZING AVIRA LIFECARE DATABASE");
    console.log("==================================================");

    await client.query("BEGIN");

    // 1. Ensure USERS Table & Add Missing Columns
    console.log("1. Creating / Updating 'users' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        member_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        password_hash TEXT NOT NULL,
        sponsor_id VARCHAR(20),
        sponsor_name VARCHAR(255),
        pincode VARCHAR(10) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        address TEXT DEFAULT '',
        role VARCHAR(20) DEFAULT 'MEMBER',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        wallet_balance NUMERIC(15, 2) DEFAULT 0.00,
        rp_wallet NUMERIC(15, 2) DEFAULT 0.00,
        total_earnings NUMERIC(15, 2) DEFAULT 0.00,
        direct_referrals_count INT DEFAULT 0,
        total_team_count INT DEFAULT 0,
        today_earnings NUMERIC(15, 2) DEFAULT 0.00,
        joined_date VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS rp_wallet NUMERIC(15, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS personal_pv NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS left_pv NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS right_pv NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS carry_left_pv NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS carry_right_pv NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS binary_parent_id VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS binary_position VARCHAR(10) NULL,
        ADD COLUMN IF NOT EXISTS left_child_id VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS right_child_id VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS daily_capping NUMERIC(10, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS pan_number VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS aadhaar_name VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS pan_card_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS bank_proof_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150) DEFAULT '',
        ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS nominee_name VARCHAR(150) DEFAULT '',
        ADD COLUMN IF NOT EXISTS nominee_relation VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS kyc_document_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
        ADD COLUMN IF NOT EXISTS aadhaar_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
        ADD COLUMN IF NOT EXISTS pan_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
        ADD COLUMN IF NOT EXISTS bank_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
        ADD COLUMN IF NOT EXISTS aadhaar_rejection_reason TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS pan_rejection_reason TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS bank_rejection_reason TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT DEFAULT '';

      CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
      CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON users(sponsor_id);
      CREATE INDEX IF NOT EXISTS idx_users_binary_parent ON users(binary_parent_id);
      CREATE INDEX IF NOT EXISTS idx_users_left_child ON users(left_child_id);
      CREATE INDEX IF NOT EXISTS idx_users_right_child ON users(right_child_id);
    `);

    // 2. Ensure CATEGORIES Table
    console.log("2. Creating / Updating 'categories' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(150) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
    `);

    // 3. Ensure HSN_CODES Table
    console.log("3. Creating / Updating 'hsn_codes' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS hsn_codes (
        id VARCHAR(100) PRIMARY KEY,
        hsn_code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        sgst NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
        cgst NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
        igst NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE hsn_codes
        ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS sgst NUMERIC(5, 2) DEFAULT 9.00,
        ADD COLUMN IF NOT EXISTS cgst NUMERIC(5, 2) DEFAULT 9.00,
        ADD COLUMN IF NOT EXISTS igst NUMERIC(5, 2) DEFAULT 18.00;
    `);

    // 4. Ensure PRODUCTS Table & Columns
    console.log("4. Creating / Updating 'products' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        mrp NUMERIC(12, 2) NOT NULL,
        dp NUMERIC(12, 2) NOT NULL,
        pv NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
        ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Health & Wellness',
        ADD COLUMN IF NOT EXISTS mrp NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS dp NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS pv NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50) DEFAULT '30049011',
        ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS stock INT DEFAULT 1000,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    `);

    // 5. Ensure ORDERS Table & Columns
    console.log("5. Creating / Updating 'orders' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        purchase_type VARCHAR(30) NOT NULL,
        package_name VARCHAR(150) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        pv NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS billed_by VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150) DEFAULT '',
        ADD COLUMN IF NOT EXISTS customer_mobile VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS shipping_address TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS payment_slip TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT '';

      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);

    // 6. Ensure TRANSACTIONS Table & Columns
    console.log("6. Creating / Updating 'transactions' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'COMPLETED',
        date VARCHAR(30) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS tds_amount NUMERIC(15, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS admin_charge NUMERIC(15, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS rp_wallet_amount NUMERIC(15, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS net_amount NUMERIC(15, 2) DEFAULT 0.00;

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);

    // 7. Ensure SUPPORT_TICKETS Table
    console.log("7. Creating / Updating 'support_tickets' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'OPEN',
        admin_reply TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_support_user_id ON support_tickets(user_id);
    `);

    // 8. RESET TEST DATA (Clean test orders, transactions, tickets & downline members)
    console.log("8. Cleaning test data...");
    await client.query("DELETE FROM support_tickets;");
    await client.query("DELETE FROM transactions;");
    await client.query("DELETE FROM orders;");
    await client.query("DELETE FROM users WHERE UPPER(member_id) != 'AV00001';");

    // 9. SEED ROOT MASTER ACCOUNT (AV00001)
    console.log("9. Initializing Root Master Account AV00001...");
    const masterPasswordHash = await bcrypt.hash("123123", 10);

    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, password_hash, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, rp_wallet, total_earnings,
        direct_referrals_count, total_team_count, today_earnings, joined_date,
        personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
        binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping
      ) VALUES (
        'usr_avira_root_master', 'AV00001', 'Avira Lifecare Global Master', '9712326273',
        $1, NULL, 'Avira Lifecare Global Private Limited',
        '395006', 'Surat', 'Gujarat', 'ADMIN', 'ACTIVE', 0.00, 0.00, 0.00,
        0, 0, 0.00, TO_CHAR(NOW(), 'YYYY-MM-DD'),
        1000.00, 0.00, 0.00, 0.00, 0.00,
        NULL, 'ROOT', NULL, NULL, 5000.00
      )
      ON CONFLICT (member_id) DO UPDATE SET
        full_name = 'Avira Lifecare Global Master',
        mobile = '9712326273',
        password_hash = $1,
        sponsor_id = NULL,
        sponsor_name = 'Avira Lifecare Global Private Limited',
        pincode = '395006',
        city = 'Surat',
        state = 'Gujarat',
        role = 'ADMIN',
        status = 'ACTIVE',
        personal_pv = 1000.00,
        daily_capping = 5000.00,
        left_child_id = NULL,
        right_child_id = NULL,
        binary_parent_id = NULL,
        binary_position = 'ROOT',
        wallet_balance = 0.00,
        rp_wallet = 0.00,
        total_earnings = 0.00,
        direct_referrals_count = 0,
        total_team_count = 0,
        today_earnings = 0.00,
        updated_at = NOW();
    `, [masterPasswordHash]);

    // 10. SEED DEFAULT CATEGORIES
    console.log("10. Seeding Categories...");
    await client.query("DELETE FROM categories;");
    const categories = [
      { id: "cat_health", name: "Health & Wellness", desc: "Immunity boosters, herbal extracts & nutritional health" },
      { id: "cat_daily", name: "Daily Essentials", desc: "Everyday health and household wellness essentials" },
      { id: "cat_personal", name: "Personal Care", desc: "Ayurvedic skin, hair, and personal wellness products" },
      { id: "cat_herbal", name: "Herbal Supplements", desc: "Pure organic drops, capsules and natural formulations" }
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (id, name, description, status)
        VALUES ($1, $2, $3, 'ACTIVE');
      `, [cat.id, cat.name, cat.desc]);
    }

    // 11. SEED DEFAULT HSN CODES
    console.log("11. Seeding HSN Codes...");
    await client.query("DELETE FROM hsn_codes;");
    const hsnCodes = [
      { id: "hsn_3004", code: "30049011", desc: "Ayurvedic Medicaments & Formulations", gst: 12.00, cgst: 6.00, sgst: 6.00, igst: 12.00 },
      { id: "hsn_2106", code: "21069099", desc: "Food Supplements & Nutritional Preparations", gst: 18.00, cgst: 9.00, sgst: 9.00, igst: 18.00 },
      { id: "hsn_3304", code: "33049990", desc: "Herbal Cosmetics & Skin Care Preparations", gst: 18.00, cgst: 9.00, sgst: 9.00, igst: 18.00 }
    ];

    for (const hsn of hsnCodes) {
      await client.query(`
        INSERT INTO hsn_codes (id, hsn_code, description, sgst, cgst, igst)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [hsn.id, hsn.code, hsn.desc, hsn.sgst, hsn.cgst, hsn.igst]);
    }

    // 12. SEED OFFICIAL PRODUCTS
    console.log("12. Seeding Official Avira Products...");
    await client.query("DELETE FROM products;");
    const initialProducts = [
      {
        id: "prod_spirulina",
        name: "Avira Organic Spirulina 500mg",
        slug: "avira-organic-spirulina-500mg",
        category: "Health & Wellness",
        mrp: 1499,
        dp: 999,
        pv: 50,
        hsn: "21069099",
        desc: "100% Organic certified Spirulina rich in plant protein, iron, and antioxidant phycocyanin for all-day energy and stamina.",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
        stock: 500
      },
      {
        id: "prod_tulsi",
        name: "Avira Panch Tulsi Ark Drops",
        slug: "avira-panch-tulsi-ark-drops",
        category: "Herbal Supplements",
        mrp: 599,
        dp: 399,
        pv: 20,
        hsn: "30049011",
        desc: "Concentrated extract of 5 rare species of Tulsi providing holistic respiratory support and natural immunity enhancement.",
        image: "https://images.unsplash.com/photo-1608248597359-07f9c8fba5c7?auto=format&fit=crop&q=80&w=800",
        stock: 750
      },
      {
        id: "prod_noni",
        name: "Avira Noni Gold Premium Juice",
        slug: "avira-noni-gold-premium-juice",
        category: "Health & Wellness",
        mrp: 1899,
        dp: 1299,
        pv: 65,
        hsn: "21069099",
        desc: "Pure Hawaiian Noni fruit extract enriched with Kokum and Garcinia for deep cellular rejuvenation and digestion support.",
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800",
        stock: 400
      },
      {
        id: "prod_curcumin",
        name: "Avira Curcumin Plus 95% Piperine",
        slug: "avira-curcumin-plus-95-piperine",
        category: "Herbal Supplements",
        mrp: 1699,
        dp: 1199,
        pv: 60,
        hsn: "30049011",
        desc: "Standardized 95% Curcuminoids with BioPerine for 2000% higher absorption, powerful joint health, and anti-inflammatory action.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800",
        stock: 350
      },
      {
        id: "prod_deaddiction",
        name: "Avira De-Addiction Drops (Herbal Formula)",
        slug: "avira-de-addiction-drops",
        category: "Health & Wellness",
        mrp: 2499,
        dp: 1799,
        pv: 100,
        hsn: "30049011",
        desc: "Advanced Ayurvedic herbal liquid drops designed to aid toxin cleansing, liver support, and lifestyle habit reformation.",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
        stock: 600
      }
    ];

    for (const p of initialProducts) {
      await client.query(`
        INSERT INTO products (id, name, slug, category, mrp, dp, pv, hsn_code, description, image_url, stock, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE);
      `, [p.id, p.name, p.slug, p.category, p.mrp, p.dp, p.pv, p.hsn, p.desc, p.image, p.stock]);
    }

    await client.query("COMMIT");
    console.log("==================================================");
    console.log("DATABASE RESET & INITIALIZATION SUCCESSFUL!");
    console.log("Root Master ID: AV00001 (Password: 123123)");
    console.log("All tables validated & indexed.");
    console.log("==================================================");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FATAL ERROR resetting database:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAndInitDatabase();
