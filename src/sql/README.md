# 🚀 Quick Database Setup - Start Here!

## ⚡ AvrilMart - Complete Setup (RECOMMENDED)

### **Use This For Fresh Installation** ✅
```
File: SETUP_AVRILMART_COMPLETE.sql

What you get:
✅ All 5 tables created
✅ 12 categories inserted
✅ 35 sample products with barcodes
✅ Full security (RLS)
✅ All triggers & indexes
✅ Ready to use in 5 minutes!
```

📖 **Detailed Guide:** See [SETUP_AVRILMART_GUIDE.md](SETUP_AVRILMART_GUIDE.md)
🎯 **Visual Guide:** See [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

---

## ⚡ Fastest Way (5 Minutes)

### **Step 1: Open Supabase SQL Editor**
1. Login to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **New Query**

### **Step 2: Run Setup Script**
```sql
-- Copy EVERYTHING from this file:
/src/sql/00_setup_all_tables.sql

-- Paste into SQL Editor
-- Click "Run" button (or Ctrl+Enter)
-- Wait for "Success" message
```

### **Step 3: Create First Admin User**

**Option A: Through App (Recommended)** ✅
```bash
1. Open your app
2. Click "Sign Up" 
3. Fill form:
   - Name: Admin
   - Email: admin@example.com
   - Password: (your secure password)
   - Role: Kasir (we'll change this)
4. Sign up
```

Then run in SQL Editor:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

**Option B: Manual SQL Insert**
```sql
-- 1. First create auth user:
--    Go to: Authentication > Add User
--    Email: admin@example.com
--    Password: (set password)

-- 2. Copy the user ID from auth.users table

-- 3. Run this (replace YOUR-USER-ID):
INSERT INTO users (id, name, email, role)
VALUES (
  'YOUR-USER-ID-HERE',
  'Admin',
  'admin@example.com',
  'admin'
);
```

### **Step 4: Login & Test**
```bash
1. Open app
2. Login with admin credentials
3. You should see all menus:
   ✅ Kasir
   ✅ Inventori
   ✅ Kategori
   ✅ Riwayat Penjualan
   ✅ Laporan
   ✅ Pengguna
```

---

## ✅ What Gets Created

### **Tables:**
- ✅ `users` - User accounts with roles
- ✅ `products` - Product inventory
- ✅ `sales` - Sales transactions
- ✅ `sale_items` - Items in each sale
- ✅ `categories` - Product categories

### **Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Admin-only policies for write operations
- ✅ All users can read data
- ✅ Auto-update timestamps
- ✅ Auto-decrease stock on sale

### **Default Data:**
- ✅ 4 default categories:
  - Elektronik
  - Makanan
  - Pakaian
  - Peralatan

---

## 🐛 Troubleshooting

### **Error: relation "users" does not exist**
✅ **Fix:** Run the all-in-one script: `00_setup_all_tables.sql`

### **Error: column "barcode" does not exist**
✅ **Fix:** Your products table is outdated. Two options:

**Option A: Add Missing Columns (Keeps existing data)** 
```sql
-- Run this script:
/src/sql/05_add_missing_columns.sql

-- This will add barcode and price_modal columns
```

**Option B: Reset & Recreate (Deletes all data)**
```sql
-- Step 1: Drop all tables
/src/sql/99_reset_database.sql

-- Step 2: Recreate all tables
/src/sql/00_setup_all_tables.sql
```

### **Error: permission denied for table**
✅ **Fix:** 
1. Check if you're logged in
2. Check if your user role is 'admin'
3. Run: `SELECT * FROM users WHERE id = auth.uid();`

### **Cannot login after signup**
✅ **Fix:** Check Supabase email confirmation settings
1. Go to: Authentication > Email Auth
2. Enable "Confirm email" or disable it for testing

### **User created but role is "cashier"**
✅ **Fix:** Run SQL to change role:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email';
```

---

## 📖 Detailed Documentation

For detailed setup instructions, see:
- **Complete Guide:** `/src/sql/README_DATABASE_SETUP.md`
- **Individual Scripts:** `/src/sql/01_*.sql`, `02_*.sql`, etc.

---

## ⏱️ Time Required

- ⚡ All-in-one script: **2 minutes**
- 📝 Create admin user: **2 minutes**
- ✅ Test in app: **1 minute**

**Total: ~5 minutes to full setup!** 🎉

---

## 🆘 Need Help?

1. Check browser console for errors
2. Check Supabase logs: Database > Logs
3. Verify tables exist: Table Editor
4. Verify RLS enabled: Table Editor > [table] > Policies
5. Verify admin user exists: 
   ```sql
   SELECT * FROM users WHERE role = 'admin';
   ```

---

## 🎯 Ready to Go!

After setup complete:
- ✅ Login as admin
- ✅ Add products
- ✅ Add categories
- ✅ Create users (cashiers)
- ✅ Process sales
- ✅ View reports

**Happy selling!** 🛒💰✨