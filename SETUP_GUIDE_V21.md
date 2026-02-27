# 🚀 PANDUAN SETUP AVRILMART POS - VERSION 21

## ✅ Update Berhasil Diterapkan!

Aplikasi Version 21 telah di-update dengan:
- ✅ Complete database setup script
- ✅ Fix role fetching dari users table
- ✅ Layout improvements
- ✅ Sample data (12 categories, 35 products dengan barcode)

---

## 📋 STEP-BY-STEP SETUP DATABASE

### **STEP 1: Setup Database di Supabase**

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com
   - Pilih project AvrilMart

2. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar kiri
   - Klik "New query"

3. **Copy & Run Setup Script**
   - Buka file: `/src/sql/SETUP_COMPLETE.sql`
   - Copy SEMUA isi file
   - Paste ke SQL Editor
   - Klik "Run" atau tekan Ctrl+Enter

4. **Tunggu hingga selesai**
   - Proses akan membuat:
     - 5 tables (users, categories, products, sales, sale_items)
     - RLS policies untuk security
     - Triggers untuk auto-decrease stock
     - 12 sample categories
     - 35 sample products dengan barcode
   - Success message akan muncul di akhir

---

### **STEP 2: Setup Admin User**

Ada 2 cara untuk setup admin user:

#### **Cara 1: Via Aplikasi (RECOMMENDED)**

1. **Logout dari aplikasi** (jika sedang login)

2. **Signup dengan email baru:**
   ```
   Email: avrilmart.com@gmail.com
   Password: [password pilihan Anda]
   Name: Admin AvrilMart
   ```

3. **Setelah signup berhasil, buka Supabase SQL Editor lagi**

4. **Run query promote user:**
   ```sql
   SELECT promote_user_to_admin('avrilmart.com@gmail.com');
   ```

5. **Logout dan login lagi**
   - Role akan berubah menjadi admin
   - Semua menu admin akan muncul

#### **Cara 2: Manual Insert (Jika user sudah ada)**

Jika user sudah ada di auth.users, jalankan query ini:

```sql
INSERT INTO users (id, email, name, role)
SELECT id, email, 'Admin AvrilMart', 'admin'
FROM auth.users
WHERE email = 'avrilmart.com@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Admin AvrilMart';
```

---

### **STEP 3: Verify Setup**

1. **Cek Tables:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'categories', 'products', 'sales', 'sale_items');
   ```
   Harus muncul 5 tables.

2. **Cek Categories:**
   ```sql
   SELECT COUNT(*) as total, 
          string_agg(name, ', ') as categories 
   FROM categories;
   ```
   Harus ada 12 categories.

3. **Cek Products:**
   ```sql
   SELECT COUNT(*) as total_products,
          COUNT(barcode) as products_with_barcode,
          SUM(stock) as total_stock
   FROM products;
   ```
   Harus ada 35 products dengan barcode.

4. **Cek Admin User:**
   ```sql
   SELECT email, name, role FROM users 
   WHERE email = 'avrilmart.com@gmail.com';
   ```
   Role harus 'admin'.

---

## 🎯 TESTING APLIKASI

### **1. Login Test**

```
✅ Login dengan admin credentials
✅ Cek sidebar muncul 6 menu:
   - Kasir
   - Inventori
   - Kategori
   - Riwayat Penjualan
   - Laporan
   - Pengguna
```

### **2. Products Test**

```
✅ Klik menu "Inventori"
✅ Products harus muncul (35 items)
✅ Bisa search, filter by category
✅ Bisa edit, delete products
✅ Bisa add new product
```

### **3. POS Test**

```
✅ Klik menu "Kasir"
✅ Products list muncul
✅ Search by name/SKU/barcode works
✅ Filter by category works
✅ Add to cart works
✅ Adjust quantity works
✅ Process sale works
✅ Stock auto-decrease setelah sale
```

### **4. Barcode Test**

Test dengan barcode ini:
```
8991001010211 → Aqua Botol 600ml
8992388101015 → Indomie Goreng
8992745060154 → Kopi Kapal Api
8886008101114 → Teh Pucuk Harum
8992741101516 → Biskuit Roma Kelapa
```

### **5. Category Test**

```
✅ Klik menu "Kategori"
✅ 12 categories muncul
✅ Bisa add new category
✅ Bisa edit category
✅ Bisa delete category
✅ Confirm delete bekerja
```

### **6. User Management Test**

```
✅ Klik menu "Pengguna"
✅ Bisa add new user (cashier/admin)
✅ Bisa update user
✅ Bisa delete user
✅ Role filter works
```

---

## 🔧 CODE CHANGES SUMMARY

### **Files Created:**
```
✅ /src/sql/SETUP_COMPLETE.sql
   - Complete all-in-one database setup
   - Includes tables, RLS, triggers, sample data
