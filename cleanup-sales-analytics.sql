-- Direct cleanup script for sales analytics dummy data
-- Run this script directly in your Supabase SQL editor or database client

-- Option 1: Complete cleanup (removes everything)
-- Uncomment the lines below if you want to remove ALL data including user subscriptions

/*
-- Complete cleanup - removes everything
DELETE FROM sales_analytics;
DELETE FROM user_subscriptions;
DELETE FROM refund_requests;
DELETE FROM admin_action_logs;
*/

-- Option 2: Selective cleanup (recommended - only removes sales analytics)
-- This preserves user subscriptions but clears analytics data

-- Clear sales analytics data
DELETE FROM sales_analytics;

-- Clear related admin logs
DELETE FROM admin_action_logs 
WHERE table_name = 'sales_analytics' 
   OR action LIKE '%sales%' 
   OR action LIKE '%analytics%';

-- Log the cleanup action
INSERT INTO admin_action_logs (action, table_name, record_id, notes, created_at)
VALUES (
    'cleanup_dummy_sales_data',
    'sales_analytics',
    NULL,
    'Removed all dummy/test data from sales analytics',
    NOW()
);

-- Verify cleanup
SELECT 
    'sales_analytics' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) = 0 THEN 'CLEAN' ELSE 'HAS_DATA' END as status
FROM sales_analytics

UNION ALL

SELECT 
    'user_subscriptions' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) = 0 THEN 'CLEAN' ELSE 'HAS_DATA' END as status
FROM user_subscriptions

UNION ALL

SELECT 
    'refund_requests' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) = 0 THEN 'CLEAN' ELSE 'HAS_DATA' END as status
FROM refund_requests;
