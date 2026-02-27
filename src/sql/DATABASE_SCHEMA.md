# 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
│                  POS & Inventory Management System                   │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      auth.users      │  (Supabase Auth - Built-in)
├──────────────────────┤
│ id (UUID) PK         │
│ email                │
│ encrypted_password   │
│ ...                  │
└──────────┬───────────┘
           │
           │ References
           │
┌──────────▼───────────┐
│       users          │  (Custom User Data)
├──────────────────────┤
│ id (UUID) PK/FK      │◄──────────┐
│ name                 │           │
│ email UNIQUE         │           │
│ role (admin/cashier) │           │
│ created_at           │           │
│ updated_at           │           │
└──────────┬───────────┘           │
           │                       │
           │                       │
           │                       │
           │ References            │ References
           │ (user_id)             │ (user_id)
           │                       │
┌──────────▼───────────┐           │
│       sales          │           │
├──────────────────────┤           │
│ id (UUID) PK         │           │
│ user_id (FK)         │───────────┘
│ total                │
│ subtotal             │
│ tax                  │
│ discount             │
│ price_type           │
│ payment_amount       │
│ change_amount        │
│ created_at           │
└──────────┬───────────┘
           │
           │ References
           │ (sale_id)
           │
┌──────────▼───────────┐
│     sale_items       │
├──────────────────────┤
│ id (UUID) PK         │
│ sale_id (FK)         │───────┐
│ product_id (FK)      │◄──────┼──────────┐
│ product_name         │       │          │
│ product_sku          │       │          │
│ quantity             │       │          │
│ price                │       │          │
│ subtotal             │       │          │
│ created_at           │       │          │
└──────────────────────┘       │          │
                               │          │
                               │          │ References
                               │          │ (product_id)
                               │          │
┌──────────────────────┐       │          │
│      products        │       │          │
├──────────────────────┤       │          │
│ id (UUID) PK         │───────┼──────────┘
│ name                 │       │
│ sku UNIQUE           │       │
│ barcode              │       │
│ category             │       │
│ price_retail         │       │
│ price_wholesale      │       │
│ price_modal          │       │
│ stock                │◄──────┘ (Auto-decrease on sale)
│ image                │
│ created_at           │
│ updated_at           │
└──────────────────────┘


┌──────────────────────┐
│     categories       │  (Independent Master Data)
├──────────────────────┤
│ id (UUID) PK         │
│ name UNIQUE          │
│ description          │
│ created_at           │
│ updated_at           │
└──────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                           RELATIONSHIPS                              │
└─────────────────────────────────────────────────────────────────────┘

auth.users (1) ──── (1) users
  One auth user has one user profile

users (1) ──── (N) sales
  One user can create many sales

sales (1) ──── (N) sale_items
  One sale has many sale items

products (1) ──── (N) sale_items
  One product can be in many sale items

categories (Independent)
  Product.category is just a TEXT field
  Categories table is for master data management


┌─────────────────────────────────────────────────────────────────────┐
│                          AUTO TRIGGERS                               │
└─────────────────────────────────────────────────────────────────────┘

✅ Auto-update timestamps:
   - users.updated_at
   - products.updated_at
   - categories.updated_at

✅ Auto-decrease stock:
   - When sale_items is inserted
   - products.stock = stock - quantity


┌─────────────────────────────────────────────────────────────────────┐
│                        SECURITY (RLS)                                │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│    Table     │  SELECT  │  INSERT  │  UPDATE  │  DELETE  │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ users        │ All Auth │ Admin    │ Admin    │ Admin    │
│ products     │ All Auth │ Admin    │ Admin    │ Admin    │
│ sales        │ All Auth │ Own Only │ -        │ -        │
│ sale_items   │ All Auth │ Own Sale │ -        │ -        │
│ categories   │ All Auth │ Admin    │ Admin    │ Admin    │
└──────────────┴──────────┴──────────┴──────────┴──────────┘

Legend:
- All Auth = All authenticated users
- Admin = Only users with role='admin'
- Own Only = Only user's own records
- Own Sale = Items for user's own sales
- "-" = No policy (not allowed)


┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────────┘

1️⃣ USER SIGNUP:
   auth.users ➔ users (with role)

2️⃣ CREATE PRODUCT:
   Admin ➔ products (INSERT)

3️⃣ CREATE CATEGORY:
   Admin ➔ categories (INSERT)

4️⃣ PROCESS SALE:
   Cashier/Admin ➔ sales (INSERT)
                 ➔ sale_items (INSERT × N)
                 ➔ products.stock (AUTO DECREASE)

5️⃣ VIEW REPORTS:
   Admin ➔ SELECT sales + sale_items (JOIN)


┌─────────────────────────────────────────────────────────────────────┐
│                       INDEXES (Performance)                          │
└─────────────────────────────────────────────────────────────────────┘

users:
  ✅ idx_users_email (email)
  ✅ idx_users_role (role)

products:
  ✅ idx_products_sku (sku)
  ✅ idx_products_barcode (barcode)
  ✅ idx_products_category (category)
  ✅ idx_products_name (name)

sales:
  ✅ idx_sales_user_id (user_id)
  ✅ idx_sales_created_at (created_at DESC)

sale_items:
  ✅ idx_sale_items_sale_id (sale_id)
  ✅ idx_sale_items_product_id (product_id)

categories:
  ✅ idx_categories_name (name)


┌─────────────────────────────────────────────────────────────────────┐
│                    CONSTRAINTS (Data Integrity)                      │
└─────────────────────────────────────────────────────────────────────┘

UNIQUE Constraints:
  ✅ users.email
  ✅ products.sku
  ✅ categories.name

CHECK Constraints:
  ✅ users.role IN ('admin', 'cashier')
  ✅ sales.price_type IN ('retail', 'wholesale')

NOT NULL Constraints:
  ✅ All required fields marked NOT NULL

Foreign Key Cascades:
  ✅ users.id → ON DELETE CASCADE (delete user data)
  ✅ sales.user_id → ON DELETE CASCADE
  ✅ sale_items.sale_id → ON DELETE CASCADE
  ✅ sale_items.product_id → ON DELETE SET NULL


┌─────────────────────────────────────────────────────────────────────┐
│                      DEFAULT VALUES                                  │
└─────────────────────────────────────────────────────────────────────┘

UUIDs:
  ✅ All IDs auto-generated: gen_random_uuid()

Timestamps:
  ✅ created_at: timezone('utc'::text, now())
  ✅ updated_at: timezone('utc'::text, now())

Numbers:
  ✅ products.price_modal: 0
  ✅ products.stock: 0
  ✅ sales.tax: 0
  ✅ sales.discount: 0
```

---

## 📝 Notes

### **Why categories is independent?**
- Products use `category` as TEXT field (flexible)
- Categories table is for **master data management**
- Can be extended later to use FK relationship

### **Why sale_items duplicate product info?**
- Historical data preservation
- Product names/prices may change
- Sale records should show what was sold at that time

### **Why stock is auto-decreased?**
- Prevent manual errors
- Ensure data consistency
- Trigger runs on sale_items INSERT

### **Why RLS on all tables?**
- Security best practice
- Prevent unauthorized access
- Control at database level

---

## 🎯 Quick Reference

### **Common Queries:**

```sql
-- Get all admin users
SELECT * FROM users WHERE role = 'admin';

-- Get low stock products
SELECT * FROM products WHERE stock < 10;

-- Get today's sales
SELECT * FROM sales WHERE created_at::date = CURRENT_DATE;

-- Get total sales by user
SELECT user_id, COUNT(*), SUM(total)
FROM sales
GROUP BY user_id;

-- Get best selling products
SELECT product_name, SUM(quantity) as total_sold
FROM sale_items
GROUP BY product_name
ORDER BY total_sold DESC
LIMIT 10;

-- Get sales with items (JOIN)
SELECT s.*, si.*
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
WHERE s.created_at >= NOW() - INTERVAL '7 days';
```

---

**Schema Version:** 1.0.0
**Last Updated:** 2025-02-27
**Compatible with:** Supabase PostgreSQL 15+