```

### **Files Modified:**

1. **`/src/services/supabase.ts`**
   ```typescript
   ✅ Added getUserProfile() function
   ✅ Fetches user data from users table
   ✅ Returns role, name, email
   ```

2. **`/src/app/App.tsx`**
   ```typescript
   ✅ Updated checkSession() - fetch role from database
   ✅ Updated handleLogin() - fetch role from database
   ✅ Fallback to user_metadata if database fetch fails
   ✅ Better error handling
   ```

---

## 🎨 FEATURES YANG SUDAH AKTIF

### **Auto Features:**
```
✅ Auto-decrease stock saat penjualan
✅ Auto-calculate total & change
✅ Auto-format Rupiah (Rp)
✅ Auto-update timestamp
✅ Auto-generate receipt ID
✅ Auto-sync role from database
```

### **Security Features:**
```
✅ Row Level Security (RLS) enabled
✅ Role-based access control
✅ Admin: Full access semua fitur
✅ Cashier: Hanya POS & Sales History
✅ Secure password hashing
✅ JWT authentication
```

### **Search Features:**
```
✅ Search by product name
✅ Search by SKU
✅ Search by barcode
✅ Filter by category
✅ Real-time search
✅ Case-insensitive search
```

### **POS Features:**
```
✅ Add to cart
✅ Remove from cart
✅ Quantity adjustment
✅ Price type switch (retail/wholesale)
✅ Apply discount (% atau Rp)
✅ Calculate tax (10%)
✅ Payment calculator
✅ Change calculator
✅ Print thermal receipt (80mm)
✅ Clear cart
```

### **Inventory Features:**
```
✅ Add product
✅ Edit product
✅ Delete product
✅ Update stock
✅ Upload image
✅ CSV bulk import
✅ Low stock warning
✅ Barcode support
```

### **Category Features:**
```
✅ CRUD operations (Create, Read, Update, Delete)
✅ Category filter for products
✅ Delete confirmation
✅ Duplicate name prevention
```

### **User Management Features:**
```
✅ Create user (Admin/Cashier)
✅ Update user
✅ Delete user
✅ Role management
✅ Password management
✅ Email validation
```

---

## 📊 DATABASE SCHEMA

```
users
├── id (UUID, PK, FK to auth.users)
├── email (TEXT, UNIQUE)
├── name (TEXT)
├── role (TEXT: admin/cashier)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

categories
├── id (UUID, PK)
├── name (TEXT, UNIQUE)
├── description (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

products
├── id (UUID, PK)
├── name (TEXT)
├── sku (TEXT, UNIQUE)
├── barcode (TEXT, UNIQUE)
├── category (TEXT)
├── price_retail (DECIMAL)
├── price_wholesale (DECIMAL)
├── price_modal (DECIMAL)
├── stock (INTEGER)
├── image (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

sales
├── id (UUID, PK)
├── user_id (UUID, FK)
├── total (DECIMAL)
├── subtotal (DECIMAL)
├── tax (DECIMAL)
├── discount (DECIMAL)
├── price_type (TEXT: retail/wholesale)
├── payment_amount (DECIMAL)
├── change_amount (DECIMAL)
└── created_at (TIMESTAMPTZ)

sale_items
├── id (UUID, PK)
├── sale_id (UUID, FK)
├── product_id (UUID, FK)
├── product_name (TEXT)
├── product_sku (TEXT)
├── quantity (INTEGER)
├── price (DECIMAL)
├── subtotal (DECIMAL)
└── created_at (TIMESTAMPTZ)
```

---

## 🐛 TROUBLESHOOTING

### **Problem: Menu admin tidak muncul**

**Solution:**
```sql
-- Cek role user di database:
SELECT email, role FROM users WHERE email = 'avrilmart.com@gmail.com';

-- Jika role bukan 'admin', update:
UPDATE users SET role = 'admin' WHERE email = 'avrilmart.com@gmail.com';

-- Logout dan login lagi
```

### **Problem: Products tidak muncul**

**Solution:**
```
1. Cek browser console (F12) untuk error
2. Verify database setup sudah complete:
   SELECT COUNT(*) FROM products;
3. Cek RLS policies:
   SELECT * FROM products LIMIT 1;
4. Clear cache dan refresh (Ctrl+F5)
```

### **Problem: Role tidak update setelah login**

**Solution:**
```
1. Clear browser cache completely
2. Clear Supabase storage:
   - Open DevTools (F12)
   - Application → Local Storage → Clear All
3. Logout dan login lagi
4. Check if getUserProfile() is called in App.tsx
```

### **Problem: Barcode tidak berfungsi**

**Solution:**
```
1. Test manual dengan ketik barcode di search box
2. Cek barcode exists di database:
   SELECT name, barcode FROM products WHERE barcode = '8991001010211';
3. Scanner harus mode "Enter" setelah scan
4. Test scanner di Notepad dulu
```

---

## 📝 NEXT STEPS

### **Before Production:**

```
☐ Replace sample products dengan produk real
☐ Update harga sesuai market
☐ Update stock sesuai inventory fisik
☐ Upload foto produk (optional)
☐ Customize categories sesuai kebutuhan
☐ Setup barcode scanner hardware
☐ Test thermal printer (80mm)
☐ Create kasir users
☐ Train staff penggunaan POS
☐ Backup database
☐ Setup auto-backup schedule
```

### **Recommended Enhancements:**

```
☐ Setup restock notification
☐ Setup daily sales report email
☐ Add product expiry date tracking
☐ Add supplier management
☐ Add purchase order system
☐ Add profit margin calculator
☐ Add customer management (optional)
☐ Add loyalty points (optional)
```

---

## 🎉 SETUP COMPLETE!

Aplikasi AvrilMart POS Version 21 sekarang:

```
✅ Database lengkap & terstruktur
✅ Sample data ready (12 categories, 35 products)
✅ Security enabled (RLS policies)
✅ Auto features working
✅ Role-based access working
✅ Barcode support ready
✅ UI/UX clean & modern
✅ Ready untuk production use
```

---

## 📞 SUPPORT

Jika ada pertanyaan atau masalah:

1. **Check this guide first** untuk troubleshooting
2. **Check browser console** (F12) untuk error messages
3. **Check Supabase logs** di Dashboard → Logs
4. **Verify database setup** dengan verification queries di atas

---

**Happy Selling! 🛒💰✨**

Last Updated: February 27, 2026 | Version 21 Updated
