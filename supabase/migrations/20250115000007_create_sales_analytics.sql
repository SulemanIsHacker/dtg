-- Create sales_analytics table for tracking sales data
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

-- RLS Policies for sales_analytics
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

-- Create updated_at trigger
CREATE TRIGGER update_sales_analytics_updated_at 
    BEFORE UPDATE ON sales_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate daily sales analytics
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
        (dd.calculated_price * dd.subscriptions_created) as revenue,
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

-- Function to get sales analytics for date range
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
            COALESCE(SUM(sd.calculated_price * sd.subscriptions_created), 0) as total_revenue,
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
                    'revenue', sd.calculated_price * sd.subscriptions_created,
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

-- Function to get product-wise sales summary
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
        SUM(pd.calculated_price * pd.subscriptions_created) as total_revenue,
        SUM(pd.subscriptions_created) as total_subscriptions,
        COALESCE(rd.total_refunds, 0) as total_refunds,
        SUM(pd.calculated_price * pd.subscriptions_created) - COALESCE(rd.total_refunds, 0) as net_revenue,
        SUM(pd.active_count) as active_subscriptions,
        SUM(pd.expired_count) as expired_subscriptions,
        jsonb_agg(
            jsonb_build_object(
                'subscription_type', pd.subscription_type,
                'subscription_period', pd.subscription_period,
                'revenue', pd.calculated_price * pd.subscriptions_created,
                'subscriptions_sold', pd.subscriptions_created
            )
        ) as subscription_types
    FROM product_data pd
    LEFT JOIN refund_data rd ON pd.product_id = rd.product_id
    GROUP BY pd.product_id, pd.product_name, rd.total_refunds
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_daily_sales_analytics(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_analytics(DATE, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_summary(DATE, DATE) TO authenticated;
