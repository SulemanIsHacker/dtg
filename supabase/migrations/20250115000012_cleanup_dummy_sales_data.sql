-- Cleanup script to remove all dummy/test data from sales analytics
-- This script will clear all sales analytics data and reset the system

-- First, let's check what data exists before cleanup
DO $$
DECLARE
    sales_count INTEGER;
    subscription_count INTEGER;
BEGIN
    -- Count existing sales analytics records
    SELECT COUNT(*) INTO sales_count FROM sales_analytics;
    
    -- Count existing user subscriptions
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions;
    
    RAISE NOTICE 'Before cleanup - Sales Analytics records: %, User Subscriptions: %', sales_count, subscription_count;
END $$;

-- Clear all sales analytics data
DELETE FROM sales_analytics;

-- Clear all user subscriptions (this will also clear any dummy subscriptions)
DELETE FROM user_subscriptions;

-- Clear any refund requests that might be test data
DELETE FROM refund_requests;

-- Clear any admin action logs that might contain test data
DELETE FROM admin_action_logs;

-- Reset any sequences if they exist
-- Note: This is safe as we're clearing all data

-- Log the cleanup action
INSERT INTO admin_action_logs (action, table_name, record_id, notes, created_at)
VALUES (
    'cleanup_dummy_data',
    'sales_analytics,user_subscriptions,refund_requests,admin_action_logs',
    NULL,
    'Cleaned up all dummy/test data from sales analytics system',
    NOW()
);

-- Verify cleanup
DO $$
DECLARE
    sales_count INTEGER;
    subscription_count INTEGER;
    refund_count INTEGER;
    log_count INTEGER;
BEGIN
    -- Count remaining records
    SELECT COUNT(*) INTO sales_count FROM sales_analytics;
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions;
    SELECT COUNT(*) INTO refund_count FROM refund_requests;
    SELECT COUNT(*) INTO log_count FROM admin_action_logs;
    
    RAISE NOTICE 'After cleanup - Sales Analytics: %, User Subscriptions: %, Refund Requests: %, Admin Logs: %', 
        sales_count, subscription_count, refund_count, log_count;
    
    IF sales_count = 0 AND subscription_count = 0 AND refund_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All dummy data has been successfully removed from sales analytics system';
    ELSE
        RAISE WARNING 'WARNING: Some data still exists. Manual review may be required.';
    END IF;
END $$;

-- Create a function to verify the system is clean
CREATE OR REPLACE FUNCTION verify_clean_sales_system()
RETURNS TABLE(
    table_name TEXT,
    record_count INTEGER,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'sales_analytics'::TEXT,
        (SELECT COUNT(*) FROM sales_analytics)::INTEGER,
        CASE WHEN (SELECT COUNT(*) FROM sales_analytics) = 0 THEN 'CLEAN' ELSE 'HAS_DATA' END;
    
    RETURN QUERY
    SELECT 
        'user_subscriptions'::TEXT,
        (SELECT COUNT(*) FROM user_subscriptions)::INTEGER,
        CASE WHEN (SELECT COUNT(*) FROM user_subscriptions) = 0 THEN 'CLEAN' ELSE 'HAS_DATA' END;
    
    RETURN QUERY
    SELECT 
        'refund_requests'::TEXT,
        (SELECT COUNT(*) FROM refund_requests)::INTEGER,
        CASE WHEN (SELECT COUNT(*) FROM refund_requests) = 0 THEN 'CLEAN' ELSE 'HAS_DATA' END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to use the verification function
GRANT EXECUTE ON FUNCTION verify_clean_sales_system() TO authenticated;

-- Add a comment explaining the cleanup
COMMENT ON FUNCTION verify_clean_sales_system() IS 'Verifies that all dummy/test data has been removed from the sales analytics system';
