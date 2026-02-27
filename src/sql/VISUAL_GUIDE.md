# 🎯 AvrilMart - Quick Start (Visual Guide)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🚀 AVRILMART POS SETUP - 3 STEPS                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║  STEP 1: RUN SQL SCRIPT                                        ║
║  ⏱️  Time: 30 seconds                                           ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝

    1. Open: https://supabase.com/dashboard
       └─> Your Project
           └─> SQL Editor
               └─> New Query

    2. Copy file: SETUP_AVRILMART_COMPLETE.sql
       └─> Paste ke SQL Editor
           └─> Click RUN

    3. Wait for success message:
       ✅ SETUP COMPLETE!
       ✅ Tables: 5
       ✅ Categories: 12
       ✅ Products: 35


╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║  STEP 2: CREATE ADMIN USER                                     ║
║  ⏱️  Time: 2 minutes                                            ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝

    Part A: Create Auth User
    ────────────────────────────────────────────────────
    
    1. Dashboard > Authentication > Users
    2. Click: "Add User"
    
    3. Fill form:
       ┌─────────────────────────────────────────────┐
       │ Email:    avrilmart.com@gmail.com          │
       │ Password: 123AvrilMart456                  │
       │                                            │
       │ ☑️  Auto Confirm User  ← IMPORTANT!       │
       └─────────────────────────────────────────────┘
    
    4. Click: "Create User"
    5. Copy User ID (UUID)


    Part B: Add to Users Table
    ────────────────────────────────────────────────────
    
    1. SQL Editor > New Query
    
    2. Run this (replace USER-ID):
       ┌─────────────────────────────────────────────┐
       │ INSERT INTO users (id, name, email, role)  │
       │ VALUES (                                   │
       │   'YOUR-USER-ID-HERE',                     │
       │   'Admin AvrilMart',                       │
       │   'avrilmart.com@gmail.com',               │
       │   'admin'                                  │
       │ );                                         │
       └─────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║  STEP 3: LOGIN & TEST                                          ║
║  ⏱️  Time: 2 minutes                                            ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝

    1. Open your app
    
    2. Login:
       ┌─────────────────────────────────────────────┐
       │ 📧 Email:    avrilmart.com@gmail.com       │
       │ 🔐 Password: 123AvrilMart456               │
       └─────────────────────────────────────────────┘
    
    3. Verify menus (6 menu items):
       ✅ Kasir
       ✅ Inventori
       ✅ Kategori
       ✅ Riwayat Penjualan
       ✅ Laporan
       ✅ Pengguna


┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   🎉 SETUP COMPLETE!                           │
│                                                                 │
│  Your database now has:                                        │
│  ✅ 5 tables (users, products, sales, categories, etc)        │
│  ✅ 12 categories                                              │
│  ✅ 35 sample products with barcodes                           │
│  ✅ 1 admin user                                               │
│  ✅ Full security (RLS enabled)                                │
│  ✅ Auto features (stock update, timestamps)                   │
│                                                                 │
│  Ready to sell! 🛒💰✨                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════╗
║  📊 SAMPLE DATA INCLUDED                                       ║
╚═════════════════════════════════════════════════════════════════╝

┌──────────────────────────┬────────────────────────────────────┐
│  12 CATEGORIES           │  35 PRODUCTS                       │
├──────────────────────────┼────────────────────────────────────┤
│  • Makanan & Minuman     │  • Indomie Goreng (8992388101015) │
│  • Elektronik            │  • Aqua Botol 600ml               │
│  • Pakaian & Fashion     │  • Charger Type-C                 │
│  • Peralatan RT          │  • Power Bank 10000mAh            │
│  • Kesehatan & Kecantikan│  • Kaos Katun Polos               │
│  • Alat Tulis & Kantor   │  • Sabun Cuci Piring              │
│  • Mainan & Hobi         │  • Sabun Mandi Lifebuoy           │
│  • Olahraga & Outdoor    │  • Pulpen Standard Hitam          │
│  • Otomotif              │  • Dan 28 produk lainnya...       │
│  • Buku & Media          │                                    │
│  • Perawatan Bayi        │  All with:                         │
│  • Pertukangan           │  ✅ Barcodes                       │
│                          │  ✅ SKU                            │
│                          │  ✅ Prices (retail/wholesale)      │
│                          │  ✅ Stock levels                   │
└──────────────────────────┴────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════╗
║  🎯 QUICK ACTIONS AFTER SETUP                                  ║
╚═════════════════════════════════════════════════════════════════╝

  1️⃣  CUSTOMIZE PRODUCTS
      • Edit prices
      • Update stock
      • Add/remove products
      • Upload images

  2️⃣  CREATE STAFF
      • Add kasir users
      • Assign roles
      • Manage permissions

  3️⃣  START SELLING
      • Process transactions
      • Scan barcodes
      • Print receipts
      • Track sales


