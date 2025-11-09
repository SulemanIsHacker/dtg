-- Debug the create_simple_purchase function
-- Run this in Supabase SQL editor to test the function

-- Test 1: Check if function exists and its signature
SELECT routine_name, routine_type, data_type, specific_name
FROM information_schema.routines 
WHERE routine_name = 'create_simple_purchase';

-- Test 2: Check if the product exists
SELECT id, name, price FROM products WHERE id = 'a75f035f-f61f-4f1b-890e-847b1bec49d6';

-- Test 3: Simple function call with the exact data from the error
SELECT create_simple_purchase(
  'Suleman',
  'punjab7433659@gmail.com', 
  '+923701543089',
  '[{"product_id": "a75f035f-f61f-4f1b-890e-847b1bec49d6", "subscription_type": "shared", "subscription_period": "1_month", "price": 1000}]'::jsonb,
  'PKR'
);

-- Test 4: Check if user_auth_codes table has phone_number column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_auth_codes' 
AND column_name = 'phone_number';

-- Test 5: Check if product_codes table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'product_codes';












