# 🚀 AvrilMart - Panduan Setup Database

## ⚡ Setup Super Cepat (5 Menit)

---

## **📋 STEP 1: Run SQL Script**

### **1.1 Buka Supabase SQL Editor**
```
1. Login ke: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik: SQL Editor (di sidebar kiri)
4. Klik: New Query
```

### **1.2 Copy & Paste Script**
```
File: /src/sql/SETUP_AVRILMART_COMPLETE.sql

📝 Copy SEMUA isi file
📝 Paste ke SQL Editor
📝 Klik: Run (atau tekan Ctrl+Enter)
📝 Tunggu sampai selesai (~30 detik)
```

### **1.3 Verifikasi Script Berhasil**
```sql
-- Script akan show message:
✅ SETUP COMPLETE!
✅ Tables created: 5
✅ Categories inserted: 12
✅ Products inserted: 35
```

---

## **🔐 STEP 2: Buat Admin User**

### **2.1 Create Auth User**
```
1. Tetap di Supabase Dashboard
2. Klik: Authentication (di sidebar)
3. Klik tab: Users
4. Klik tombol: Add User (hijau, pojok kanan atas)
```

### **2.2 Isi Form:**
```
Email: avrilmart.com@gmail.com
Password: 123AvrilMart456

⚠️ PENTING: 
✅ Check/centang: "Auto Confirm User"
   (Supaya bisa langsung login tanpa konfirmasi email)

Klik: Create User
```

### **2.3 Copy User ID**
```
1. Setelah user dibuat, akan muncul di list
2. Cari user: avrilmart.com@gmail.com
3. Klik user tersebut
4. Copy UUID (ID) - format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### **2.4 Insert ke Users Table**
```
1. Kembali ke: SQL Editor
2. New Query
3. Copy script ini (ganti USER-ID dengan UUID yang tadi di-copy):
```

```sql
INSERT INTO users (id, name, email, role)
VALUES (
  'PASTE-USER-ID-DISINI',
  'Admin AvrilMart',
  'avrilmart.com@gmail.com',
  'admin'
);
```

```
4. Ganti 'PASTE-USER-ID-DISINI' dengan UUID yang sudah di-copy
5. Run
6. Harus sukses tanpa error
```

---

## **✅ STEP 3: Verifikasi Setup**

### **3.1 Check Admin User Exists**
```sql
-- Run query ini:
SELECT * FROM users WHERE role = 'admin';

-- Harus show 1 row:
-- name: Admin AvrilMart
-- email: avrilmart.com@gmail.com
-- role: admin
```

### **3.2 Check Tables Exist**
```sql
-- Run query ini:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Harus show 5 tables:
-- ✅ categories
-- ✅ products
-- ✅ sale_items
-- ✅ sales
-- ✅ users
```

### **3.3 Check Sample Data**
```sql
-- Check categories:
SELECT COUNT(*) as total_categories FROM categories;
-- Result: 12

-- Check products:
SELECT COUNT(*) as total_products FROM products;
-- Result: 35

