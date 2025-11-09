-- Prevent future sales analytics consistency issues
-- This script adds validation and cleanup functions

-- Create a function to validate analytics data consistency
CREATE OR REPLACE FUNCTION validate_sales_analytics_consistency()
RETURNS BOOLEAN AS $$
DECLARE
    analytics_revenue DECIMAL(10,2);
    expected_revenue DECIMAL(10,2);
    analytics_subscriptions INTEGER;
    actual_subscriptions INTEGER;
BEGIN
    -- Get analytics totals
    SELECT 
        COALESCE(SUM(revenue), 0),
        COALESCE(SUM(subscriptions_sold), 0)
    INTO analytics_revenue, analytics_subscriptions
    FROM sales_analytics;
    
    -- Get actual subscription totals
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
        ), 0),
        COUNT(*)
    INTO expected_revenue, actual_subscriptions
    FROM user_subscriptions us;
    
    -- Check if data is consistent
    RETURN (analytics_revenue = expected_revenue AND analytics_subscriptions = actual_subscriptions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to auto-fix inconsistencies
CREATE OR REPLACE FUNCTION auto_fix_sales_analytics_consistency()
RETURNS TEXT AS $$
DECLARE
    is_consistent BOOLEAN;
    records_before INTEGER;
    records_after INTEGER;
BEGIN
    -- Check if data is already consistent
    SELECT validate_sales_analytics_consistency() INTO is_consistent;
    
    IF is_consistent THEN
        RETURN 'Data is already consistent. No action needed.';
    END IF;
    
    -- Count records before fix
    SELECT COUNT(*) INTO records_before FROM sales_analytics;
    
    -- Clear and rebuild analytics data
    DELETE FROM sales_analytics;
    
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
    
    -- Count records after fix
    SELECT COUNT(*) INTO records_after FROM sales_analytics;
    
    -- Log the auto-fix
    INSERT INTO admin_action_logs (action, table_name, record_id, notes, created_at)
    VALUES (
        'auto_fix_analytics_consistency',
        'sales_analytics',
        NULL,
        FORMAT('Auto-fixed analytics consistency. Records before: %, after: %', records_before, records_after),
        NOW()
    );
    
    RETURN FORMAT('Analytics consistency fixed. Records before: %, after: %', records_before, records_after);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to validate consistency after analytics updates
CREATE OR REPLACE FUNCTION check_analytics_consistency_trigger()
RETURNS TRIGGER AS $$
DECLARE
    is_consistent BOOLEAN;
BEGIN
    -- Check consistency after the operation
    SELECT validate_sales_analytics_consistency() INTO is_consistent;
    
    IF NOT is_consistent THEN
        RAISE WARNING 'Sales analytics data inconsistency detected. Consider running auto_fix_sales_analytics_consistency().';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on sales_analytics table
DROP TRIGGER IF EXISTS check_analytics_consistency ON sales_analytics;
CREATE TRIGGER check_analytics_consistency
    AFTER INSERT OR UPDATE OR DELETE ON sales_analytics
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_analytics_consistency_trigger();

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_sales_analytics_consistency() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_fix_sales_analytics_consistency() TO authenticated;

-- Add comments
COMMENT ON FUNCTION validate_sales_analytics_consistency() IS 'Validates that sales analytics data is consistent with actual subscription data';
COMMENT ON FUNCTION auto_fix_sales_analytics_consistency() IS 'Automatically fixes sales analytics data consistency issues by rebuilding from subscription data';
COMMENT ON TRIGGER check_analytics_consistency ON sales_analytics IS 'Warns when analytics data becomes inconsistent with subscription data';
