-- Fix the sales analytics functions to properly handle custom_price in GROUP BY clauses

-- Drop and recreate the get_sales_analytics function with proper GROUP BY handling
DROP FUNCTION IF EXISTS get_sales_analytics(DATE, DATE, VARCHAR);

CREATE OR REPLACE FUNCTION get_sales_analytics(
    start_date DATE,
    end_date DATE,
    group_by_period VARCHAR(10) DEFAULT 'daily' -- 'daily', 'weekly', 'monthly', 'yearly'
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
DECLARE
    period_interval INTERVAL;
BEGIN
    -- Set period interval based on group_by_period
    CASE group_by_period
        WHEN 'daily' THEN period_interval := INTERVAL '1 day';
        WHEN 'weekly' THEN period_interval := INTERVAL '1 week';
        WHEN 'monthly' THEN period_interval := INTERVAL '1 month';
        WHEN 'yearly' THEN period_interval := INTERVAL '1 year';
        ELSE period_interval := INTERVAL '1 day';
    END CASE;

    RETURN QUERY
    WITH period_data AS (
        SELECT 
            generate_series(
                start_date::timestamp,
                end_date::timestamp,
                period_interval
            )::date as period_start,
            (generate_series(
                start_date::timestamp,
                end_date::timestamp,
                period_interval
            ) + period_interval - INTERVAL '1 day')::date as period_end
    ),
    subscription_data AS (
        SELECT 
            pd.period_start,
            pd.period_end,
            us.product_id,
            p.name as product_name,
            us.subscription_type,
            us.subscription_period,
            SUM(
                COALESCE(us.custom_price, 
                    CASE us.subscription_type
                        WHEN 'shared' THEN 5.0
                        WHEN 'semi_private' THEN 10.0
                        WHEN 'private' THEN 15.0
                    END * 
                    CASE us.subscription_period
                        WHEN '1_month' THEN 1.0
                        WHEN '3_months' THEN 2.5
                        WHEN '6_months' THEN 4.5
                        WHEN '1_year' THEN 8.0
                        WHEN '2_years' THEN 14.0
                        WHEN 'lifetime' THEN 25.0
                    END
                )
            ) as calculated_price,
            COUNT(*) as subscriptions_created,
            COUNT(*) FILTER (WHERE us.status = 'active') as active_count,
            COUNT(*) FILTER (WHERE us.status = 'expired') as expired_count
        FROM period_data pd
        LEFT JOIN user_subscriptions us ON DATE(us.created_at) BETWEEN pd.period_start AND pd.period_end
        LEFT JOIN products p ON us.product_id = p.id
        GROUP BY pd.period_start, pd.period_end, us.product_id, p.name, us.subscription_type, us.subscription_period
    ),
    refund_data AS (
        SELECT 
            pd.period_start,
            pd.period_end,
            us.product_id,
            p.name as product_name,
            COALESCE(SUM(srr.refund_amount), 0) as total_refunds,
            COUNT(srr.id) as refund_count
        FROM period_data pd
        LEFT JOIN subscription_refund_requests srr ON DATE(srr.created_at) BETWEEN pd.period_start AND pd.period_end
        LEFT JOIN user_subscriptions us ON srr.subscription_id = us.id
        LEFT JOIN products p ON us.product_id = p.id
        WHERE srr.status IN ('approved', 'completed')
        GROUP BY pd.period_start, pd.period_end, us.product_id, p.name
    ),
    aggregated_data AS (
        SELECT 
            pd.period_start,
            pd.period_end,
            COALESCE(SUM(sd.calculated_price), 0) as total_revenue,
            COALESCE(SUM(sd.subscriptions_created), 0) as total_subscriptions,
            COALESCE(SUM(rd.total_refunds), 0) as total_refunds,
            COALESCE(SUM(rd.refund_count), 0) as total_refund_count,
            COALESCE(SUM(sd.active_count), 0) as active_subscriptions,
            COALESCE(SUM(sd.expired_count), 0) as expired_subscriptions,
            jsonb_agg(
                jsonb_build_object(
                    'product_id', sd.product_id,
                    'product_name', sd.product_name,
                    'subscription_type', sd.subscription_type,
                    'subscription_period', sd.subscription_period,
                    'revenue', sd.calculated_price,
                    'subscriptions_sold', sd.subscriptions_created,
                    'active_count', sd.active_count,
                    'expired_count', sd.expired_count
                ) FILTER (WHERE sd.product_id IS NOT NULL)
            ) as product_breakdown
        FROM period_data pd
        LEFT JOIN subscription_data sd ON pd.period_start = sd.period_start
        LEFT JOIN refund_data rd ON pd.period_start = rd.period_start
        GROUP BY pd.period_start, pd.period_end
    )
    SELECT 
        ad.period_start,
        ad.period_end,
        ad.total_revenue,
        ad.total_subscriptions,
        ad.total_refunds,
        ad.total_refund_count,
        ad.active_subscriptions,
        ad.expired_subscriptions,
        COALESCE(ad.product_breakdown, '[]'::jsonb) as product_breakdown
    FROM aggregated_data ad
    ORDER BY ad.period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the get_product_sales_summary function
DROP FUNCTION IF EXISTS get_product_sales_summary(DATE, DATE);

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
    WITH product_data AS (
        SELECT 
            us.product_id,
            p.name as product_name,
            us.subscription_type,
            us.subscription_period,
            SUM(
                COALESCE(us.custom_price, 
                    CASE us.subscription_type
                        WHEN 'shared' THEN 5.0
                        WHEN 'semi_private' THEN 10.0
                        WHEN 'private' THEN 15.0
                    END * 
                    CASE us.subscription_period
                        WHEN '1_month' THEN 1.0
                        WHEN '3_months' THEN 2.5
                        WHEN '6_months' THEN 4.5
                        WHEN '1_year' THEN 8.0
                        WHEN '2_years' THEN 14.0
                        WHEN 'lifetime' THEN 25.0
                    END
                )
            ) as calculated_price,
            COUNT(*) as subscriptions_created,
            COUNT(*) FILTER (WHERE us.status = 'active') as active_count,
            COUNT(*) FILTER (WHERE us.status = 'expired') as expired_count
        FROM user_subscriptions us
        JOIN products p ON us.product_id = p.id
        WHERE DATE(us.created_at) BETWEEN start_date AND end_date
        GROUP BY us.product_id, p.name, us.subscription_type, us.subscription_period
    ),
    refund_data AS (
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
        pd.product_id,
        pd.product_name,
        SUM(pd.calculated_price) as total_revenue,
        SUM(pd.subscriptions_created) as total_subscriptions,
        COALESCE(rd.total_refunds, 0) as total_refunds,
        SUM(pd.calculated_price) - COALESCE(rd.total_refunds, 0) as net_revenue,
        SUM(pd.active_count) as active_subscriptions,
        SUM(pd.expired_count) as expired_subscriptions,
        jsonb_agg(
            jsonb_build_object(
                'subscription_type', pd.subscription_type,
                'subscription_period', pd.subscription_period,
                'revenue', pd.calculated_price,
                'subscriptions_sold', pd.subscriptions_created
            )
        ) as subscription_types
    FROM product_data pd
    LEFT JOIN refund_data rd ON pd.product_id = rd.product_id
    GROUP BY pd.product_id, pd.product_name, rd.total_refunds
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the generate_daily_sales_analytics function
DROP FUNCTION IF EXISTS generate_daily_sales_analytics(DATE);

CREATE OR REPLACE FUNCTION generate_daily_sales_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    subscription_type VARCHAR(20),
    subscription_period VARCHAR(20),
    revenue DECIMAL(10,2),
    subscriptions_sold INTEGER,
    refunds_issued DECIMAL(10,2),
    refunds_count INTEGER,
    active_subscriptions INTEGER,
    expired_subscriptions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_data AS (
        SELECT 
            us.product_id,
            p.name as product_name,
            us.subscription_type,
            us.subscription_period,
            SUM(
                COALESCE(us.custom_price, 
                    CASE us.subscription_type
                        WHEN 'shared' THEN 5.0
                        WHEN 'semi_private' THEN 10.0
                        WHEN 'private' THEN 15.0
                    END * 
                    CASE us.subscription_period
                        WHEN '1_month' THEN 1.0
                        WHEN '3_months' THEN 2.5
                        WHEN '6_months' THEN 4.5
                        WHEN '1_year' THEN 8.0
                        WHEN '2_years' THEN 14.0
                        WHEN 'lifetime' THEN 25.0
                    END
                )
            ) as calculated_price,
            COUNT(*) as subscriptions_created,
            COUNT(*) FILTER (WHERE us.status = 'active') as active_count,
            COUNT(*) FILTER (WHERE us.status = 'expired') as expired_count
        FROM user_subscriptions us
        JOIN products p ON us.product_id = p.id
        WHERE DATE(us.created_at) = target_date
        GROUP BY us.product_id, p.name, us.subscription_type, us.subscription_period
    ),
    refund_data AS (
        SELECT 
            us.product_id,
            us.subscription_type,
            us.subscription_period,
            COALESCE(SUM(srr.refund_amount), 0) as total_refunds,
            COUNT(srr.id) as refund_count
        FROM subscription_refund_requests srr
        JOIN user_subscriptions us ON srr.subscription_id = us.id
        WHERE DATE(srr.created_at) = target_date
        AND srr.status IN ('approved', 'completed')
        GROUP BY us.product_id, us.subscription_type, us.subscription_period
    )
    SELECT 
        dd.product_id,
        dd.product_name,
        dd.subscription_type,
        dd.subscription_period,
        dd.calculated_price as revenue,
        dd.subscriptions_created as subscriptions_sold,
        COALESCE(rd.total_refunds, 0) as refunds_issued,
        COALESCE(rd.refund_count, 0) as refunds_count,
        dd.active_count as active_subscriptions,
        dd.expired_count as expired_subscriptions
    FROM daily_data dd
    LEFT JOIN refund_data rd ON dd.product_id = rd.product_id 
        AND dd.subscription_type = rd.subscription_type 
        AND dd.subscription_period = rd.subscription_period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_sales_analytics(DATE, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_summary(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_daily_sales_analytics(DATE) TO authenticated;
