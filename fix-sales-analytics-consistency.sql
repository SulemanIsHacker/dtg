-- Quick fix for sales analytics consistency issue
-- Run this in Supabase SQL Editor to fix the revenue/subscription mismatch

-- Step 1: Check current state
SELECT 
    'Current State' as status,
    (SELECT COALESCE(SUM(revenue), 0) FROM sales_analytics) as analytics_revenue,
    (SELECT COALESCE(SUM(subscriptions_sold), 0) FROM sales_analytics) as analytics_subscriptions,
    (SELECT COUNT(*) FROM user_subscriptions) as actual_subscriptions;

-- Step 2: Clear all sales analytics data
DELETE FROM sales_analytics;

-- Step 3: Rebuild analytics from actual subscription data
INSERT INTO sales_analytics (
    date,
    product_id,
    subscription_type,
    subscription_period,
    revenue,
    subscriptions_sold,
    active_subscriptions,
    expired_subscriptions
)
SELECT 
    DATE(us.created_at) as date,
    us.product_id,
    us.subscription_type,
    us.subscription_period,
    COALESCE(us.custom_price, 
        CASE us.subscription_type
            WHEN 'shared' THEN 5.0
            WHEN 'semi_private' THEN 10.0
            WHEN 'private' THEN 15.0
            ELSE 5.0
        END * 
        CASE us.subscription_period
            WHEN '1_month' THEN 1.0
            WHEN '3_months' THEN 2.5
            WHEN '6_months' THEN 4.5
            WHEN '1_year' THEN 8.0
            WHEN '2_years' THEN 14.0
            WHEN 'lifetime' THEN 25.0
            ELSE 1.0
        END
    ) as revenue,
    1 as subscriptions_sold,
    CASE WHEN us.status = 'active' THEN 1 ELSE 0 END as active_subscriptions,
    CASE WHEN us.status = 'expired' THEN 1 ELSE 0 END as expired_subscriptions
FROM user_subscriptions us
ORDER BY us.created_at;

-- Step 4: Verify the fix
SELECT 
    'After Fix' as status,
    (SELECT COALESCE(SUM(revenue), 0) FROM sales_analytics) as analytics_revenue,
    (SELECT COALESCE(SUM(subscriptions_sold), 0) FROM sales_analytics) as analytics_subscriptions,
    (SELECT COUNT(*) FROM user_subscriptions) as actual_subscriptions,
    CASE 
        WHEN (SELECT COALESCE(SUM(subscriptions_sold), 0) FROM sales_analytics) = (SELECT COUNT(*) FROM user_subscriptions)
        THEN 'CONSISTENT ✅'
        ELSE 'STILL INCONSISTENT ❌'
    END as consistency_status;

-- Step 5: Show detailed breakdown
SELECT 
    sa.date,
    p.name as product_name,
    sa.subscription_type,
    sa.subscription_period,
    sa.revenue,
    sa.subscriptions_sold,
    sa.active_subscriptions,
    sa.expired_subscriptions
FROM sales_analytics sa
JOIN products p ON sa.product_id = p.id
ORDER BY sa.date DESC, p.name;
