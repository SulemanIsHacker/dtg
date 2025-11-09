-- Debug script to check sales analytics data consistency
-- Run this in Supabase SQL Editor to see what's causing the mismatch

-- Check what's in the sales_analytics table
SELECT 
    'sales_analytics table' as source,
    COUNT(*) as record_count,
    SUM(revenue) as total_revenue,
    SUM(subscriptions_sold) as total_subscriptions,
    SUM(active_subscriptions) as active_subscriptions,
    SUM(expired_subscriptions) as expired_subscriptions
FROM sales_analytics

UNION ALL

-- Check what's in user_subscriptions table
SELECT 
    'user_subscriptions table' as source,
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
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'expired') as expired_subscriptions
FROM user_subscriptions;

-- Check individual records in sales_analytics
SELECT 
    'Individual sales_analytics records' as info,
    date,
    p.name as product_name,
    subscription_type,
    subscription_period,
    revenue,
    subscriptions_sold,
    active_subscriptions,
    expired_subscriptions
FROM sales_analytics sa
JOIN products p ON sa.product_id = p.id
ORDER BY date DESC;

-- Check what get_sales_analytics function returns
SELECT 
    'get_sales_analytics function result' as info,
    period_start,
    period_end,
    total_revenue,
    total_subscriptions,
    total_refunds,
    active_subscriptions,
    expired_subscriptions
FROM get_sales_analytics(
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    CURRENT_DATE::DATE,
    'daily'
);

-- Check what get_product_sales_summary function returns
SELECT 
    'get_product_sales_summary function result' as info,
    product_id,
    product_name,
    total_revenue,
    total_subscriptions,
    total_refunds,
    active_subscriptions,
    expired_subscriptions
FROM get_product_sales_summary(
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    CURRENT_DATE::DATE
);
