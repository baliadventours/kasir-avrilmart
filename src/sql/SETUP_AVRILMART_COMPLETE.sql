-- ============================================
-- ALL-IN-ONE DATABASE SETUP + SAMPLE DATA
-- POS & Inventory Management System
-- AvrilMart - Complete Installation
-- ============================================
-- ⚡ Copy & paste semua script ini ke Supabase SQL Editor
-- ⚡ Klik "Run" untuk setup database lengkap
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING TABLES (Clean Start)
-- ============================================

DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_products_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_categories_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_product_stock_after_sale() CASCADE;

-- ============================================
-- STEP 2: CREATE ALL TABLES
-- ============================================

-- Users Table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  category TEXT NOT NULL,
  price_retail DECIMAL(12, 2) NOT NULL,
  price_wholesale DECIMAL(12, 2) NOT NULL,
  price_modal DECIMAL(12, 2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sales Table
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  price_type TEXT NOT NULL CHECK (price_type IN ('retail', 'wholesale')),
  payment_amount DECIMAL(12, 2),
  change_amount DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sale Items Table
CREATE TABLE sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE RLS POLICIES
-- ============================================

-- Users Policies
CREATE POLICY "Allow authenticated users to read users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow admin users to insert users" ON users FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Allow admin users to update users" ON users FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Allow admin users to delete users" ON users FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Products Policies
CREATE POLICY "Allow authenticated users to read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin users to insert products" ON products FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Allow admin users to update products" ON products FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Allow admin users to delete products" ON products FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Sales Policies
CREATE POLICY "Allow authenticated users to read sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to insert own sales" ON sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Sale Items Policies
CREATE POLICY "Allow authenticated users to read sale_items" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to insert sale_items" ON sale_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
);

-- Categories Policies
CREATE POLICY "Allow authenticated users to read categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin users to insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Allow admin users to update categories" ON categories FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Allow admin users to delete categories" ON categories FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- ============================================
-- STEP 5: CREATE INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_categories_name ON categories(name);

-- ============================================
-- STEP 6: CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- Users updated_at trigger
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Products updated_at trigger
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Categories updated_at trigger
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Auto decrease stock trigger
CREATE OR REPLACE FUNCTION update_product_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrease_stock_on_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_after_sale();

-- ============================================
-- STEP 7: INSERT SAMPLE CATEGORIES
-- ============================================

INSERT INTO categories (name, description) VALUES
  ('Makanan & Minuman', 'Produk makanan, minuman, dan snack'),
  ('Elektronik', 'Gadget, aksesoris elektronik, dan perangkat digital'),
  ('Pakaian & Fashion', 'Pakaian, sepatu, dan aksesoris fashion'),
  ('Peralatan Rumah Tangga', 'Peralatan dapur, kebersihan, dan kebutuhan rumah'),
  ('Kesehatan & Kecantikan', 'Produk kesehatan, vitamin, dan kosmetik'),
  ('Alat Tulis & Kantor', 'ATK, perlengkapan sekolah, dan kantor'),
  ('Mainan & Hobi', 'Mainan anak, game, dan perlengkapan hobi'),
  ('Olahraga & Outdoor', 'Peralatan olahraga dan aktivitas luar ruangan'),
  ('Otomotif', 'Aksesoris dan spare part kendaraan'),
  ('Buku & Media', 'Buku, majalah, dan media pembelajaran'),
  ('Perawatan Bayi', 'Perlengkapan dan kebutuhan bayi'),
  ('Pertukangan & Perkakas', 'Alat pertukangan dan perbaikan rumah');

-- ============================================
-- STEP 8: INSERT SAMPLE PRODUCTS
-- ============================================

-- Makanan & Minuman
INSERT INTO products (name, sku, barcode, category, price_retail, price_wholesale, price_modal, stock) VALUES
  ('Indomie Goreng Isi 40', 'FD-001', '8992388101015', 'Makanan & Minuman', 120000, 115000, 110000, 50),
  ('Aqua Botol 600ml Isi 24', 'FD-002', '8991001010211', 'Makanan & Minuman', 48000, 45000, 42000, 100),
  ('Kopi Kapal Api Special Mix Isi 30', 'FD-003', '8992745060154', 'Makanan & Minuman', 45000, 42000, 39000, 75),
  ('Susu Ultra Milk Full Cream 1 Liter', 'FD-004', '8992753000123', 'Makanan & Minuman', 18500, 17500, 16000, 60),
  ('Biskuit Roma Kelapa Isi 10', 'FD-005', '8992775001011', 'Makanan & Minuman', 22000, 20000, 18000, 80),
  ('Teh Sariwangi Isi 25', 'FD-006', '8992753000456', 'Makanan & Minuman', 12500, 11500, 10500, 90),
  ('Minyak Goreng Tropical 2 Liter', 'FD-007', '8991101010234', 'Makanan & Minuman', 35000, 33000, 31000, 40),

-- Elektronik
  ('Charger Smartphone Type-C Fast Charging', 'EL-001', '8888888000001', 'Elektronik', 45000, 40000, 35000, 30),
  ('Kabel Data USB Type-C 1 Meter', 'EL-002', '8888888000002', 'Elektronik', 15000, 12000, 10000, 100),
  ('Power Bank 10000mAh', 'EL-003', '8888888000003', 'Elektronik', 125000, 110000, 95000, 25),
  ('Earphone Bluetooth TWS', 'EL-004', '8888888000004', 'Elektronik', 85000, 75000, 65000, 40),
  ('Speaker Bluetooth Portable', 'EL-005', '8888888000005', 'Elektronik', 175000, 160000, 145000, 20),
  ('Mouse Wireless USB', 'EL-006', '8888888000006', 'Elektronik', 55000, 48000, 42000, 35),