-- Show sample products:
SELECT name, sku, barcode, category, price_retail, stock 
FROM products 
LIMIT 10;
```

---

## **🎯 STEP 4: Login ke Aplikasi**

### **4.1 Buka App**
```
Open your app URL
```

### **4.2 Login**
```
Email: avrilmart.com@gmail.com
Password: 123AvrilMart456
```

### **4.3 Verify Access**
Anda harus bisa lihat semua menu:
```
✅ Kasir (POS)
✅ Inventori (Product Management)
✅ Kategori (Category Management)
✅ Riwayat Penjualan (Sales History)
✅ Laporan (Reports)
✅ Pengguna (User Management)
```

### **4.4 Test Features**

**Test 1: Lihat Produk**
```
1. Klik menu: Inventori
2. Harus muncul 35 produk
3. Coba search produk
4. Coba sort by category
```

**Test 2: Lihat Kategori**
```
1. Klik menu: Kategori
2. Harus muncul 12 kategori
3. Coba tambah kategori baru
4. Coba edit kategori
```

**Test 3: Process Sale**
```
1. Klik menu: Kasir
2. Search/scan produk (coba barcode: 8992388101015)
3. Tambah ke cart
4. Process payment
5. Print receipt
```

**Test 4: Create User**
```
1. Klik menu: Pengguna
2. Tambah user kasir
3. Logout
4. Login dengan user kasir
5. Verify kasir hanya bisa akses Kasir menu
```

---

## **📊 Data Yang Tersedia**

### **12 Kategori:**
```
1. Makanan & Minuman
2. Elektronik
3. Pakaian & Fashion
4. Peralatan Rumah Tangga
5. Kesehatan & Kecantikan
6. Alat Tulis & Kantor
7. Mainan & Hobi
8. Olahraga & Outdoor
9. Otomotif
10. Buku & Media
11. Perawatan Bayi
12. Pertukangan & Perkakas
```

### **35 Produk Sample:**

**Makanan & Minuman (7 produk):**
```
- Indomie Goreng Isi 40 (8992388101015)
- Aqua Botol 600ml Isi 24 (8991001010211)
- Kopi Kapal Api Special Mix (8992745060154)
- Susu Ultra Milk Full Cream 1L (8992753000123)
- Biskuit Roma Kelapa (8992775001011)
- Teh Sariwangi Isi 25 (8992753000456)
- Minyak Goreng Tropical 2L (8991101010234)
```

**Elektronik (6 produk):**
```
- Charger Type-C Fast Charging
- Kabel Data USB Type-C
- Power Bank 10000mAh
- Earphone Bluetooth TWS
- Speaker Bluetooth Portable
- Mouse Wireless USB
```

**Pakaian & Fashion (4 produk):**
```
- Kaos Katun Polos Dewasa
- Celana Jeans Pria
- Sandal Jepit Dewasa
- Topi Baseball Cap
```

**Peralatan Rumah Tangga (5 produk):**
```
- Sabun Cuci Piring Ekonomis
- Pembersih Lantai Pine
- Tisu Toilet Isi 10 Roll
- Sapu Lidi
- Ember Plastik 15 Liter
```

**Kesehatan & Kecantikan (5 produk):**
```
- Sabun Mandi Lifebuoy
- Shampoo Clear Anti Ketombe
- Pasta Gigi Pepsodent
- Masker Kesehatan 3 Ply
- Hand Sanitizer 100ml
```

**Alat Tulis & Kantor (5 produk):**
```
- Pulpen Standard Hitam Isi 12
- Buku Tulis 58 Lembar
- Pensil 2B Isi 12
- Penghapus Putih
- Kertas HVS A4 Isi 500 Lembar
```

**Dan produk lainnya...**

---

## **🔧 Features Yang Sudah Aktif**

### **✅ Auto Features:**
```
✅ Auto-decrease stock saat penjualan
✅ Auto-update timestamps
✅ Auto-generate UUIDs
✅ Auto-index untuk fast search
```

### **✅ Security:**
```
✅ Row Level Security (RLS) enabled
✅ Admin-only write access
✅ Role-based access control
✅ Cascade delete handling
```

### **✅ Performance:**
```
✅ Indexed: email, SKU, barcode, category
✅ Fast product search
✅ Fast barcode lookup
✅ Optimized queries
```

---

## **🎯 Next Steps Setelah Setup**

### **1. Customize Products**
```
- Edit harga sesuai kebutuhan
- Update stock sesuai inventory
- Tambah/hapus produk
- Upload gambar produk
```

### **2. Create Staff Users**
```
- Buat user kasir di menu Pengguna
- Kasir hanya bisa akses menu Kasir
- Admin bisa akses semua menu
```

### **3. Configure Settings**
```
- Set pajak default (jika perlu)
- Set format receipt
- Configure printer
```

### **4. Start Selling!**
```
- Process transaksi di menu Kasir
- Scan barcode atau search manual
- Print thermal receipt
- Track penjualan di Riwayat
```

---

## **🐛 Troubleshooting**

### **Error: User already exists**
```
Solusi:
- User sudah pernah dibuat
- Check di Authentication > Users
- Gunakan user yang sudah ada
- Atau delete & create ulang
```

### **Error: Cannot login**
```
Solusi:
- Pastikan "Auto Confirm User" di-check
- Atau: Dashboard > Authentication > Email Auth
- Disable "Confirm email" untuk testing
```

### **Error: Permission denied**
```
Solusi:
- Pastikan user sudah di-insert ke users table
- Pastikan role = 'admin'
- Run: SELECT * FROM users WHERE id = auth.uid();
```

### **Error: Products tidak muncul**
```
Solusi:
- Check: SELECT COUNT(*) FROM products;
- Kalau 0, run insert products lagi
- Refresh browser
```

### **Barcode tidak bisa discan**
```
Solusi:
- Pastikan barcode scanner configured
- Test manual: ketik barcode di search box
- Example barcode: 8992388101015
```

---

## **📞 Quick Commands**

### **Reset Admin Password:**
```
Dashboard > Authentication > Users
Cari: avrilmart.com@gmail.com
Click: Reset Password
```

### **Add More Products:**
```sql
INSERT INTO products (name, sku, barcode, category, price_retail, price_wholesale, price_modal, stock)
VALUES (
  'Nama Produk',
  'SKU-UNIQUE',
  'BARCODE-12345',
  'Makanan & Minuman',
  15000,
  14000,
  13000,
  100
);
```

### **Update Stock:**
```sql
UPDATE products 
SET stock = 200 
WHERE sku = 'FD-001';
```

### **View Today's Sales:**
```sql
SELECT * FROM sales 
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## **✅ Setup Checklist**

```bash
☐ Run SETUP_AVRILMART_COMPLETE.sql
☐ Verify tables created (5 tables)
☐ Verify categories created (12 items)
☐ Verify products created (35 items)
☐ Create auth user in dashboard
☐ Copy user ID
☐ Insert user to users table
☐ Verify admin user exists
☐ Login to app
☐ Test all menus accessible
☐ Test create product
☐ Test process sale
☐ Test barcode scan
☐ Done! ✅
```

---

## **🎉 Selamat!**

Database AvrilMart sudah siap digunakan!

**Admin Login:**
```
Email: avrilmart.com@gmail.com
Password: 123AvrilMart456
```

**Database includes:**
```
✅ 5 tables dengan security
✅ 12 categories siap pakai
✅ 35 sample products dengan barcode
✅ All features enabled
✅ Ready for production
```

**Mulai berjualan sekarang!** 🛒💰✨

---

**Support:** Lihat `/src/sql/TROUBLESHOOTING.md` untuk bantuan lebih lanjut.
