-- ============================================
-- RESET DATABASE (DANGER!)
-- ============================================
-- ⚠️ WARNING: This will DELETE ALL DATA!
-- ⚠️ Only use this if you want to start fresh
-- ⚠️ Backup your data before running this!
-- ============================================

-- Confirm you want to reset
DO $$
BEGIN
  RAISE NOTICE '⚠️  THIS WILL DELETE ALL DATA!';
  RAISE NOTICE '⚠️  Press Ctrl+C to cancel if you are not sure';
  RAISE NOTICE '⚠️  Waiting 5 seconds...';
  -- pg_sleep(5);  -- Uncomment this line for safety delay
END $$;

-- Drop all tables in reverse order (to handle foreign keys)
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_products_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_categories_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_product_stock_after_sale() CASCADE;

-- Verify all tables are dropped
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('users', 'products', 'sales', 'sale_items', 'categories');
  
  IF table_count = 0 THEN
    RAISE NOTICE '✅ All tables dropped successfully';
    RAISE NOTICE '📝 Now run: 00_setup_all_tables.sql to recreate';
  ELSE
    RAISE WARNING '⚠️  Some tables still exist: %', table_count;
  END IF;
END $$;

-- Show remaining tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
