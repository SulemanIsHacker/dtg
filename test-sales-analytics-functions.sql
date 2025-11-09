-- Test script to verify sales analytics functions work correctly
-- Run this in Supabase SQL Editor to test the functions

-- Test 1: Check if functions exist
SELECT 
    'Function Check' as test,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_sales_analytics', 'get_product_sales_summary')
AND routine_schema = 'public';

-- Test 2: Test get_sales_analytics function with simple parameters
SELECT 
    'get_sales_analytics test' as test,
    period_start,
    period_end,
    total_revenue,
    total_subscriptions,
    total_refunds,
    active_subscriptions,
    expired_subscriptions
FROM get_sales_analytics(
    '2024-01-01'::DATE,
    '2024-12-31'::DATE,
    'daily'
)
LIMIT 5;

-- Test 3: Test get_product_sales_summary function
SELECT 
    'get_product_sales_summary test' as test,
    product_id,
    product_name,
    total_revenue,
    total_subscriptions,
    total_refunds,
    active_subscriptions,
    expired_subscriptions
FROM get_product_sales_summary(
    '2024-01-01'::DATE,
    '2024-12-31'::DATE
)
LIMIT 5;

-- Test 4: Check if we have any data in the tables
SELECT 
    'Data Check' as test,
    'sales_analytics' as table_name,
    COUNT(*) as record_count,
    SUM(revenue) as total_revenue,
    SUM(subscriptions_sold) as total_subscriptions
FROM sales_analytics

UNION ALL

SELECT 
    'Data Check' as test,
    'user_subscriptions' as table_name,
    COUNT(*) as record_count,
    SUM(
        COALESCE(custom_price, 
            CASE subscription_type
                WHEN 'shared' THEN 5.0
                WHEN 'semi_private' THEN 10.0
                WHEN 'private' THEN 15.0
                ELSE 5.0
            END * 
            CASE subscription_period
                WHEN '1_month' THEN 1.0
                WHEN '3_months' THEN 2.5
                WHEN '6_months' THEN 4.5
                WHEN '1_year' THEN 8.0
                WHEN '2_years' THEN 14.0
                WHEN 'lifetime' THEN 25.0
                ELSE 1.0
            END
        )
    ) as total_revenue,
    COUNT(*) as total_subscriptions
FROM user_subscriptions;
