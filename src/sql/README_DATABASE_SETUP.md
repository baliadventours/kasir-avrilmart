# 🗄️ Database Setup Guide - Complete

## ⚠️ PENTING: Urutan Setup

Jalankan SQL scripts dalam urutan ini:

```
1. 01_create_users_table.sql       (PERTAMA)
2. 02_create_products_table.sql    (KEDUA)
3. 03_create_sales_tables.sql      (KETIGA)
4. 04_create_categories_table.sql  (KEEMPAT)
```

**ATAU gunakan script all-in-one:** `00_setup_all_tables.sql`

---

## 📋 Step-by-Step Setup

### **1. Login ke Supabase Dashboard**
1. Buka https://supabase.com/dashboard
2. Pilih project Anda

### **2. Buka SQL Editor**
1. Di sidebar kiri, klik **SQL Editor**
2. Klik **New Query**

### **3. Jalankan Setup Script**

#### **Option A: All-in-One (RECOMMENDED)** ✅

```sql
-- Copy & paste semua isi dari:
/src/sql/00_setup_all_tables.sql

-- Lalu klik Run
```

#### **Option B: Manual (Step by Step)**

Jalankan satu per satu dalam urutan:

```bash
# Step 1: Users table
Copy isi 01_create_users_table.sql → Run

# Step 2: Products table  
Copy isi 02_create_products_table.sql → Run

# Step 3: Sales tables
Copy isi 03_create_sales_tables.sql → Run

# Step 4: Categories table
Copy isi 04_create_categories_table.sql → Run
```

---

## 🔐 Create First Admin User

### **Method 1: Through Signup**

1. **Signup di aplikasi:**
   ```
   Email: admin@example.com
   Password: your-secure-password
   Name: Admin
   Role: cashier (akan diubah manual)
   ```

2. **Update role di Supabase:**
   ```sql
   -- Buka SQL Editor
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'admin@example.com';
   ```

### **Method 2: Direct SQL Insert**

```sql
-- 1. Create auth user first (di Authentication > Add User)
-- Email: admin@example.com
-- Password: (set password)

-- 2. Insert ke users table
INSERT INTO users (id, name, email, role)
VALUES (
  'PASTE-USER-ID-FROM-AUTH-USERS',
  'Admin',
  'admin@example.com',
  'admin'
);
```

---

## ✅ Verify Setup

### **1. Check Tables Created**
Di **Table Editor**, pastikan ada:
- ✅ `users`
- ✅ `products`
- ✅ `sales`
- ✅ `sale_items`
- ✅ `categories`

### **2. Check RLS Enabled**
Semua table harus punya **RLS enabled** ✅

### **3. Check Policies**
Setiap table harus punya policies untuk:
- SELECT (authenticated)
- INSERT (admin atau user sendiri)
- UPDATE (admin atau user sendiri)
- DELETE (admin atau user sendiri)

### **4. Test in App**
1. Login dengan admin user
2. Test setiap menu:
   - ✅ Kasir (POS)
   - ✅ Inventori (CRUD Products)
   - ✅ Kategori (CRUD Categories)
   - ✅ Riwayat Penjualan
   - ✅ Laporan
   - ✅ Pengguna (CRUD Users)

---

## 📊 Database Schema

### **Users Table**
```sql
id          UUID (PK)
name        TEXT
email       TEXT (UNIQUE)
role        TEXT (admin/cashier)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### **Products Table**
```sql
id              UUID (PK)
name            TEXT
sku             TEXT (UNIQUE)
barcode         TEXT
category        TEXT
price_retail    DECIMAL
price_wholesale DECIMAL
price_modal     DECIMAL
stock           INTEGER
image           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### **Sales Table**
```sql
id             UUID (PK)
user_id        UUID (FK → users)
total          DECIMAL
subtotal       DECIMAL
tax            DECIMAL
discount       DECIMAL
price_type     TEXT (retail/wholesale)
payment_amount DECIMAL
change_amount  DECIMAL
created_at     TIMESTAMP
```

### **Sale Items Table**
```sql
id           UUID (PK)
sale_id      UUID (FK → sales)
product_id   UUID (FK → products)
product_name TEXT
product_sku  TEXT
quantity     INTEGER
price        DECIMAL
subtotal     DECIMAL
created_at   TIMESTAMP
```

### **Categories Table**
```sql
id          UUID (PK)
name        TEXT (UNIQUE)
description TEXT
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

---

## 🔒 Security (RLS Policies)

### **Users:**
- ✅ All authenticated can SELECT
- ✅ Admin can INSERT/UPDATE/DELETE

### **Products:**
- ✅ All authenticated can SELECT
- ✅ Admin can INSERT/UPDATE/DELETE

### **Sales & Sale Items:**
- ✅ All authenticated can SELECT
- ✅ Users can INSERT their own sales
- ✅ Auto-decrease stock on sale

### **Categories:**
- ✅ All authenticated can SELECT
- ✅ Admin can INSERT/UPDATE/DELETE

---

## ⚡ Auto Features

### **1. Auto Timestamps**
Semua table punya trigger untuk auto-update `updated_at`

### **2. Auto Stock Update**
Ketika sale dibuat, stock produk otomatis berkurang

### **3. Default Categories**
Script akan create 4 kategori default:
- Elektronik
- Makanan
- Pakaian
- Peralatan

---

## 🐛 Troubleshooting

### **Error: relation "users" does not exist**
❌ **Problem:** Jalankan categories table sebelum users table
✅ **Solution:** Jalankan `01_create_users_table.sql` dulu

### **Error: permission denied**
❌ **Problem:** RLS policy tidak allow operation
✅ **Solution:** Check role user (harus admin untuk write operations)

### **Error: duplicate key value violates unique constraint**
❌ **Problem:** Insert duplicate email/sku/name
✅ **Solution:** Gunakan unique value

### **Cannot create user in app**
❌ **Problem:** No admin user exists
✅ **Solution:** Create first admin manually (see above)

---

## 📞 Support

Jika ada error atau pertanyaan:
1. Check error message di browser console
2. Check Supabase logs (Logs > API Logs)
3. Verify RLS policies enabled
4. Verify user role = 'admin'

---

## 🎯 Quick Start Commands

### **Complete Setup (Copy-Paste):**

```sql
-- 1. Run this in SQL Editor:
\i /src/sql/00_setup_all_tables.sql

-- 2. Create first admin:
-- (After signup in app)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- 3. Done! Login and test.
```

---

## ✅ Checklist

Sebelum mulai menggunakan aplikasi:

- [ ] ✅ Semua tables created
- [ ] ✅ RLS enabled untuk semua tables
- [ ] ✅ Policies created untuk semua tables
- [ ] ✅ First admin user created
- [ ] ✅ Admin role assigned
- [ ] ✅ Can login to app
- [ ] ✅ Can access admin menus
- [ ] ✅ Can create products
- [ ] ✅ Can create categories
- [ ] ✅ Can create users
- [ ] ✅ Can process sales

---

**Database setup sekarang lengkap dan siap digunakan!** 🎉✨
