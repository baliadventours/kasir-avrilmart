# 📚 SQL Documentation Index

## 🚀 Quick Navigation

---

## **Start Here** ⭐

### **[SETUP_AVRILMART_GUIDE.md](SETUP_AVRILMART_GUIDE.md)** 🎯 NEW!
- ✅ Complete AvrilMart setup with sample data
- ✅ 12 categories + 35 products included
- ✅ Step-by-step with admin user creation
- ✅ Visual guide with screenshots
- ✅ 5-minute setup time

### **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** 🎨 NEW!
- ✅ Visual flowchart setup guide
- ✅ ASCII diagrams & boxes
- ✅ Quick reference cards
- ✅ At-a-glance instructions

### **[README.md](README.md)**
- ✅ 5-minute quick setup guide
- ✅ Most common issues
- ✅ First steps for new setup

---

## **Setup Scripts** 📝

### **1. [SETUP_AVRILMART_COMPLETE.sql](SETUP_AVRILMART_COMPLETE.sql)** 🎯 BEST!
```
✅ Complete AvrilMart setup with sample data
✅ Creates all 5 tables
✅ Inserts 12 categories
✅ Inserts 35 products with barcodes
✅ Full security (RLS)
✅ All triggers & indexes
✅ Ready for production in 5 minutes
```

### **2. [00_setup_all_tables.sql](00_setup_all_tables.sql)** ⚡ RECOMMENDED
```
✅ All-in-one setup script
✅ Creates all 5 tables
✅ Sets up security (RLS)
✅ Creates triggers & indexes
✅ Inserts default data
✅ Ready to use in 2 minutes
```

### **3. [01_create_users_table.sql](01_create_users_table.sql)**
```
✅ Creates users table
✅ Links to auth.users
✅ Role-based access (admin/cashier)
✅ RLS policies
```

### **4. [02_create_products_table.sql](02_create_products_table.sql)**
```
✅ Creates products table
✅ SKU, barcode, pricing, stock
✅ RLS policies
✅ Indexes for performance
```

### **5. [03_create_sales_tables.sql](03_create_sales_tables.sql)**
```
✅ Creates sales & sale_items tables
✅ Foreign keys
✅ Auto-decrease stock trigger
✅ RLS policies
```

### **6. [04_create_categories_table.sql](04_create_categories_table.sql)**
```
✅ Creates categories table
✅ Master data for products
✅ RLS policies
✅ Default categories
```

---

## **Maintenance Scripts** 🔧

### **[05_add_missing_columns.sql](05_add_missing_columns.sql)**
```
✅ Adds missing columns to existing tables
✅ Specifically: barcode, price_modal
✅ Keeps all existing data
✅ Safe to run multiple times
```

### **[99_reset_database.sql](99_reset_database.sql)** ⚠️ DANGER
```
⚠️  Drops all tables
⚠️  Deletes all data
⚠️  Use for fresh start only
⚠️  Backup first!
```

---

## **Documentation** 📖

### **[README_DATABASE_SETUP.md](README_DATABASE_SETUP.md)**
```
✅ Complete setup guide
✅ Detailed instructions
✅ Table schemas explained
✅ Security policies explained
✅ Create admin user guide
✅ Verification checklist
```

### **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)**
```
✅ Visual database diagram
✅ Table relationships
✅ ER diagram
✅ Security policies matrix
✅ Data flow diagram
✅ Indexes & constraints
✅ Common queries examples
```

### **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** 🔍
```
✅ 10+ common errors & fixes
✅ Step-by-step solutions
✅ Diagnostic queries
✅ Health check queries
✅ Quick fixes checklist
```

### **[FIX_BARCODE_ERROR.md](FIX_BARCODE_ERROR.md)**
```
✅ Specific fix for "barcode does not exist"
✅ Two solution options
✅ Migration details
✅ Before/after comparison
```

---

## **By Problem** 🎯

### **"I want to set up a new database"**
→ Use: [00_setup_all_tables.sql](00_setup_all_tables.sql)
→ Guide: [README.md](README.md)

### **"Column barcode does not exist"**
→ Use: [05_add_missing_columns.sql](05_add_missing_columns.sql)
→ Guide: [FIX_BARCODE_ERROR.md](FIX_BARCODE_ERROR.md)

### **"Relation users does not exist"**
→ Use: [00_setup_all_tables.sql](00_setup_all_tables.sql)
→ Guide: [README.md](README.md) (Step 2)

