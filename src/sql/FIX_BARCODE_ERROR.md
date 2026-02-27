# 🔧 Fix: Column "barcode" does not exist

## ❌ Error Message:
```
ERROR: 42703: column "barcode" does not exist
```

## 🔍 Problem:
Your `products` table was created with an old schema that doesn't include the `barcode` column (and possibly `price_modal` column).

---

## ✅ Solution Options

### **Option A: Add Missing Columns** (RECOMMENDED - Keeps Data)

This option will **keep all your existing products** and just add the missing columns.

**Steps:**
1. Open Supabase SQL Editor
2. Copy & paste script from: `/src/sql/05_add_missing_columns.sql`
3. Click Run
4. Done! ✅

**What it does:**
```sql
✅ Adds 'barcode' column to products
✅ Adds 'price_modal' column to products
✅ Creates index for barcode
✅ Sets default value for price_modal (0)
✅ Verifies all columns exist
✅ Shows current table structure
```

**Your data:**
```
✅ All existing products preserved
✅ Existing columns unchanged
✅ Stock levels preserved
✅ Only adds missing columns
```

---

### **Option B: Reset Database** (Deletes All Data)

Use this option if:
- You're just testing the app
- You don't have important data yet
- You want a clean start

**⚠️ WARNING: This will DELETE ALL DATA!**

**Steps:**
1. **Backup data (optional):**
   ```sql
   -- Export from Table Editor if you need data
   ```

2. **Drop all tables:**
   - Open Supabase SQL Editor
   - Copy & paste: `/src/sql/99_reset_database.sql`
   - Click Run

3. **Recreate all tables:**
   - Copy & paste: `/src/sql/00_setup_all_tables.sql`
   - Click Run

4. **Recreate admin user:**
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

**What gets deleted:**
```
❌ All users (except auth users)
❌ All products
❌ All categories
❌ All sales history
❌ All settings
```

---

## 🎯 Recommended: Use Option A

**Why?**
```
✅ No data loss
✅ Fast (30 seconds)
✅ Safe
✅ Just adds missing columns
✅ App works immediately after
```

---

## 📝 After Fix

### **Verify the fix worked:**

**1. Check columns exist:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Should show: id, name, sku, barcode, category, 
-- price_retail, price_wholesale, price_modal, stock, image, 
-- created_at, updated_at
```

**2. Test in app:**
```bash
1. Login to app
2. Go to Inventori
3. Click "Tambah Produk"
4. Fill form including barcode field
5. Save
6. Should work without errors ✅
```

**3. Test barcode scan:**
```bash
1. Go to Kasir (POS)
2. Use barcode input field
3. Scan or type barcode
4. Product should be found ✅
```

---

## 🔄 Migration Details

### **What changes in your database:**

**Before (Old Schema):**
```sql
products:
  - id
  - name
  - sku
  - category
  - price_retail
  - price_wholesale
  - stock
  - image
  - created_at
  - updated_at
```

**After (New Schema):**
```sql
products:
  - id
  - name
  - sku
  - barcode          ← ADDED
  - category
  - price_retail
  - price_wholesale
  - price_modal      ← ADDED
  - stock
  - image
  - created_at
  - updated_at
```

### **New columns:**
```
✅ barcode (TEXT, nullable)
   - For barcode scanning
   - Indexed for fast lookup
   - Optional field

✅ price_modal (DECIMAL, default 0)
   - For cost/capital price
   - Used in profit calculations
   - Default value: 0
```

---

## 🐛 Still Having Issues?

### **Error persists after running script:**
```sql
-- 1. Check if columns were added:
\d products;

-- 2. Check column details:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('barcode', 'price_modal');

-- 3. If columns exist but error persists:
-- Clear browser cache and reload app
```

### **Migration script fails:**
```sql
-- If you get "table products does not exist":
-- You need to run the full setup first:
/src/sql/00_setup_all_tables.sql
```

### **RLS policy errors after migration:**
```sql
-- Policies should still work fine
-- But if you get policy errors, check:
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Should show policies for SELECT, INSERT, UPDATE, DELETE
```

---

## ✅ Quick Command Summary

### **To fix barcode error:**
```bash
# Copy this file:
/src/sql/05_add_missing_columns.sql

# Paste in: Supabase SQL Editor
# Click: Run
# Done! ✅
```

### **To verify fix:**
```sql
-- Should return 'barcode' and 'price_modal':
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('barcode', 'price_modal');
```

---

## 📊 Migration Impact

```
⏱️  Time: 30 seconds
💾  Data Loss: NONE
⚠️  Risk: LOW
✅  Reversible: YES (just drop columns if needed)
🔄  Downtime: NONE
🎯  Recommended: YES
```

---

**Fix completed! Your app should now work perfectly with barcode support.** 🎉✨🔧