-- Pakaian & Fashion
  ('Kaos Katun Polos Dewasa', 'FS-001', '7777777000001', 'Pakaian & Fashion', 45000, 40000, 35000, 60),
  ('Celana Jeans Pria', 'FS-002', '7777777000002', 'Pakaian & Fashion', 125000, 110000, 95000, 30),
  ('Sandal Jepit Dewasa', 'FS-003', '7777777000003', 'Pakaian & Fashion', 25000, 22000, 18000, 80),
  ('Topi Baseball Cap', 'FS-004', '7777777000004', 'Pakaian & Fashion', 35000, 30000, 25000, 50),

-- Peralatan Rumah Tangga
  ('Sabun Cuci Piring Ekonomis 800ml', 'RT-001', '8991234567890', 'Peralatan Rumah Tangga', 12000, 11000, 9500, 100),
  ('Pembersih Lantai Pine 900ml', 'RT-002', '8991234567891', 'Peralatan Rumah Tangga', 15000, 13500, 12000, 80),
  ('Tisu Toilet Isi 10 Roll', 'RT-003', '8991234567892', 'Peralatan Rumah Tangga', 28000, 25000, 22000, 60),
  ('Sapu Lidi', 'RT-004', '8991234567893', 'Peralatan Rumah Tangga', 15000, 13000, 11000, 40),
  ('Ember Plastik 15 Liter', 'RT-005', '8991234567894', 'Peralatan Rumah Tangga', 35000, 32000, 28000, 30),

-- Kesehatan & Kecantikan
  ('Sabun Mandi Lifebuoy 85gr', 'HB-001', '8999999123456', 'Kesehatan & Kecantikan', 5500, 5000, 4500, 150),
  ('Shampoo Clear Anti Ketombe 340ml', 'HB-002', '8999999123457', 'Kesehatan & Kecantikan', 28000, 25000, 22000, 70),
  ('Pasta Gigi Pepsodent 190gr', 'HB-003', '8999999123458', 'Kesehatan & Kecantikan', 12500, 11000, 9500, 90),
  ('Masker Kesehatan 3 Ply Isi 50', 'HB-004', '8999999123459', 'Kesehatan & Kecantikan', 45000, 40000, 35000, 50),
  ('Hand Sanitizer 100ml', 'HB-005', '8999999123460', 'Kesehatan & Kecantikan', 15000, 13000, 11000, 80),

-- Alat Tulis & Kantor
  ('Pulpen Standard Hitam Isi 12', 'ST-001', '6666666000001', 'Alat Tulis & Kantor', 12000, 10000, 8500, 100),
  ('Buku Tulis 58 Lembar', 'ST-002', '6666666000002', 'Alat Tulis & Kantor', 5000, 4500, 4000, 200),
  ('Pensil 2B Isi 12', 'ST-003', '6666666000003', 'Alat Tulis & Kantor', 15000, 13000, 11000, 80),
  ('Penghapus Putih', 'ST-004', '6666666000004', 'Alat Tulis & Kantor', 2500, 2000, 1500, 150),
  ('Kertas HVS A4 Isi 500 Lembar', 'ST-005', '6666666000005', 'Alat Tulis & Kantor', 55000, 50000, 45000, 40);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Show summary
SELECT 'SETUP COMPLETE!' as status;
SELECT '✅ Tables created: 5' as info;
SELECT '✅ Categories inserted: 12' as info;
SELECT '✅ Products inserted: 35' as info;
SELECT '' as separator;
SELECT '⚠️  NEXT STEP: Create Admin User' as important;
SELECT 'See instructions in comments at end of this file' as note;

-- ============================================
-- 🔐 ADMIN USER CREATION INSTRUCTIONS
-- ============================================
-- 
-- STEP 1: Create Auth User in Supabase Dashboard
-- ============================================
-- 1. Go to: Authentication > Users
-- 2. Click: "Add User"
-- 3. Fill in:
--    Email: avrilmart.com@gmail.com
--    Password: 123AvrilMart456
--    Auto Confirm: ✅ YES (check this!)
-- 4. Click: "Create User"
-- 5. Copy the User ID (UUID) from the list
--
-- ============================================
-- STEP 2: Insert into users table
-- ============================================
-- Run this query (replace USER-ID with the UUID from step 1):
--
-- INSERT INTO users (id, name, email, role)
-- VALUES (
--   'PASTE-USER-ID-HERE',
--   'Admin AvrilMart',
--   'avrilmart.com@gmail.com',
--   'admin'
-- );
--
-- ============================================
-- STEP 3: Verify Admin User
-- ============================================
-- SELECT * FROM users WHERE role = 'admin';
-- Should show 1 admin user
--
-- ============================================
-- STEP 4: Login to App
-- ============================================
-- 1. Open your app
-- 2. Login with:
--    Email: avrilmart.com@gmail.com
--    Password: 123AvrilMart456
-- 3. You should see all admin menus ✅
--
-- ============================================
-- 🎉 DONE! Database ready to use!
-- ============================================
-- 
-- Your database now has:
-- ✅ 5 tables with RLS security
-- ✅ 12 categories
-- ✅ 35 sample products with barcodes
-- ✅ Auto-update stock on sale
-- ✅ All triggers and indexes
-- 
-- Next: Create admin user following steps above!
-- ============================================
