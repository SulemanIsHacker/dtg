-- Selective cleanup script for sales analytics only
-- This script removes only sales analytics data while preserving user subscriptions
-- Use this if you want to keep legitimate user subscriptions but clear analytics

-- Check current state
DO $$
DECLARE
    sales_count INTEGER;
    subscription_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sales_count FROM sales_analytics;
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions;
    
    RAISE NOTICE 'Before selective cleanup - Sales Analytics: %, User Subscriptions: %', 
        sales_count, subscription_count;
END $$;

-- Clear only sales analytics data
DELETE FROM sales_analytics;

-- Clear admin action logs related to sales analytics
DELETE FROM admin_action_logs 
WHERE table_name = 'sales_analytics' 
   OR action LIKE '%sales%' 
   OR action LIKE '%analytics%';

-- Log the selective cleanup
INSERT INTO admin_action_logs (action, table_name, record_id, notes, created_at)
VALUES (
    'selective_cleanup_sales_analytics',
    'sales_analytics',
    NULL,
    'Cleared sales analytics data while preserving user subscriptions',
    NOW()
);

-- Verify selective cleanup
DO $$
DECLARE
    sales_count INTEGER;
    subscription_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sales_count FROM sales_analytics;
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions;
    
    RAISE NOTICE 'After selective cleanup - Sales Analytics: %, User Subscriptions: %', 
        sales_count, subscription_count;
    
    IF sales_count = 0 THEN
        RAISE NOTICE 'SUCCESS: Sales analytics data has been cleared';
        IF subscription_count > 0 THEN
            RAISE NOTICE 'INFO: User subscriptions preserved (% records)', subscription_count;
        END IF;
    ELSE
        RAISE WARNING 'WARNING: Some sales analytics data still exists';
    END IF;
END $$;

-- Create a function to check sales analytics status
CREATE OR REPLACE FUNCTION check_sales_analytics_status()
RETURNS TABLE(
    sales_analytics_count INTEGER,
    user_subscriptions_count INTEGER,
    has_analytics_data BOOLEAN,
    has_subscription_data BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM sales_analytics)::INTEGER,
        (SELECT COUNT(*) FROM user_subscriptions)::INTEGER,
        (SELECT COUNT(*) FROM sales_analytics) > 0,
        (SELECT COUNT(*) FROM user_subscriptions) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION check_sales_analytics_status() TO authenticated;

COMMENT ON FUNCTION check_sales_analytics_status() IS 'Checks the current status of sales analytics and user subscriptions data';