### **"Permission denied for table"**
→ Guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (Error #3)

### **"Cannot login / Invalid credentials"**
→ Guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (Error #4)

### **"User role stuck at cashier"**
→ Guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (Error #5)

### **"Stock not decreasing after sale"**
→ Guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (Error #6)

### **"I want to start over"**
→ Use: [99_reset_database.sql](99_reset_database.sql) ⚠️
→ Then: [00_setup_all_tables.sql](00_setup_all_tables.sql)

### **"I need to understand the database structure"**
→ Read: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

### **"Something's broken, help!"**
→ Read: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## **By Role** 👥

### **First Time Setup (New User)**
1. Read: [README.md](README.md)
2. Run: [00_setup_all_tables.sql](00_setup_all_tables.sql)
3. Create admin user (see README)
4. Done! ✅

### **Database Administrator**
1. Study: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
2. Bookmark: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Keep: [05_add_missing_columns.sql](05_add_missing_columns.sql) (for migrations)

### **Developer**
1. Review: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) (especially ER diagram)
2. Reference: [00_setup_all_tables.sql](00_setup_all_tables.sql) (for schema)
3. Debug with: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### **Support/Troubleshooting**
1. Start: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Common fixes: [FIX_BARCODE_ERROR.md](FIX_BARCODE_ERROR.md)
3. Last resort: [99_reset_database.sql](99_reset_database.sql)

---

## **File Size Reference** 📏

```
00_setup_all_tables.sql       ≈ 15 KB  ⚡ Main setup
01_create_users_table.sql     ≈ 3 KB   Individual: Users
02_create_products_table.sql  ≈ 3 KB   Individual: Products
03_create_sales_tables.sql    ≈ 4 KB   Individual: Sales
04_create_categories_table.sql≈ 3 KB   Individual: Categories
05_add_missing_columns.sql    ≈ 2 KB   🔧 Migration
99_reset_database.sql         ≈ 2 KB   ⚠️  Reset

README.md                     ≈ 5 KB   📖 Quick start
README_DATABASE_SETUP.md      ≈ 12 KB  📖 Complete guide
DATABASE_SCHEMA.md            ≈ 10 KB  📖 Schema docs
TROUBLESHOOTING.md            ≈ 15 KB  📖 Problem solving
FIX_BARCODE_ERROR.md          ≈ 7 KB   📖 Specific fix
INDEX.md (this file)          ≈ 6 KB   📖 Navigation
```

---

## **Execution Order** 🔢

If running individual scripts (not all-in-one):

```
1. 01_create_users_table.sql       (First - no dependencies)
2. 02_create_products_table.sql    (Depends on: users)
3. 03_create_sales_tables.sql      (Depends on: users, products)
4. 04_create_categories_table.sql  (Depends on: users)
5. Create admin user                (Manual step)
6. 05_add_missing_columns.sql      (Only if needed for migration)
```

**OR just run:** `00_setup_all_tables.sql` (does all at once) ✅

---

## **Time Estimates** ⏱️

```
Setup new database:           2 minutes  (00_setup_all_tables.sql)
Create admin user:            2 minutes  (Manual SQL)
Add missing columns:          30 seconds (05_add_missing_columns.sql)
Reset database:               1 minute   (99_reset_database.sql)
Read quick guide:             3 minutes  (README.md)
Read full documentation:      15 minutes (All docs)
Troubleshoot common error:    5 minutes  (TROUBLESHOOTING.md)
```

---

## **Cheat Sheet** 🎓

### **Essential Commands:**

```sql
-- Check what tables exist:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check your role:
SELECT name, email, role FROM users WHERE id = auth.uid();

-- Become admin:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Check if barcode column exists:
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode';

-- Count records:
SELECT 'users', COUNT(*) FROM users UNION ALL
SELECT 'products', COUNT(*) FROM products UNION ALL
SELECT 'categories', COUNT(*) FROM categories UNION ALL
SELECT 'sales', COUNT(*) FROM sales;

-- Check RLS enabled:
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## **Legend** 🏷️

```
✅ = Recommended / Safe
⚡ = Fast / Quick
⚠️  = Warning / Danger
🔧 = Maintenance / Fix
📖 = Documentation
🔍 = Diagnostic / Debug
🎯 = Solution / Answer
```

---

## **Version History** 📅

```
v1.0.0 (2025-02-27)
- Initial database setup
- All 5 core tables
- RLS policies
- Auto triggers
- Default data
- Complete documentation
```

---

## **Support** 🆘

### **If you're stuck:**

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
2. Find your error in the list
3. Follow the solution steps
4. Run diagnostic queries
5. Check Supabase logs

### **If still stuck:**

1. Export your schema (see TROUBLESHOOTING.md)
2. Check browser console
3. Check API logs in Supabase
4. Try reset & recreate (backup first!)

---

## **Best Practices** ⭐

### **DO:**
- ✅ Use all-in-one script for new setup
- ✅ Backup before running reset script
- ✅ Test in development first
- ✅ Keep admin credentials secure
- ✅ Read error messages carefully
- ✅ Check logs when debugging

### **DON'T:**
- ❌ Run reset script in production
- ❌ Delete users table directly
- ❌ Disable RLS in production
- ❌ Share admin credentials
- ❌ Skip email verification in production
- ❌ Ignore foreign key errors

---

**Everything you need is in this folder!** 📚✅✨

**Start with [README.md](README.md) for quick setup.**
**Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) when stuck.**