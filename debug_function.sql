-- Test the create_simple_purchase function
-- Run this in Supabase SQL editor to debug the issue

-- First, let's test with a simple call
SELECT create_simple_purchase(
  'Test User',
  'test@example.com', 
  '+923001234567',
  '[{"product_id": "a75f035f-f61f-4f1b-890e-847b1bec49d6", "subscription_type": "shared", "subscription_period": "1_month", "price": 1000}]'::jsonb,
  'PKR'
);

-- Check if the product exists
SELECT id, name FROM products WHERE id = 'a75f035f-f61f-4f1b-890e-847b1bec49d6';

-- Check the user_auth_codes table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_auth_codes' 
ORDER BY ordinal_position;












