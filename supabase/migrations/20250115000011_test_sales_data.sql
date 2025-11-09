-- Test function to check if we have sales data
CREATE OR REPLACE FUNCTION test_sales_data()
RETURNS TABLE(
    total_subscriptions INTEGER,
    total_products INTEGER,
    date_range TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_subscriptions,
        COUNT(DISTINCT us.product_id)::INTEGER as total_products,
        CONCAT(
            MIN(DATE(us.created_at))::TEXT, 
            ' to ', 
            MAX(DATE(us.created_at))::TEXT
        ) as date_range
    FROM user_subscriptions us;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION test_sales_data() TO authenticated;
