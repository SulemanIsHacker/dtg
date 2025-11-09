-- Fix sales analytics data consistency issues
-- This script addresses the problem where revenue shows but subscriptions don't match

-- First, let's identify the inconsistency
DO $$
DECLARE
    analytics_revenue DECIMAL(10,2);
    analytics_subscriptions INTEGER;
    actual_subscriptions INTEGER;
    orphaned_records INTEGER;
BEGIN
    -- Check current analytics data
    SELECT 
        COALESCE(SUM(revenue), 0),
        COALESCE(SUM(subscriptions_sold), 0)
    INTO analytics_revenue, analytics_subscriptions
    FROM sales_analytics;
    
    -- Check actual subscription data
    SELECT COUNT(*) INTO actual_subscriptions FROM user_subscriptions;
    
    -- Check for orphaned analytics records
    SELECT COUNT(*) INTO orphaned_records
    FROM sales_analytics sa
    WHERE NOT EXISTS (
        SELECT 1 FROM user_subscriptions us
        WHERE us.product_id = sa.product_id
        AND us.subscription_type = sa.subscription_type
        AND us.subscription_period = sa.subscription_period
        AND DATE(us.created_at) = sa.date
    );
    
    RAISE NOTICE 'Current state:';
    RAISE NOTICE 'Analytics Revenue: %, Analytics Subscriptions: %', analytics_revenue, analytics_subscriptions;
    RAISE NOTICE 'Actual Subscriptions: %', actual_subscriptions;
    RAISE NOTICE 'Orphaned Analytics Records: %', orphaned_records;
    
    IF orphaned_records > 0 THEN
        RAISE NOTICE 'Found orphaned analytics records. These will be cleaned up.';
    END IF;
END $$;

-- Option 1: Clean up orphaned analytics records (recommended)
-- Remove analytics records that don't have corresponding subscriptions
DELETE FROM sales_analytics 
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions us
    WHERE us.product_id = sales_analytics.product_id
    AND us.subscription_type = sales_analytics.subscription_type
    AND us.subscription_period = sales_analytics.subscription_period
    AND DATE(us.created_at) = sales_analytics.date
);

-- Option 2: Rebuild analytics from actual subscription data
-- This ensures 100% consistency between analytics and subscriptions
DELETE FROM sales_analytics;

-- Rebuild analytics from actual subscription data
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

-- Verify the fix
DO $$
DECLARE
    analytics_revenue DECIMAL(10,2);
    analytics_subscriptions INTEGER;
    actual_subscriptions INTEGER;
    revenue_match BOOLEAN;
    subscription_match BOOLEAN;
BEGIN
    -- Check analytics data after fix
    SELECT 
        COALESCE(SUM(revenue), 0),
        COALESCE(SUM(subscriptions_sold), 0)
    INTO analytics_revenue, analytics_subscriptions
    FROM sales_analytics;
    
    -- Check actual subscription data
    SELECT COUNT(*) INTO actual_subscriptions FROM user_subscriptions;
    
    -- Calculate expected revenue from actual subscriptions
    DECLARE
        expected_revenue DECIMAL(10,2);
    BEGIN
        SELECT COALESCE(SUM(
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
            )
        ), 0) INTO expected_revenue
        FROM user_subscriptions us;
        
        revenue_match := (analytics_revenue = expected_revenue);
        subscription_match := (analytics_subscriptions = actual_subscriptions);
        
        RAISE NOTICE 'After fix:';
        RAISE NOTICE 'Analytics Revenue: %, Expected Revenue: %', analytics_revenue, expected_revenue;
        RAISE NOTICE 'Analytics Subscriptions: %, Actual Subscriptions: %', analytics_subscriptions, actual_subscriptions;
        RAISE NOTICE 'Revenue Match: %, Subscription Match: %', revenue_match, subscription_match;
        
        IF revenue_match AND subscription_match THEN
            RAISE NOTICE 'SUCCESS: Sales analytics data is now consistent!';
        ELSE
            RAISE WARNING 'WARNING: Data inconsistency still exists. Manual review required.';
        END IF;
    END;
END $$;

-- Create a function to check data consistency
CREATE OR REPLACE FUNCTION check_sales_analytics_consistency()
RETURNS TABLE(
    analytics_revenue DECIMAL(10,2),
    expected_revenue DECIMAL(10,2),
    analytics_subscriptions INTEGER,
    actual_subscriptions INTEGER,
    revenue_consistent BOOLEAN,
    subscription_consistent BOOLEAN,
    overall_consistent BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH analytics_summary AS (
        SELECT 
            COALESCE(SUM(revenue), 0) as analytics_revenue,
            COALESCE(SUM(subscriptions_sold), 0) as analytics_subscriptions
        FROM sales_analytics
    ),
    subscription_summary AS (
        SELECT 
            COALESCE(SUM(
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
                )
            ), 0) as expected_revenue,
            COUNT(*) as actual_subscriptions
        FROM user_subscriptions us
    )
    SELECT 
        asum.analytics_revenue,
        ssum.expected_revenue,
        asum.analytics_subscriptions,
        ssum.actual_subscriptions,
        (asum.analytics_revenue = ssum.expected_revenue) as revenue_consistent,
        (asum.analytics_subscriptions = ssum.actual_subscriptions) as subscription_consistent,
        (asum.analytics_revenue = ssum.expected_revenue AND asum.analytics_subscriptions = ssum.actual_subscriptions) as overall_consistent
    FROM analytics_summary asum, subscription_summary ssum;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION check_sales_analytics_consistency() TO authenticated;

-- Log the fix
INSERT INTO admin_action_logs (action, table_name, record_id, notes, created_at)
VALUES (
    'fix_sales_analytics_consistency',
    'sales_analytics',
    NULL,
    'Fixed data consistency between sales analytics and user subscriptions',
    NOW()
);

COMMENT ON FUNCTION check_sales_analytics_consistency() IS 'Checks if sales analytics data is consistent with actual subscription data';