╔═════════════════════════════════════════════════════════════════╗
║  🔧 TROUBLESHOOTING                                            ║
╚═════════════════════════════════════════════════════════════════╝

  ❌ Cannot login
     └─> Enable "Auto Confirm User" when creating
     └─> Or disable email confirmation in settings

  ❌ Permission denied
     └─> Check: SELECT * FROM users WHERE id = auth.uid();
     └─> Verify role = 'admin'

  ❌ Products not showing
     └─> Check: SELECT COUNT(*) FROM products;
     └─> Should return: 35
     └─> Refresh browser

  ❌ Barcode not working
     └─> Test manually: search "8992388101015"
     └─> Configure barcode scanner


╔═════════════════════════════════════════════════════════════════╗
║  📖 DOCUMENTATION                                              ║
╚═════════════════════════════════════════════════════════════════╝

  📄 SETUP_AVRILMART_GUIDE.md
     └─> Complete step-by-step guide

  📄 TROUBLESHOOTING.md
     └─> Common issues & solutions

  📄 DATABASE_SCHEMA.md
     └─> Database structure & diagrams

  📄 INDEX.md
     └─> Documentation index


╔═════════════════════════════════════════════════════════════════╗
║  ⚡ TIME BREAKDOWN                                             ║
╚═════════════════════════════════════════════════════════════════╝

  ⏱️  Run SQL script:        30 seconds
  ⏱️  Create auth user:      1 minute
  ⏱️  Insert users table:    30 seconds
  ⏱️  Login & verify:        1 minute
  ─────────────────────────────────────────
  ⏱️  TOTAL:                3-5 minutes


╔═════════════════════════════════════════════════════════════════╗
║  📞 CREDENTIALS REMINDER                                       ║
╚═════════════════════════════════════════════════════════════════╝

  🔐 ADMIN LOGIN:
  ┌──────────────────────────────────────────┐
  │  Email:    avrilmart.com@gmail.com      │
  │  Password: 123AvrilMart456              │
  │  Role:     admin                        │
  └──────────────────────────────────────────┘

  ⚠️  Keep credentials secure!
  ⚠️  Change password after first login!


╔═════════════════════════════════════════════════════════════════╗
║  ✅ CHECKLIST                                                  ║
╚═════════════════════════════════════════════════════════════════╝

  Database Setup:
  ☐ Run SETUP_AVRILMART_COMPLETE.sql
  ☐ Verify 5 tables created
  ☐ Verify 12 categories inserted
  ☐ Verify 35 products inserted

  Admin User:
  ☐ Create auth user in dashboard
  ☐ Enable "Auto Confirm User"
  ☐ Copy user ID
  ☐ Insert to users table
  ☐ Verify admin role

  Application:
  ☐ Login successful
  ☐ All 6 menus visible
  ☐ Products show in Inventori
  ☐ Categories show in Kategori
  ☐ Can process test sale
  ☐ Barcode scan working

  Done! ✅


╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║              🎉 AVRILMART POS - READY TO USE!                  ║
║                                                                 ║
║            Selamat berjualan! 🛒💰✨                           ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝
```

---

## Quick Links

- **Setup Script:** `/src/sql/SETUP_AVRILMART_COMPLETE.sql`
- **Detailed Guide:** `/src/sql/SETUP_AVRILMART_GUIDE.md`
- **Troubleshooting:** `/src/sql/TROUBLESHOOTING.md`
- **All Docs:** `/src/sql/INDEX.md`

---

**Start with:** SETUP_AVRILMART_COMPLETE.sql
**Time needed:** 3-5 minutes
**Difficulty:** Easy ⭐

**Let's go!** 🚀
