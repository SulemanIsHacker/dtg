-- Test the function step by step to find the exact error
-- Run this in Supabase SQL editor

-- Test 1: Check if function exists
SELECT routine_name, routine_type, data_type 
FROM information_schema.routines 
WHERE routine_name = 'create_simple_purchase';

-- Test 2: Check if the product exists
SELECT id, name, price FROM products WHERE id = 'a75f035f-f61f-4f1b-890e-847b1bec49d6';

-- Test 3: Check if user_auth_codes table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_auth_codes' 
ORDER BY ordinal_position;

-- Test 4: Check if product_codes table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'product_codes';

-- Test 5: Try the function call with error details
SELECT create_simple_purchase(
  'Suleman',
  'punjab7433659@gmail.com', 
  '+923701543089',
  '[{"product_id": "a75f035f-f61f-4f1b-890e-847b1bec49d6", "subscription_type": "shared", "subscription_period": "1_month", "price": 1000}]'::jsonb,
  'PKR'
);












