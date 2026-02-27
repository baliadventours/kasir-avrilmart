-- ============================================
-- MIGRATION: Add Missing Columns
-- ============================================
-- Use this if you already have tables created
-- but missing some columns (like barcode, price_modal)
-- ============================================

-- Add barcode column to products if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE products ADD COLUMN barcode TEXT;
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    RAISE NOTICE 'Added barcode column to products table';
  ELSE
    RAISE NOTICE 'barcode column already exists';
  END IF;
END $$;

-- Add price_modal column to products if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price_modal'
  ) THEN
    ALTER TABLE products ADD COLUMN price_modal DECIMAL(12, 2) DEFAULT 0;
    RAISE NOTICE 'Added price_modal column to products table';
  ELSE
    RAISE NOTICE 'price_modal column already exists';
  END IF;
END $$;

-- Verify all required columns exist
DO $$
DECLARE
  missing_cols TEXT := '';
  required_cols TEXT[] := ARRAY[
    'id', 'name', 'sku', 'barcode', 'category', 
    'price_retail', 'price_wholesale', 'price_modal', 
    'stock', 'image', 'created_at', 'updated_at'
  ];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_cols
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = col
    ) THEN
      missing_cols := missing_cols || col || ', ';
    END IF;
  END LOOP;
  
  IF missing_cols != '' THEN
    RAISE WARNING 'Missing columns in products table: %', missing_cols;
  ELSE
    RAISE NOTICE 'All required columns exist in products table ✓';
  END IF;
END $$;

-- Show current products table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
