require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function getConnectionString() {
  let url = (process.env.DATABASE_URL || process.env.DIRECT_URL || '').trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.substring(1, url.length - 1).trim();
  }
  return url;
}

const connectionString = getConnectionString();

if (!connectionString || connectionString.includes('placeholder') || connectionString.includes('jtwpsnezyppfpqcpbnkj')) {
  console.error('\n❌ ERROR: Valid DATABASE_URL not found in .env!');
  console.error('Please configure your new Supabase connection string in .env before running this setup script.');
  console.error('Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runDatabaseSetup() {
  const client = await pool.connect();
  try {
    console.log('--- 🚀 STARTING COMPLETE SUPABASE DATABASE SETUP ---');
    console.log('Connected to database successfully!');

    await client.query('BEGIN');

    // 1. Create Sequences
    console.log('1. Creating sequences...');
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS order_invoice_seq START WITH 1001 INCREMENT BY 1;
    `);

    // 2. Create Core Tables
    console.log('2. Creating tables...');

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        member_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        password_hash TEXT NOT NULL,
        plain_password VARCHAR(255),
        sponsor_id VARCHAR(100),
        sponsor_name VARCHAR(255),
        pincode VARCHAR(10),
        city VARCHAR(100),
        state VARCHAR(100),
        address TEXT,
        role VARCHAR(20) DEFAULT 'MEMBER',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        avatar_url TEXT,
        joined_date VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // User Wallets
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_wallets (
        user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
        rp_wallet NUMERIC(12, 2) DEFAULT 0.00,
        fund_wallet NUMERIC(12, 2) DEFAULT 0.00,
        total_earnings NUMERIC(12, 2) DEFAULT 0.00,
        today_earnings NUMERIC(12, 2) DEFAULT 0.00,
        direct_referrals_count INTEGER DEFAULT 0,
        total_team_count INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // User Binary PV
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_binary_pv (
        user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        personal_pv NUMERIC(12, 2) DEFAULT 0.00,
        left_pv NUMERIC(12, 2) DEFAULT 0.00,
        right_pv NUMERIC(12, 2) DEFAULT 0.00,
        carry_left_pv NUMERIC(12, 2) DEFAULT 0.00,
        carry_right_pv NUMERIC(12, 2) DEFAULT 0.00,
        binary_parent_id VARCHAR(100),
        binary_position VARCHAR(10),
        left_child_id VARCHAR(100),
        right_child_id VARCHAR(100),
        daily_capping NUMERIC(12, 2) DEFAULT 1000.00,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // User KYC
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_kyc (
        user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        gst_number VARCHAR(50),
        pan_number VARCHAR(50),
        pan_card_url TEXT,
        pan_status VARCHAR(30) DEFAULT 'NOT_SUBMITTED',
        pan_rejection_reason TEXT,
        aadhaar_number VARCHAR(50),
        aadhaar_name VARCHAR(255),
        aadhaar_front_url TEXT,
        aadhaar_back_url TEXT,
        aadhaar_status VARCHAR(30) DEFAULT 'NOT_SUBMITTED',
        aadhaar_rejection_reason TEXT,
        bank_name VARCHAR(255),
        bank_account_number VARCHAR(100),
        ifsc_code VARCHAR(50),
        bank_proof_url TEXT,
        bank_status VARCHAR(30) DEFAULT 'NOT_SUBMITTED',
        bank_rejection_reason TEXT,
        upi_id VARCHAR(100),
        nominee_name VARCHAR(255),
        nominee_relation VARCHAR(100),
        kyc_status VARCHAR(30) DEFAULT 'NOT_SUBMITTED',
        kyc_document_url TEXT,
        kyc_rejection_reason TEXT,
        kyc_submitted_at TIMESTAMPTZ,
        kyc_verified_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // HSN Codes
    await client.query(`
      CREATE TABLE IF NOT EXISTS hsn_codes (
        id VARCHAR(100) PRIMARY KEY,
        hsn_code VARCHAR(50) UNIQUE NOT NULL,
        sgst NUMERIC(6, 2) DEFAULT 0.00,
        cgst NUMERIC(6, 2) DEFAULT 0.00,
        igst NUMERIC(6, 2) DEFAULT 0.00,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id VARCHAR(100),
        category_name VARCHAR(255),
        hsn_code VARCHAR(50),
        net_quantity VARCHAR(100),
        stock_quantity INTEGER DEFAULT 100,
        mrp NUMERIC(12, 2) NOT NULL,
        discount_price NUMERIC(12, 2),
        pv NUMERIC(12, 2) NOT NULL,
        image_url TEXT,
        description TEXT,
        in_stock BOOLEAN DEFAULT TRUE,
        tag VARCHAR(100),
        image_icon VARCHAR(100) DEFAULT 'spa',
        shipping_charge NUMERIC(10, 2) DEFAULT 0.00,
        is_free_shipping BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Shoppies
    await client.query(`
      CREATE TABLE IF NOT EXISTS shoppies (
        id VARCHAR(50) PRIMARY KEY,
        shoppy_id VARCHAR(50) UNIQUE NOT NULL,
        store_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(150),
        password_hash VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        invoice_no BIGINT,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        purchase_type VARCHAR(50),
        package_name VARCHAR(255),
        amount NUMERIC(12, 2) NOT NULL,
        pv NUMERIC(12, 2) NOT NULL,
        items JSONB,
        shipping_charge NUMERIC(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'PENDING',
        billed_by VARCHAR(50),
        customer_name VARCHAR(255),
        customer_mobile VARCHAR(50),
        shipping_address TEXT,
        transaction_id VARCHAR(100),
        payment_slip TEXT,
        rejection_reason TEXT,
        shoppy_id VARCHAR(50),
        shoppy_transferred_at TIMESTAMPTZ,
        courier_name VARCHAR(100),
        tracking_number VARCHAR(100),
        dispatched_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        tds_amount NUMERIC(12, 2) DEFAULT 0.00,
        admin_charge NUMERIC(12, 2) DEFAULT 0.00,
        rp_wallet_amount NUMERIC(12, 2) DEFAULT 0.00,
        net_amount NUMERIC(12, 2) DEFAULT 0.00,
        description TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'COMPLETED',
        reference_id VARCHAR(100),
        date VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Payouts
    await client.query(`
      CREATE TABLE IF NOT EXISTS payouts (
        id VARCHAR(100) PRIMARY KEY,
        week_identifier VARCHAR(50) NOT NULL,
        week_start_date VARCHAR(20) NOT NULL,
        week_end_date VARCHAR(20) NOT NULL,
        week_label VARCHAR(100),
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        member_id VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50),
        gross_amount NUMERIC(12, 2) NOT NULL,
        tds_amount NUMERIC(12, 2) DEFAULT 0.00,
        admin_charge NUMERIC(12, 2) DEFAULT 0.00,
        rp_wallet_deduction NUMERIC(12, 2) DEFAULT 0.00,
        net_amount NUMERIC(12, 2) NOT NULL,
        bank_name VARCHAR(255),
        bank_account_number VARCHAR(100),
        ifsc_code VARCHAR(50),
        upi_id VARCHAR(100),
        kyc_status VARCHAR(30),
        status VARCHAR(30) DEFAULT 'PENDING',
        paid_at TIMESTAMPTZ,
        transaction_reference VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Fund Requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_requests (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        member_id VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50),
        amount NUMERIC(12, 2) NOT NULL,
        transaction_id VARCHAR(100) NOT NULL,
        slip_url TEXT,
        status VARCHAR(30) DEFAULT 'PENDING',
        rejection_reason TEXT,
        approved_at TIMESTAMPTZ,
        approved_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Support Tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        member_id VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50),
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'OPEN',
        admin_response TEXT,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // PV Transfer History
    await client.query(`
      CREATE TABLE IF NOT EXISTS pv_transfer_history (
        id BIGSERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        member_id VARCHAR(50) NOT NULL,
        full_name VARCHAR(255),
        pv NUMERIC(12, 2) NOT NULL,
        leg VARCHAR(10),
        mode VARCHAR(50),
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Shipping Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipping_settings (
        id SERIAL PRIMARY KEY,
        default_shipping_charge NUMERIC(10, 2) DEFAULT 50.00,
        free_shipping_threshold NUMERIC(10, 2) DEFAULT 999.00,
        enable_free_shipping BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // System Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Create Performance Indexes
    console.log('3. Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_member_id ON users (UPPER(member_id));
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile);
      CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON users (sponsor_id);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
      CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_binary_pv_parent ON user_binary_pv (binary_parent_id);
      CREATE INDEX IF NOT EXISTS idx_user_binary_pv_left ON user_binary_pv (left_child_id);
      CREATE INDEX IF NOT EXISTS idx_user_binary_pv_right ON user_binary_pv (right_child_id);
      CREATE INDEX IF NOT EXISTS idx_user_kyc_pan ON user_kyc (pan_number);
      CREATE INDEX IF NOT EXISTS idx_user_kyc_aadhaar ON user_kyc (aadhaar_number);
      CREATE INDEX IF NOT EXISTS idx_user_kyc_status ON user_kyc (kyc_status);
      CREATE INDEX IF NOT EXISTS idx_shoppies_shoppy_id ON shoppies (UPPER(shoppy_id));
      CREATE INDEX IF NOT EXISTS idx_shoppies_mobile ON shoppies (mobile);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_shoppy_id ON orders (shoppy_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at);
      CREATE INDEX IF NOT EXISTS idx_payouts_week ON payouts (week_identifier);
      CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts (user_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts (status);
      CREATE INDEX IF NOT EXISTS idx_fund_requests_user ON fund_requests (user_id);
      CREATE INDEX IF NOT EXISTS idx_fund_requests_status ON fund_requests (status);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets (user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
      CREATE INDEX IF NOT EXISTS idx_pv_transfer_member ON pv_transfer_history (member_id);
    `);

    // 4. Create Consolidated View (v_users_full)
    console.log('4. Creating consolidated view v_users_full...');
    await client.query(`
      CREATE OR REPLACE VIEW v_users_full AS
      SELECT 
        u.id,
        u.member_id,
        u.full_name,
        u.mobile,
        u.email,
        u.password_hash,
        u.plain_password,
        u.sponsor_id,
        u.sponsor_name,
        u.pincode,
        u.city,
        u.state,
        u.address,
        u.role,
        u.status,
        u.avatar_url,
        u.joined_date,
        u.created_at,
        u.updated_at,
        COALESCE(w.wallet_balance, 0.00) as wallet_balance,
        COALESCE(w.rp_wallet, 0.00) as rp_wallet,
        COALESCE(w.fund_wallet, 0.00) as fund_wallet,
        COALESCE(w.total_earnings, 0.00) as total_earnings,
        COALESCE(w.today_earnings, 0.00) as today_earnings,
        COALESCE(w.direct_referrals_count, 0) as direct_referrals_count,
        COALESCE(w.total_team_count, 0) as total_team_count,
        COALESCE(b.personal_pv, 0.00) as personal_pv,
        COALESCE(b.left_pv, 0.00) as left_pv,
        COALESCE(b.right_pv, 0.00) as right_pv,
        COALESCE(b.carry_left_pv, 0.00) as carry_left_pv,
        COALESCE(b.carry_right_pv, 0.00) as carry_right_pv,
        b.binary_parent_id,
        b.binary_position,
        b.left_child_id,
        b.right_child_id,
        COALESCE(b.daily_capping, 1000.00) as daily_capping,
        k.gst_number,
        k.pan_number,
        k.pan_card_url,
        COALESCE(k.pan_status, 'NOT_SUBMITTED') as pan_status,
        k.pan_rejection_reason,
        k.aadhaar_number,
        k.aadhaar_name,
        k.aadhaar_front_url,
        k.aadhaar_back_url,
        COALESCE(k.aadhaar_status, 'NOT_SUBMITTED') as aadhaar_status,
        k.aadhaar_rejection_reason,
        k.bank_name,
        k.bank_account_number,
        k.ifsc_code,
        k.bank_proof_url,
        COALESCE(k.bank_status, 'NOT_SUBMITTED') as bank_status,
        k.bank_rejection_reason,
        k.upi_id,
        k.nominee_name,
        k.nominee_relation,
        COALESCE(k.kyc_status, 'NOT_SUBMITTED') as kyc_status,
        k.kyc_document_url,
        k.kyc_rejection_reason,
        k.kyc_submitted_at,
        k.kyc_verified_at
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      LEFT JOIN user_binary_pv b ON u.id = b.user_id
      LEFT JOIN user_kyc k ON u.id = k.user_id;
    `);

    // 5. Seed System Settings
    console.log('5. Seeding system_settings & shipping_settings...');
    await client.query(`
      INSERT INTO system_settings (key, value, description, updated_at)
      VALUES 
        ('leadership_level1_percent', '15', 'Leadership Supporting Bonus Level 1 Percentage', NOW()),
        ('leadership_level2_percent', '5', 'Leadership Supporting Bonus Level 2 Percentage', NOW()),
        ('shipping_charge', '50', 'Default parcel delivery shipping charge', NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

      INSERT INTO shipping_settings (id, default_shipping_charge, free_shipping_threshold, enable_free_shipping, updated_at)
      VALUES (1, 50.00, 999.00, FALSE, NOW())
      ON CONFLICT (id) DO UPDATE SET default_shipping_charge = EXCLUDED.default_shipping_charge;
    `);

    // 6. Seed HSN Codes
    console.log('6. Seeding HSN codes...');
    const defaultHsn = [
      { id: 'hsn_3004', code: '3004', sgst: 2.5, cgst: 2.5, igst: 5.0, desc: 'Ayurvedic & Herbal Formulations' },
      { id: 'hsn_2106', code: '2106', sgst: 9.0, cgst: 9.0, igst: 18.0, desc: 'Nutritional Supplements & Health Drinks' },
      { id: 'hsn_3304', code: '3304', sgst: 9.0, cgst: 9.0, igst: 18.0, desc: 'Personal Care & Skin Health' },
    ];
    for (const h of defaultHsn) {
      await client.query(`
        INSERT INTO hsn_codes (id, hsn_code, sgst, cgst, igst, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET hsn_code = EXCLUDED.hsn_code, sgst = EXCLUDED.sgst, cgst = EXCLUDED.cgst;
      `, [h.id, h.code, h.sgst, h.cgst, h.igst, h.desc]);
    }

    // 7. Seed Categories
    console.log('7. Seeding categories...');
    const defaultCategories = [
      { id: 'cat_cellular', name: 'Cellular Nutrition', desc: 'Deep cellular vitality and longevity superfoods' },
      { id: 'cat_immunity', name: 'Immunity', desc: 'Daily immune defense and bioflavonoid rich botanicals' },
      { id: 'cat_herbal', name: 'Herbal Wellness', desc: 'Classical Ayurvedic therapeutic extracts' },
      { id: 'cat_daily', name: 'Daily Care', desc: 'Natural organic essentials for skin, hair, and wellness' },
    ];
    for (const c of defaultCategories) {
      await client.query(`
        INSERT INTO categories (id, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
      `, [c.id, c.name, c.desc]);
    }

    // 8. Seed Default Products
    console.log('8. Seeding products...');
    const defaultProducts = [
      { id: 'prod_spirulina', name: 'Organic Spirulina 500mg', catId: 'cat_cellular', cat: 'Cellular Nutrition', hsn: '2106', net: '60 Veg Capsules', mrp: 450, dp: 375, pv: 12, desc: 'Pure Blue-Green Microalgae rich in chlorophyll and plant proteins', icon: 'spa' },
      { id: 'prod_tulsi', name: 'Panch Tulsi Ark Drops', catId: 'cat_immunity', cat: 'Immunity', hsn: '3004', net: '30 ml Glass Dropper', mrp: 299, dp: 250, pv: 8, desc: 'Concentrated liquid extract of 5 sacred Tulsi varieties', icon: 'water_drop' },
      { id: 'prod_noni', name: 'Noni Gold Premium Juice', catId: 'cat_cellular', cat: 'Cellular Nutrition', hsn: '2106', net: '500 ml Bottle', mrp: 699, dp: 575, pv: 18, desc: 'Enriched with Kokum and Morinda Citrifolia for gut detox', icon: 'medication_liquid' },
      { id: 'prod_curcumin', name: 'Curcumin Plus 95% Piperine', catId: 'cat_herbal', cat: 'Herbal Wellness', hsn: '3004', net: '60 Veg Capsules', mrp: 799, dp: 650, pv: 20, desc: 'Standardized 95% curcuminoids with black pepper piperine', icon: 'grain' },
      { id: 'prod_seabuckthorn', name: 'Sea Buckthorn Immunity Juice', catId: 'cat_immunity', cat: 'Immunity', hsn: '2106', net: '500 ml Bottle', mrp: 899, dp: 750, pv: 24, desc: 'Himalayan superfruit rich in rare Omega-7 and Vitamin C', icon: 'local_florist' },
      { id: 'prod_omega3', name: 'Omega-3 Triple Strength', catId: 'cat_cellular', cat: 'Cellular Nutrition', hsn: '2106', net: '60 Softgels', mrp: 999, dp: 825, pv: 28, desc: 'Purified deep-sea fish oil providing 1000mg Omega-3', icon: 'vital_signs' },
      { id: 'prod_calcium', name: 'Calcium & Vitamin D3 Bone Fortifier', catId: 'cat_daily', cat: 'Daily Care', hsn: '3004', net: '60 Tablets', mrp: 420, dp: 350, pv: 12, desc: 'Easily absorbable calcium citrate with bioavailable Vitamin D3', icon: 'healing' },
      { id: 'prod_ortho_oil', name: 'Ortho Relief Ayurvedic Oil', catId: 'cat_herbal', cat: 'Herbal Wellness', hsn: '3004', net: '100 ml Pump Bottle', mrp: 380, dp: 320, pv: 10, desc: 'Traditional herbal formulation for fast soothing of pain', icon: 'sanitizer' },
      { id: 'prod_aloe_gel', name: 'Pure Aloe Vera Multi-Purpose Gel', catId: 'cat_daily', cat: 'Daily Care', hsn: '3304', net: '200 gm Jar', mrp: 320, dp: 260, pv: 8, desc: '99% pure cold-pressed organic aloe vera leaf pulp', icon: 'eco' },
      { id: 'prod_diab_care', name: 'Diabetic Care Karela Jamun Juice', catId: 'cat_herbal', cat: 'Herbal Wellness', hsn: '3004', net: '1000 ml Bottle', mrp: 1199, dp: 999, pv: 35, desc: 'Potent blend of Karela, Jamun, Gurmar, and Methi extracts', icon: 'local_drink' },
      { id: 'prod_collagen', name: 'Pro-Collagen Youth Booster', catId: 'cat_daily', cat: 'Daily Care', hsn: '2106', net: '30 Ready-to-Mix Sachets', mrp: 1850, dp: 1550, pv: 50, desc: 'Premium hydrolyzed marine collagen peptides with hyaluronic acid', icon: 'diamond' },
    ];

    for (const p of defaultProducts) {
      await client.query(`
        INSERT INTO products (
          id, name, category_id, category_name, hsn_code, net_quantity,
          mrp, discount_price, pv, description, in_stock, tag, image_icon, stock_quantity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, $12, 500)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, mrp = EXCLUDED.mrp, discount_price = EXCLUDED.discount_price, pv = EXCLUDED.pv;
      `, [p.id, p.name, p.catId, p.cat, p.hsn, p.net, p.mrp, p.dp, p.pv, p.desc, `${p.pv} PV`, p.icon]);
    }

    // 9. Seed Master Administrator (ADMIN - pass: 123123)
    console.log('9. Seeding Master Administrator (ADMIN / pass: 123123)...');
    const adminPassHash = bcrypt.hashSync('123123', 10);
    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, email, password_hash, plain_password,
        pincode, city, state, address, role, status, joined_date, created_at, updated_at
      ) VALUES (
        'usr_admin_root', 'ADMIN', 'Avira Enterprise Administrator', '9999999999',
        'admin@aviralifecare.com', $1, '123123',
        '395001', 'Surat', 'Gujarat', 'Avira Executive Control Headquarters',
        'ADMIN', 'ACTIVE', '2024-01-01', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET password_hash = $1, role = 'ADMIN', status = 'ACTIVE';
    `, [adminPassHash]);

    // 10. Seed Root Member (AV0001 - pass: 156951)
    console.log('10. Seeding Main Root Member (AV0001 / pass: 156951)...');
    const rootPassHash = bcrypt.hashSync('156951', 10);
    await client.query(`
      INSERT INTO users (
        id, member_id, full_name, mobile, email, password_hash, plain_password,
        sponsor_id, sponsor_name, pincode, city, state, address,
        role, status, joined_date, created_at, updated_at
      ) VALUES (
        'usr_main_member_001', 'AV0001', 'Avira LifeCare', '9712326273',
        'member@aviralifecare.com', $1, '156951',
        NULL, NULL, '395001', 'Surat', 'Gujarat', 'Avira Life Care Headquarters',
        'MEMBER', 'ACTIVE', '2024-01-01', NOW(), NOW()
      )
      ON CONFLICT (member_id) DO UPDATE SET password_hash = $1, status = 'ACTIVE';
    `, [rootPassHash]);

    await client.query(`
      INSERT INTO user_wallets (user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings, direct_referrals_count, total_team_count, updated_at)
      VALUES ('usr_main_member_001', 0.00, 0.00, 0.00, 0.00, 0.00, 0, 0, NOW())
      ON CONFLICT (user_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO user_binary_pv (user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv, binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping, updated_at)
      VALUES ('usr_main_member_001', 1000, 0, 0, 0, 0, NULL, 'ROOT', NULL, NULL, 5000, NOW())
      ON CONFLICT (user_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO user_kyc (user_id, kyc_status, aadhaar_status, pan_status, bank_status, updated_at)
      VALUES ('usr_main_member_001', 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', NOW())
      ON CONFLICT (user_id) DO NOTHING;
    `);

    // 11. Seed Central Parcel Hub Shoppy (AVS01 - pass: 123456)
    console.log('11. Seeding Central Shoppy (AVS01 / pass: 123456)...');
    const shoppyPassHash = bcrypt.hashSync('123456', 10);
    await client.query(`
      INSERT INTO shoppies (
        id, shoppy_id, store_name, owner_name, mobile, email, password_hash,
        address, city, state, pincode, status, created_at, updated_at
      ) VALUES (
        'shp_surat_hub_01', 'AVS01', 'SURAT PARCEL HUB', 'Hub Manager',
        '9876543210', 'suratparcelhub@aviralifecare.com', $1,
        'Surat Central Logistics & Parcel Hub, Ring Road', 'Surat', 'Gujarat', '395002',
        'ACTIVE', NOW(), NOW()
      )
      ON CONFLICT (shoppy_id) DO UPDATE SET store_name = EXCLUDED.store_name, password_hash = $1;
    `, [shoppyPassHash]);

    // 12. Ensure all other member tables are completely clean and ONLY AV0001 and ADMIN exist
    console.log('\n12. Cleaning database to keep ONLY AV0001 and ADMIN...');
    await client.query(`
      DELETE FROM transactions;
      DELETE FROM payouts;
      DELETE FROM fund_requests;
      DELETE FROM support_tickets;
      DELETE FROM orders;
      DELETE FROM pv_transfer_history;
      DELETE FROM user_kyc WHERE user_id NOT IN ('usr_admin_root', 'usr_main_member_001');
      DELETE FROM user_wallets WHERE user_id NOT IN ('usr_admin_root', 'usr_main_member_001');
      DELETE FROM user_binary_pv WHERE user_id NOT IN ('usr_admin_root', 'usr_main_member_001');
      DELETE FROM users WHERE id NOT IN ('usr_admin_root', 'usr_main_member_001');
    `);

    await client.query('COMMIT');
    console.log('--- ✅ CORE DATABASE TABLES, VIEWS, SEQUENCES & SEED DATA COMPLETE ---');

    // Check if user explicitly passed --import-all to restore all members
    if (process.argv.includes('--import-all')) {
      console.log('\n--import-all flag detected. Restoring full binary member tree...');
      await restoreMemberNetwork(client);
    } else {
      console.log('✅ Clean database configured. ONLY main ID AV0001 and ADMIN are preserved as requested.');
    }

    console.log('\n🎉 ALL DATABASE SETUP COMPLETED WITH 100% SUCCESS!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database setup error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function restoreMemberNetwork(client) {
  const jsonPath = path.join(__dirname, 'master_tree.json');
  const rawList = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawList.length} members from master_tree.json.`);

  // Load scraped profile data if available
  const profileMap = new Map();
  const profilePath = path.join(__dirname, 'all_mlm_members_1871_PERFECT_100_PERCENT.json');
  if (fs.existsSync(profilePath)) {
    const scraped = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    for (const s of scraped) {
      if (s.memberId) profileMap.set(s.memberId.toUpperCase(), s);
    }
    console.log(`Loaded extra profile/KYC data for ${profileMap.size} members.`);
  }

  const memberMap = new Map();
  for (const row of rawList) {
    const memId = row['Member ID'].trim();
    memberMap.set(memId, {
      memberId: memId,
      fullName: (row['Name'] || memId).trim(),
      parentId: (row['Binary Parent ID'] || '').trim(),
      position: (row['Binary Position'] || '').trim(),
      leftChildId: (row['Left Child ID'] || '').trim(),
      rightChildId: (row['Right Child ID'] || '').trim(),
      sponsorId: (row['Sponsor ID'] || '').trim(),
      activationDate: row['Activation Date'] || '2024-01-01',
      packagePv: parseInt(row['Package Amount'] || '0', 10) || 0,
      depth: parseInt(row['Tree Level Depth'] || '0', 10) || 0,
    });
  }

  // Precalculate Subtree stats
  const statsMap = new Map();
  function getSubtreeStats(memId) {
    if (!memId || !memberMap.has(memId)) return { count: 0, pv: 0 };
    if (statsMap.has(memId)) return statsMap.get(memId);
    const mem = memberMap.get(memId);
    const left = getSubtreeStats(mem.leftChildId);
    const right = getSubtreeStats(mem.rightChildId);

    const leftCount = (mem.leftChildId && memberMap.has(mem.leftChildId) ? 1 : 0) + left.count;
    const rightCount = (mem.rightChildId && memberMap.has(mem.rightChildId) ? 1 : 0) + right.count;

    const res = {
      count: leftCount + rightCount,
      pv: mem.packagePv + left.pv + right.pv,
      leftCount,
      rightCount,
      leftPv: left.pv,
      rightPv: right.pv,
    };
    statsMap.set(memId, res);
    return res;
  }

  for (const memId of memberMap.keys()) {
    getSubtreeStats(memId);
  }

  const defaultPassHash = bcrypt.hashSync('123456', 8);
  const userList = Array.from(memberMap.values());
  const CHUNK_SIZE = 150;

  console.log(`Starting bulk import of ${userList.length} members in chunks of ${CHUNK_SIZE}...`);

  for (let i = 0; i < userList.length; i += CHUNK_SIZE) {
    const chunk = userList.slice(i, i + CHUNK_SIZE);
    for (const m of chunk) {
      if (m.memberId === 'AV0001') continue; // keep root

      const userId = `usr_${m.memberId}`;
      const prof = profileMap.get(m.memberId) || {};
      const plainPass = prof.password || '123456';
      const passHash = prof.password ? bcrypt.hashSync(prof.password, 8) : defaultPassHash;
      const sponsorMemId = m.sponsorId && m.sponsorId !== '-' ? m.sponsorId : null;
      const sponsorUserId = sponsorMemId ? (sponsorMemId === 'AV0001' ? 'usr_main_member_001' : `usr_${sponsorMemId}`) : null;
      const sponsorName = sponsorMemId && memberMap.has(sponsorMemId) ? memberMap.get(sponsorMemId).fullName : (prof.sponsorName || null);

      const parentUserId = m.parentId && m.parentId !== 'ROOT' && memberMap.has(m.parentId)
        ? (m.parentId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.parentId}`)
        : null;
      const binaryPos = m.position === 'LEFT' || m.position === 'RIGHT' ? m.position : null;
      const leftChildUserId = m.leftChildId && memberMap.has(m.leftChildId)
        ? (m.leftChildId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.leftChildId}`)
        : null;
      const rightChildUserId = m.rightChildId && memberMap.has(m.rightChildId)
        ? (m.rightChildId === 'AV0001' ? 'usr_main_member_001' : `usr_${m.rightChildId}`)
        : null;

      const st = statsMap.get(m.memberId) || { leftPv: 0, rightPv: 0, leftCount: 0, rightCount: 0 };
      const eWallet = parseFloat(prof.eWallet || '0') || 0;
      const fundWallet = parseFloat(prof.fundWallet || '0') || 0;

      // 1. Insert/Update users
      await client.query(`
        INSERT INTO users (
          id, member_id, full_name, mobile, email, password_hash, plain_password, sponsor_id, sponsor_name,
          pincode, city, state, address, role, status, joined_date, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'MEMBER', $14, $15, NOW(), NOW()
        )
        ON CONFLICT (member_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          mobile = EXCLUDED.mobile,
          email = EXCLUDED.email,
          plain_password = EXCLUDED.plain_password,
          sponsor_id = EXCLUDED.sponsor_id,
          sponsor_name = EXCLUDED.sponsor_name,
          pincode = EXCLUDED.pincode,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          address = EXCLUDED.address;
      `, [
        userId,
        m.memberId,
        prof.name || m.fullName,
        prof.mobile || '9876543210',
        prof.email || `${m.memberId.toLowerCase()}@aviralifecare.com`,
        passHash,
        plainPass,
        sponsorUserId,
        sponsorName,
        prof.pincode || '395001',
        prof.city || 'Surat',
        prof.state || 'Gujarat',
        prof.address || 'Gujarat, India',
        prof.package === 'Active' || m.packagePv >= 100 ? 'ACTIVE' : 'INACTIVE',
        prof.joiningDate || m.activationDate || '2024-01-01',
      ]);

      // 2. Insert/Update user_wallets
      await client.query(`
        INSERT INTO user_wallets (
          user_id, wallet_balance, rp_wallet, fund_wallet, total_earnings, today_earnings,
          direct_referrals_count, total_team_count, updated_at
        ) VALUES ($1, $2, 0.00, $3, $2, 0.00, 0, $4, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          wallet_balance = EXCLUDED.wallet_balance,
          fund_wallet = EXCLUDED.fund_wallet,
          total_team_count = EXCLUDED.total_team_count;
      `, [userId, eWallet, fundWallet, st.leftCount + st.rightCount]);

      // 3. Insert/Update user_binary_pv
      await client.query(`
        INSERT INTO user_binary_pv (
          user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv,
          binary_parent_id, binary_position, left_child_id, right_child_id, daily_capping, updated_at
        ) VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7, $8, 5000, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          personal_pv = EXCLUDED.personal_pv,
          left_pv = EXCLUDED.left_pv,
          right_pv = EXCLUDED.right_pv,
          binary_parent_id = EXCLUDED.binary_parent_id,
          binary_position = EXCLUDED.binary_position,
          left_child_id = EXCLUDED.left_child_id,
          right_child_id = EXCLUDED.right_child_id;
      `, [
        userId,
        m.packagePv,
        st.leftPv,
        st.rightPv,
        parentUserId,
        binaryPos,
        leftChildUserId,
        rightChildUserId,
      ]);

      // 4. Insert/Update user_kyc
      await client.query(`
        INSERT INTO user_kyc (
          user_id, pan_number, aadhaar_number, aadhaar_name, bank_name, bank_account_number,
          ifsc_code, upi_id, nominee_name, nominee_relation,
          kyc_status, pan_status, aadhaar_status, bank_status, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          pan_number = COALESCE(EXCLUDED.pan_number, user_kyc.pan_number),
          aadhaar_number = COALESCE(EXCLUDED.aadhaar_number, user_kyc.aadhaar_number),
          bank_name = COALESCE(EXCLUDED.bank_name, user_kyc.bank_name),
          bank_account_number = COALESCE(EXCLUDED.bank_account_number, user_kyc.bank_account_number),
          ifsc_code = COALESCE(EXCLUDED.ifsc_code, user_kyc.ifsc_code);
      `, [
        userId,
        prof.panNumber || null,
        prof.aadharNumber || null,
        prof.nameAsPerAadhar || null,
        prof.bankName || null,
        prof.accountNumber || null,
        prof.ifscCode || null,
        prof.upiId || null,
        prof.nominee || null,
        prof.relation || null,
        prof.panNumber ? 'VERIFIED' : 'NOT_SUBMITTED',
        prof.panNumber ? 'VERIFIED' : 'NOT_SUBMITTED',
        prof.aadharNumber ? 'VERIFIED' : 'NOT_SUBMITTED',
        prof.accountNumber ? 'VERIFIED' : 'NOT_SUBMITTED',
      ]);
    }
  }

  // Update direct_referrals_count accurately across the tree
  console.log('Calculating and updating direct referrals counts...');
  await client.query(`
    WITH counts AS (
      SELECT sponsor_id, COUNT(*) as cnt 
      FROM users 
      WHERE sponsor_id IS NOT NULL AND role != 'ADMIN' 
      GROUP BY sponsor_id
    )
    UPDATE user_wallets w
    SET direct_referrals_count = counts.cnt
    FROM counts
    WHERE w.user_id = counts.sponsor_id;
  `);

  console.log(`✅ Network restore complete for all ${userList.length} members!`);
}

runDatabaseSetup();
