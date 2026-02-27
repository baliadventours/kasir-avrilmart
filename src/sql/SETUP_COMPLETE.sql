-- ===================================================================
-- COMPLETE AVRILMART POS DATABASE SETUP
-- ===================================================================
-- Version: 2.0
-- Date: February 27, 2026
-- Description: Complete all-in-one database setup untuk AvrilMart POS
-- 
-- INSTRUCTIONS:
-- 1. Copy semua SQL ini
-- 2. Buka Supabase SQL Editor
-- 3. Paste dan RUN
-- 4. Setup akan otomatis membuat: tables, RLS policies, triggers, 
--    sample categories, sample products, dan admin user
-- ===================================================================

-- ===================================================================
-- STEP 1: CREATE TABLES
-- ===================================================================

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  category TEXT NOT NULL,
  price_retail DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_wholesale DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_modal DECIMAL(10, 2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  price_type TEXT NOT NULL CHECK (price_type IN ('retail', 'wholesale')),
  payment_amount DECIMAL(10, 2),
  change_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items Table
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- ===================================================================
-- STEP 3: CREATE TRIGGERS
-- ===================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-decrease stock when sale is made
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrease_stock
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_stock();

-- ===================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 5: CREATE RLS POLICIES
-- ===================================================================

-- Users Policies
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Categories Policies
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Products Policies
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Sales Policies
CREATE POLICY "Users can read their own sales"
  ON sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all sales"
  ON sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sale Items Policies
CREATE POLICY "Users can read their own sale items"
  ON sale_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all sale items"
  ON sale_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create sale items"
  ON sale_items FOR INSERT
  WITH CHECK (true);

-- ===================================================================
-- STEP 6: INSERT SAMPLE CATEGORIES
-- ===================================================================

INSERT INTO categories (name, description) VALUES
('Makanan & Minuman', 'Kategori untuk produk makanan dan minuman'),
('Elektronik', 'Kategori untuk produk elektronik'),
('Pakaian', 'Kategori untuk produk pakaian'),
('Kesehatan & Kecantikan', 'Kategori untuk produk kesehatan dan kecantikan'),
('Rumah Tangga', 'Kategori untuk keperluan rumah tangga'),
('Alat Tulis & Kantor', 'Kategori untuk alat tulis dan perlengkapan kantor'),
('Mainan & Hobi', 'Kategori untuk mainan dan hobi'),
('Olahraga', 'Kategori untuk perlengkapan olahraga'),
('Otomotif', 'Kategori untuk aksesoris kendaraan'),
('Peralatan Bayi', 'Kategori untuk keperluan bayi'),
('Buku & Majalah', 'Kategori untuk buku dan majalah'),
('Lain-lain', 'Kategori untuk produk lainnya')
ON CONFLICT (name) DO NOTHING;

-- ===================================================================
-- STEP 7: INSERT SAMPLE PRODUCTS WITH BARCODES
-- ===================================================================

INSERT INTO products (name, sku, barcode, category, price_retail, price_wholesale, price_modal, stock) VALUES
-- Makanan & Minuman (10 produk)
('Aqua Botol 600ml Isi 24', 'BRG-001', '8991001010211', 'Makanan & Minuman', 48000, 45000, 42000, 100),
('Indomie Goreng Isi 40', 'BRG-002', '8992388101015', 'Makanan & Minuman', 160000, 155000, 150000, 80),
('Kopi Kapal Api Special Mix', 'BRG-003', '8992745060154', 'Makanan & Minuman', 18000, 17000, 16000, 120),
('Teh Pucuk Harum Botol 350ml', 'BRG-004', '8886008101114', 'Makanan & Minuman', 4000, 3500, 3000, 200),
('Biskuit Roma Kelapa Isi 10', 'BRG-005', '8992741101516', 'Makanan & Minuman', 25000, 23000, 21000, 80),
('Mie Sedaap Goreng Isi 40', 'BRG-006', '8995899482018', 'Makanan & Minuman', 165000, 160000, 155000, 60),
('Susu Ultra Milk Cokelat 1L', 'BRG-007', '8992753020112', 'Makanan & Minuman', 18000, 17000, 16000, 90),
('Beras Premium 5kg', 'BRG-008', '8991102001015', 'Makanan & Minuman', 75000, 72000, 70000, 50),
('Gula Pasir Gulaku 1kg', 'BRG-009', '8992753430019', 'Makanan & Minuman', 15000, 14000, 13000, 100),
('Minyak Goreng Bimoli 2L', 'BRG-010', '8992753123010', 'Makanan & Minuman', 35000, 33000, 32000, 70),

-- Elektronik (8 produk)
('Charger Smartphone Type-C', 'ELK-001', '8886467550010', 'Elektronik', 35000, 32000, 28000, 30),
('Kabel Data USB Type-C 1m', 'ELK-002', '8886467550027', 'Elektronik', 15000, 13000, 11000, 50),
('Earphone Bluetooth TWS', 'ELK-003', '6942334300111', 'Elektronik', 150000, 140000, 130000, 40),
('Power Bank 10000mAh', 'ELK-004', '6942334300128', 'Elektronik', 120000, 110000, 100000, 25),
('Lampu LED 9 Watt', 'ELK-005', '8991906252017', 'Elektronik', 25000, 23000, 20000, 60),
('Stop Kontak 3 Lubang', 'ELK-006', '8991906252024', 'Elektronik', 18000, 16000, 14000, 45),
('Baterai AA Alkaline Isi 4', 'ELK-007', '8886467660013', 'Elektronik', 22000, 20000, 18000, 80),
('Speaker Bluetooth Mini', 'ELK-008', '6942334300135', 'Elektronik', 85000, 80000, 75000, 35),

-- Kesehatan & Kecantikan (7 produk)
('Sabun Mandi Lifebuoy 85g', 'KSH-001', '8999999037819', 'Kesehatan & Kecantikan', 4500, 4000, 3500, 150),
('Pasta Gigi Pepsodent 190g', 'KSH-002', '8999999038014', 'Kesehatan & Kecantikan', 12000, 11000, 10000, 100),
('Shampoo Pantene 170ml', 'KSH-003', '8999999501013', 'Kesehatan & Kecantikan', 18000, 17000, 16000, 80),
('Tissue Paseo Isi 250 Lembar', 'KSH-004', '8991102320115', 'Kesehatan & Kecantikan', 8500, 8000, 7500, 120),
('Sabun Cuci Piring Sunlight 800ml', 'KSH-005', '8999999038113', 'Kesehatan & Kecantikan', 15000, 14000, 13000, 90),
('Hand Sanitizer 100ml', 'KSH-006', '8886467770014', 'Kesehatan & Kecantikan', 12000, 11000, 10000, 100),
('Masker Medis Isi 50', 'KSH-007', '8886467770021', 'Kesehatan & Kecantikan', 35000, 33000, 30000, 60),

-- Rumah Tangga (5 produk)
('Sapu Lidi', 'RMH-001', '8991102440116', 'Rumah Tangga', 15000, 13000, 11000, 40),
('Pel Lantai Microfiber', 'RMH-002', '8991102440123', 'Rumah Tangga', 35000, 32000, 29000, 30),
('Ember Plastik 10L', 'RMH-003', '8991102440130', 'Rumah Tangga', 18000, 16000, 14000, 50),
('Gantungan Baju Plastik Isi 10', 'RMH-004', '8991102440147', 'Rumah Tangga', 12000, 11000, 10000, 70),
('Lap Microfiber Isi 3', 'RMH-005', '8991102440154', 'Rumah Tangga', 15000, 14000, 13000, 60),

-- Alat Tulis (5 produk)
('Pulpen Standard AE7 Hitam', 'ATK-001', '8992908120115', 'Alat Tulis & Kantor', 3000, 2500, 2000, 200),
('Buku Tulis Sidu 38 Lembar', 'ATK-002', '8992761210012', 'Alat Tulis & Kantor', 5000, 4500, 4000, 150),
('Pensil 2B Isi 12', 'ATK-003', '8992908120122', 'Alat Tulis & Kantor', 18000, 17000, 16000, 100),
('Penghapus Putih Kecil', 'ATK-004', '8992908120139', 'Alat Tulis & Kantor', 2000, 1800, 1500, 250),
('Penggaris 30cm', 'ATK-005', '8992908120146', 'Alat Tulis & Kantor', 5000, 4500, 4000, 120)
ON CONFLICT (sku) DO NOTHING;

-- ===================================================================
-- STEP 8: CREATE ADMIN USER FUNCTION
-- ===================================================================

-- Note: Jalankan ini SETELAH user pertama signup via aplikasi
-- Atau setup admin user manual via Supabase Dashboard

-- Function untuk promote user jadi admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Insert or update user in users table
  INSERT INTO users (id, email, name, role)
  VALUES (user_uuid, user_email, 'Admin', 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin', name = 'Admin';

  RAISE NOTICE 'User % promoted to admin successfully', user_email;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- STEP 9: SETUP ADMIN USER (MANUAL)
-- ===================================================================

-- INSTRUKSI SETUP ADMIN:
-- 1. Signup via aplikasi dengan email: avrilmart.com@gmail.com
-- 2. Setelah signup berhasil, jalankan query ini:
--    SELECT promote_user_to_admin('avrilmart.com@gmail.com');
-- 3. Logout dan login lagi
-- 4. Role akan berubah menjadi admin

-- Atau jika user sudah ada di auth.users, insert manual:
-- INSERT INTO users (id, email, name, role)
-- SELECT id, email, 'Admin AvrilMart', 'admin'
-- FROM auth.users
-- WHERE email = 'avrilmart.com@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check tables
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'categories', 'products', 'sales', 'sale_items');

-- Check categories
SELECT 'Categories count:' as status, COUNT(*) as count FROM categories;

-- Check products
SELECT 'Products count:' as status, COUNT(*) as count FROM products;

-- Check RLS enabled
SELECT 'RLS Status:' as status, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'categories', 'products', 'sales', 'sale_items');

-- ===================================================================
-- SETUP COMPLETE!
-- ===================================================================

SELECT '
✅ DATABASE SETUP COMPLETE!

Next Steps:
1. Signup via app dengan email: avrilmart.com@gmail.com
2. Run: SELECT promote_user_to_admin(''avrilmart.com@gmail.com'');
3. Logout dan login lagi
4. Ready to use!

Stats:
- Categories: 12
- Products: 35 (with barcodes)
- Tables: 5 (users, categories, products, sales, sale_items)
- RLS: Enabled
- Triggers: Active

Happy selling! 🛒
' as message;
