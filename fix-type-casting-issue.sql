-- Fix type casting issue for sales analytics functions
-- Run this in Supabase SQL Editor

-- Drop existing functions
DROP FUNCTION IF EXISTS get_sales_analytics CASCADE;
DROP FUNCTION IF EXISTS get_product_sales_summary CASCADE;

-- Create get_sales_analytics function with proper type casting
CREATE OR REPLACE FUNCTION get_sales_analytics(
    p_start_date DATE,
    p_end_date DATE,
    p_group_by_period VARCHAR(10) DEFAULT 'daily'
)
RETURNS TABLE(
    period_start DATE,
    period_end DATE,
    total_revenue DECIMAL(10,2),
    total_subscriptions INTEGER,
    total_refunds DECIMAL(10,2),
    total_refund_count INTEGER,
    active_subscriptions INTEGER,
    expired_subscriptions INTEGER,
    subscription_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(us.created_at) as period_start,
        DATE(us.created_at) as period_end,
        COALESCE(SUM(
            CASE 
                WHEN us.custom_price IS NOT NULL THEN us.custom_price
                ELSE 
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
            END
        ), 0) as total_revenue,
        COUNT(us.id)::INTEGER as total_subscriptions,
        0::DECIMAL(10,2) as total_refunds,
        0::INTEGER as total_refund_count,
        COUNT(us.id) FILTER (WHERE us.status = 'active')::INTEGER as active_subscriptions,
        COUNT(us.id) FILTER (WHERE us.status = 'expired')::INTEGER as expired_subscriptions,
        '[]'::jsonb as subscription_types
    FROM user_subscriptions us
    WHERE DATE(us.created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(us.created_at)
    ORDER BY DATE(us.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_product_sales_summary function with proper type casting
CREATE OR REPLACE FUNCTION get_product_sales_summary(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    total_revenue DECIMAL(10,2),
    total_subscriptions INTEGER,
    total_refunds DECIMAL(10,2),
    net_revenue DECIMAL(10,2),
    active_subscriptions INTEGER,
    expired_subscriptions INTEGER,
    subscription_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.product_id,
        p.name as product_name,
        COALESCE(SUM(
            CASE 
                WHEN us.custom_price IS NOT NULL THEN us.custom_price
                ELSE 
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
            END
        ), 0) as total_revenue,
        COUNT(us.id)::INTEGER as total_subscriptions,
        0::DECIMAL(10,2) as total_refunds,
        COALESCE(SUM(
            CASE 
                WHEN us.custom_price IS NOT NULL THEN us.custom_price
                ELSE 
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
            END
        ), 0) as net_revenue,
        COUNT(us.id) FILTER (WHERE us.status = 'active')::INTEGER as active_subscriptions,
        COUNT(us.id) FILTER (WHERE us.status = 'expired')::INTEGER as expired_subscriptions,
        '[]'::jsonb as subscription_types
    FROM user_subscriptions us
    JOIN products p ON us.product_id = p.id
    WHERE DATE(us.created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY us.product_id, p.name
    ORDER BY SUM(
        CASE 
            WHEN us.custom_price IS NOT NULL THEN us.custom_price
            ELSE 
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
        END
    ) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_sales_analytics(DATE, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_summary(DATE, DATE) TO authenticated;

-- Success message
SELECT 'Functions created with proper type casting!' as status;
