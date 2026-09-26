-- ========================================================================
-- AVIRA LIFECARE - MASTER SUPABASE POSTGRESQL SCHEMA DDL
-- ========================================================================

-- 1. Sequences
CREATE SEQUENCE IF NOT EXISTS order_invoice_seq START WITH 1001 INCREMENT BY 1;

-- 2. Master Users Table
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

-- 3. User Wallets
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

-- 4. User Binary PV & Hierarchy
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

-- 5. User KYC & Bank Details
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

-- 6. Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HSN Codes
CREATE TABLE IF NOT EXISTS hsn_codes (
  id VARCHAR(100) PRIMARY KEY,
  hsn_code VARCHAR(50) UNIQUE NOT NULL,
  sgst NUMERIC(6, 2) DEFAULT 0.00,
  cgst NUMERIC(6, 2) DEFAULT 0.00,
  igst NUMERIC(6, 2) DEFAULT 0.00,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Products
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

-- 9. Shoppies (Hubs)
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

-- 10. Orders
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

-- 11. Transactions
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

-- 12. Payouts
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

-- 13. Fund Requests
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

-- 14. Support Tickets
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

-- 15. PV Transfer History
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

-- 16. Shipping Settings
CREATE TABLE IF NOT EXISTS shipping_settings (
  id SERIAL PRIMARY KEY,
  default_shipping_charge NUMERIC(10, 2) DEFAULT 50.00,
  free_shipping_threshold NUMERIC(10, 2) DEFAULT 999.00,
  enable_free_shipping BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Indexes
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

-- 19. Consolidated View (v_users_full)
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

-- 20. Default System Settings
INSERT INTO system_settings (key, value, description, updated_at)
VALUES 
  ('leadership_level1_percent', '15', 'Leadership Supporting Bonus Level 1 Percentage', NOW()),
  ('leadership_level2_percent', '5', 'Leadership Supporting Bonus Level 2 Percentage', NOW()),
  ('shipping_charge', '50', 'Default parcel delivery shipping charge', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO shipping_settings (id, default_shipping_charge, free_shipping_threshold, enable_free_shipping, updated_at)
VALUES (1, 50.00, 999.00, FALSE, NOW())
ON CONFLICT (id) DO UPDATE SET default_shipping_charge = EXCLUDED.default_shipping_charge;

-- 21. Default HSN Codes
INSERT INTO hsn_codes (id, hsn_code, sgst, cgst, igst, description)
VALUES 
  ('hsn_3004', '3004', 2.5, 2.5, 5.0, 'Ayurvedic & Herbal Formulations'),
  ('hsn_2106', '2106', 9.0, 9.0, 18.0, 'Nutritional Supplements & Health Drinks'),
  ('hsn_3304', '3304', 9.0, 9.0, 18.0, 'Personal Care & Skin Health')
ON CONFLICT (id) DO NOTHING;

-- 22. Default Categories
INSERT INTO categories (id, name, description)
VALUES 
  ('cat_cellular', 'Cellular Nutrition', 'Deep cellular vitality and longevity superfoods'),
  ('cat_immunity', 'Immunity', 'Daily immune defense and bioflavonoid rich botanicals'),
  ('cat_herbal', 'Herbal Wellness', 'Classical Ayurvedic therapeutic extracts'),
  ('cat_daily', 'Daily Care', 'Natural organic essentials for skin, hair, and wellness')
ON CONFLICT (id) DO NOTHING;
