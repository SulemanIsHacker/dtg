-- Create sales analytics functions directly
-- Run this in Supabase SQL Editor to create the missing functions

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_sales_analytics(DATE, DATE, VARCHAR);
DROP FUNCTION IF EXISTS get_product_sales_summary(DATE, DATE);

-- First, let's check if the functions already exist
SELECT 
    'Function Check' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_sales_analytics', 'get_product_sales_summary')
AND routine_schema = 'public';

-- Create the sales_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
    subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    subscriptions_sold INTEGER NOT NULL DEFAULT 0,
    refunds_issued DECIMAL(10,2) NOT NULL DEFAULT 0,
    refunds_count INTEGER NOT NULL DEFAULT 0,
    active_subscriptions INTEGER NOT NULL DEFAULT 0,
    expired_subscriptions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date ON sales_analytics(date);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_product ON sales_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date_product ON sales_analytics(date, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_subscription_type ON sales_analytics(subscription_type);

-- Enable RLS
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for sales_analytics
DROP POLICY IF EXISTS "Admins can manage sales analytics" ON sales_analytics;
DROP POLICY IF EXISTS "Service role can manage sales analytics" ON sales_analytics;

CREATE POLICY "Admins can manage sales analytics" ON sales_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage sales analytics" ON sales_analytics
    FOR ALL USING (true);

-- Create the get_sales_analytics function
CREATE OR REPLACE FUNCTION get_sales_analytics(
    start_date DATE,
    end_date DATE,
    group_by_period VARCHAR(10) DEFAULT 'daily'
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
    WITH date_series AS (
        SELECT 
            generate_series(
                start_date::timestamp,
                end_date::timestamp,
                CASE group_by_period
                    WHEN 'daily' THEN '1 day'::interval
                    WHEN 'weekly' THEN '1 week'::interval
                    WHEN 'monthly' THEN '1 month'::interval
                    WHEN 'yearly' THEN '1 year'::interval
                    ELSE '1 day'::interval
                END
            )::date as period_date
    ),
    daily_stats AS (
        SELECT 
            ds.period_date as period_start,
            ds.period_date as period_end,
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
            COUNT(us.id) as total_subscriptions,
            0::DECIMAL(10,2) as total_refunds,
            0 as total_refund_count,
            COUNT(us.id) FILTER (WHERE us.status = 'active') as active_subscriptions,
            COUNT(us.id) FILTER (WHERE us.status = 'expired') as expired_subscriptions,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'type', us.subscription_type,
                        'period', us.subscription_period,
                        'count', 1
                    )
                ) FILTER (WHERE us.id IS NOT NULL),
                '[]'::jsonb
            ) as subscription_types
        FROM date_series ds
        LEFT JOIN user_subscriptions us ON DATE(us.created_at) = ds.period_date
        GROUP BY ds.period_date
    )
    SELECT 
        ds.period_start,
        ds.period_end,
        ds.total_revenue,
        ds.total_subscriptions,
        ds.total_refunds,
        ds.total_refund_count,
        ds.active_subscriptions,
        ds.expired_subscriptions,
        ds.subscription_types
    FROM daily_stats ds
    ORDER BY ds.period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_product_sales_summary function
CREATE OR REPLACE FUNCTION get_product_sales_summary(
    start_date DATE,
    end_date DATE
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
    WITH product_stats AS (
        SELECT 
            us.product_id,
            p.name as product_name,
            us.subscription_type,
            us.subscription_period,
            SUM(
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
            ) as revenue,
            COUNT(*) as subscriptions,
            COUNT(*) FILTER (WHERE us.status = 'active') as active_count,
            COUNT(*) FILTER (WHERE us.status = 'expired') as expired_count
        FROM user_subscriptions us
        JOIN products p ON us.product_id = p.id
        WHERE DATE(us.created_at) BETWEEN start_date AND end_date
        GROUP BY us.product_id, p.name, us.subscription_type, us.subscription_period
    ),
    refund_stats AS (
        SELECT 
            us.product_id,
            COALESCE(SUM(srr.refund_amount), 0) as total_refunds
        FROM subscription_refund_requests srr
        JOIN user_subscriptions us ON srr.subscription_id = us.id
        WHERE DATE(srr.created_at) BETWEEN start_date AND end_date
        AND srr.status IN ('approved', 'completed')
        GROUP BY us.product_id
    )
    SELECT 
        ps.product_id,
        ps.product_name,
        SUM(ps.revenue) as total_revenue,
        SUM(ps.subscriptions) as total_subscriptions,
        COALESCE(rs.total_refunds, 0) as total_refunds,
        SUM(ps.revenue) - COALESCE(rs.total_refunds, 0) as net_revenue,
        SUM(ps.active_count) as active_subscriptions,
        SUM(ps.expired_count) as expired_subscriptions,
        jsonb_agg(
            jsonb_build_object(
                'type', ps.subscription_type,
                'period', ps.subscription_period,
                'revenue', ps.revenue,
                'subscriptions', ps.subscriptions
            )
        ) as subscription_types
    FROM product_stats ps
    LEFT JOIN refund_stats rs ON ps.product_id = rs.product_id
    GROUP BY ps.product_id, ps.product_name, rs.total_refunds
    ORDER BY SUM(ps.revenue) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_sales_analytics(DATE, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_summary(DATE, DATE) TO authenticated;

-- Test the functions
SELECT 'Functions created successfully' as status;

-- Test get_sales_analytics
SELECT 
    'get_sales_analytics test' as test,
    COUNT(*) as record_count
FROM get_sales_analytics(
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    CURRENT_DATE::DATE,
    'daily'
);

-- Test get_product_sales_summary
SELECT 
    'get_product_sales_summary test' as test,
    COUNT(*) as record_count
FROM get_product_sales_summary(
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    CURRENT_DATE::DATE
);
