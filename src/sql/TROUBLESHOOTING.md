# 🔧 Complete Troubleshooting Guide

## Common Errors & Solutions

---

## 1. ❌ ERROR: relation "users" does not exist

### **Symptoms:**
```
ERROR: 42P01: relation "users" does not exist
```

### **Cause:**
- Tables not created yet
- Or tables were created in wrong order

### **Solution:**
```sql
-- Run the all-in-one setup script:
/src/sql/00_setup_all_tables.sql
```

### **Verify:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: users, products, sales, sale_items, categories
```

---

## 2. ❌ ERROR: column "barcode" does not exist

### **Symptoms:**
```
ERROR: 42703: column "barcode" does not exist
```

### **Cause:**
- Products table created with old schema
- Missing barcode and/or price_modal columns

### **Solution A: Add Missing Columns** (Recommended)
```sql
-- Run this to add missing columns:
/src/sql/05_add_missing_columns.sql

-- Keeps all your data ✅
```

### **Solution B: Reset Database**
```sql
-- Delete all data and recreate:
/src/sql/99_reset_database.sql
/src/sql/00_setup_all_tables.sql

-- ⚠️ This deletes all data!
```

### **Verify:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Should include: barcode, price_modal
```

**Detailed Guide:** See `/src/sql/FIX_BARCODE_ERROR.md`

---

## 3. ❌ ERROR: permission denied for table

### **Symptoms:**
```
ERROR: permission denied for table products
ERROR: permission denied for relation products
```

### **Cause:**
- RLS policy blocking your request
- User role is not 'admin' for write operations
- Not logged in

### **Solution:**

**1. Check if logged in:**
```sql
SELECT auth.uid();
-- Should return your user UUID, not NULL
```

**2. Check your role:**
```sql
SELECT id, name, email, role 
FROM users 
WHERE id = auth.uid();

-- Your role should be 'admin' for write operations
```

**3. Upgrade to admin:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = auth.uid();
```

**4. Verify policies exist:**
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'products';

-- Should show policies for SELECT, INSERT, UPDATE, DELETE
```

**5. Check policy logic:**
```sql
-- This should return TRUE for admin users:
SELECT EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
);
```

---

## 4. ❌ Cannot Login / Invalid Credentials

### **Symptoms:**
- "Invalid login credentials" error
- Cannot login even with correct email/password

### **Cause:**
- User doesn't exist in auth.users
- Email confirmation required
- Wrong password

### **Solution:**

**1. Check user exists:**
```sql
-- In Supabase Dashboard:
-- Go to: Authentication > Users
-- Search for your email
```

**2. Disable email confirmation (for testing):**
```
Dashboard > Authentication > Email Auth
Settings:
- Uncheck "Confirm email"
- Save
```

**3. Reset password:**
```
Dashboard > Authentication > Users
Click user > Reset Password
```

**4. Create user if missing:**
```
Dashboard > Authentication > Add User
Fill email and password
```

**5. Add to users table:**
```sql
INSERT INTO users (id, name, email, role)
VALUES (
  'USER-ID-FROM-AUTH-USERS',
  'Your Name',
  'your-email@example.com',
  'admin'
);
```

---

## 5. ❌ User Created But Role is "cashier"

### **Symptoms:**
- Created user through app
- User exists but can't access admin menus
- Role stuck at 'cashier'

### **Cause:**
- Default role in signup is 'cashier'
- First admin must be created manually

### **Solution:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### **Verify:**
```sql
SELECT name, email, role 
FROM users 
WHERE email = 'your-email@example.com';

-- Role should show 'admin'
```

---

## 6. ❌ Stock Not Decreasing After Sale

### **Symptoms:**
- Process sale successfully
- But product stock stays the same

### **Cause:**
- Trigger not created
- Trigger not working

### **Solution:**

**1. Check trigger exists:**
```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname = 'decrease_stock_on_sale';

-- Should return one row
```

**2. Recreate trigger:**
```sql
-- Run this section from:
/src/sql/03_create_sales_tables.sql

-- Look for:
CREATE OR REPLACE FUNCTION update_product_stock_after_sale()
...
CREATE TRIGGER decrease_stock_on_sale
```

**3. Test manually:**
```sql
-- Before:
SELECT id, name, stock FROM products WHERE sku = 'TEST-001';

-- Insert test sale:
INSERT INTO sale_items (sale_id, product_id, product_name, product_sku, quantity, price, subtotal)
VALUES (
  'EXISTING-SALE-ID',
  'PRODUCT-ID',
  'Test Product',
  'TEST-001',
  1,
  10000,
  10000
);

-- After:
SELECT id, name, stock FROM products WHERE sku = 'TEST-001';
-- Stock should decrease by 1
```

---

## 7. ❌ Categories Not Loading

### **Symptoms:**
- Category menu loads but shows empty
- Error in console

### **Cause:**
- Categories table not created
- RLS policy blocking

### **Solution:**

