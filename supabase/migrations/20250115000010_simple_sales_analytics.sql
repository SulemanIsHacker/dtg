-- Create simplified sales analytics functions that are more robust

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_sales_analytics(DATE, DATE, VARCHAR);
DROP FUNCTION IF EXISTS get_product_sales_summary(DATE, DATE);
DROP FUNCTION IF EXISTS generate_daily_sales_analytics(DATE);

-- Simple function to get basic sales data
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
    product_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT 
            generate_series(
                start_date::timestamp,
                end_date::timestamp,
                CASE 
                    WHEN group_by_period = 'daily' THEN INTERVAL '1 day'
                    WHEN group_by_period = 'weekly' THEN INTERVAL '1 week'
                    WHEN group_by_period = 'monthly' THEN INTERVAL '1 month'
                    WHEN group_by_period = 'yearly' THEN INTERVAL '1 year'
                    ELSE INTERVAL '1 day'
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
                        'product_id', us.product_id,
                        'product_name', p.name,
                        'subscription_type', us.subscription_type,
                        'subscription_period', us.subscription_period,
                        'revenue', CASE 
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
                        END,
                        'subscriptions_sold', 1,
                        'active_count', CASE WHEN us.status = 'active' THEN 1 ELSE 0 END,
                        'expired_count', CASE WHEN us.status = 'expired' THEN 1 ELSE 0 END
                    )
                ) FILTER (WHERE us.id IS NOT NULL),
                '[]'::jsonb
            ) as product_breakdown
        FROM date_series ds
        LEFT JOIN user_subscriptions us ON DATE(us.created_at) = ds.period_date
        LEFT JOIN products p ON us.product_id = p.id
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
        ds.product_breakdown
    FROM daily_stats ds
    ORDER BY ds.period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple function to get product summary
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
                'subscription_type', ps.subscription_type,
                'subscription_period', ps.subscription_period,
                'revenue', ps.revenue,
                'subscriptions_sold', ps.subscriptions
            )
        ) as subscription_types
    FROM product_stats ps
    LEFT JOIN refund_stats rs ON ps.product_id = rs.product_id
    GROUP BY ps.product_id, ps.product_name, rs.total_refunds
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_sales_analytics(DATE, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_summary(DATE, DATE) TO authenticated;