**1. Check table exists:**
```sql
SELECT * FROM categories LIMIT 5;
```

**2. Create table if missing:**
```sql
/src/sql/04_create_categories_table.sql
```

**3. Check default categories:**
```sql
SELECT * FROM categories;

-- Should show at least 4 default categories
```

**4. Add default categories if missing:**
```sql
INSERT INTO categories (name, description) VALUES
  ('Elektronik', 'Produk elektronik dan gadget'),
  ('Makanan', 'Makanan dan minuman'),
  ('Pakaian', 'Pakaian dan aksesoris'),
  ('Peralatan', 'Peralatan rumah tangga')
ON CONFLICT (name) DO NOTHING;
```

---

## 8. ❌ Cannot Create User in App

### **Symptoms:**
- Click "Tambah User"
- Fill form and submit
- Error: "rate limit exceeded" or other error

### **Cause:**
- Supabase rate limiting (fixed in latest version)
- Email already exists
- Invalid email format

### **Solution:**

**1. Check error message:**
- Look in browser console
- Check Network tab for API response

**2. If rate limit:**
```
- This is normal for rapid user creation
- Wait 1 minute and try again
- Or user was actually created successfully
- Just refresh the page
```

**3. If email exists:**
```sql
-- Check if user exists:
SELECT * FROM auth.users WHERE email = 'email@example.com';

-- Delete if needed (careful!):
-- Go to: Dashboard > Authentication > Users
-- Find user > Delete
```

**4. Create manually:**
```sql
-- In Dashboard > Authentication > Add User
-- Then:
INSERT INTO users (id, name, email, role)
VALUES ('USER-ID', 'Name', 'email@example.com', 'cashier');
```

---

## 9. ❌ Foreign Key Constraint Violation

### **Symptoms:**
```
ERROR: insert or update on table "X" violates foreign key constraint
```

### **Cause:**
- Trying to reference non-existent record
- Tables created in wrong order

### **Solution:**

**1. Check foreign key relationships:**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**2. Verify parent record exists:**
```sql
-- Example for sale_items → products:
SELECT id FROM products WHERE id = 'PRODUCT-ID-HERE';

-- Should return one row
```

**3. Recreate tables in order:**
```sql
/src/sql/00_setup_all_tables.sql
-- Tables are created in correct order
```

---

## 10. ❌ Duplicate Key Value Violates Unique Constraint

### **Symptoms:**
```
ERROR: duplicate key value violates unique constraint "products_sku_key"
ERROR: duplicate key value violates unique constraint "users_email_key"
```

### **Cause:**
- Trying to insert duplicate SKU, email, or other unique field

### **Solution:**

**1. Check existing values:**
```sql
-- For products:
SELECT * FROM products WHERE sku = 'DUPLICATE-SKU';

-- For users:
SELECT * FROM users WHERE email = 'duplicate@email.com';
```

**2. Use different value:**
- Change SKU to unique value
- Use different email

**3. Update instead of insert:**
```sql
-- If you want to update existing record:
UPDATE products 
SET name = 'New Name'
WHERE sku = 'EXISTING-SKU';
```

---

## 🔍 Diagnostic Queries

### **Check Database Health:**
```sql
-- 1. List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Count records
SELECT 
  'users' as table, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items;

-- 4. Check policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;

-- 5. Check triggers
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname NOT LIKE 'RI_%'
AND tgname NOT LIKE 'pg_%';

-- 6. Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. Check current user
SELECT 
  auth.uid() as user_id,
  u.name,
  u.email,
  u.role
FROM users u
WHERE u.id = auth.uid();
```

### **Verify Setup Complete:**
```sql
-- All should return TRUE:
SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as users_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'products') as products_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') as sales_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') as sale_items_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') as categories_exists,
  EXISTS(SELECT 1 FROM users WHERE role = 'admin') as admin_exists;
```

---

## 🆘 Still Need Help?

### **1. Check Logs:**
```
Supabase Dashboard > Logs > API Logs
Filter by: Error
```

### **2. Check Browser Console:**
```
F12 > Console tab
Look for red errors
```

### **3. Export Schema:**
```sql
-- Get current schema:
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### **4. Nuclear Option - Complete Reset:**
```sql
-- ⚠️ DELETES EVERYTHING!
/src/sql/99_reset_database.sql
/src/sql/00_setup_all_tables.sql
```

---

## ✅ Quick Fixes Checklist

When something doesn't work:

```bash
☐ Clear browser cache
☐ Hard refresh (Ctrl+Shift+R)
☐ Check browser console for errors
☐ Check Supabase logs
☐ Verify logged in (auth.uid() not null)
☐ Verify user role = 'admin'
☐ Verify tables exist
☐ Verify RLS enabled
☐ Verify policies exist
☐ Try logout/login
☐ Try different browser
☐ Check Supabase status page
```

---

**Most issues can be fixed with the scripts in this folder!** 🔧✅
