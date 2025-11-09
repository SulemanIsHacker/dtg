-- Function to populate sales analytics when a subscription is created
CREATE OR REPLACE FUNCTION populate_sales_analytics()
RETURNS TRIGGER AS $$
DECLARE
    calculated_price DECIMAL(10,2);
    analytics_date DATE;
BEGIN
    -- Calculate the price for this subscription
    calculated_price := COALESCE(NEW.custom_price, 
        CASE NEW.subscription_type
            WHEN 'shared' THEN 5.0
            WHEN 'semi_private' THEN 10.0
            WHEN 'private' THEN 15.0
            ELSE 5.0
        END * 
        CASE NEW.subscription_period
            WHEN '1_month' THEN 1.0
            WHEN '3_months' THEN 2.5
            WHEN '6_months' THEN 4.5
            WHEN '1_year' THEN 8.0
            WHEN '2_years' THEN 14.0
            WHEN 'lifetime' THEN 25.0
            ELSE 1.0
        END
    );
    
    analytics_date := DATE(NEW.created_at);
    
    -- Insert or update sales analytics for this date and product
    INSERT INTO sales_analytics (
        date,
        product_id,
        subscription_type,
        subscription_period,
        revenue,
        subscriptions_sold,
        active_subscriptions,
        expired_subscriptions
    ) VALUES (
        analytics_date,
        NEW.product_id,
        NEW.subscription_type,
        NEW.subscription_period,
        calculated_price,
        1,
        CASE WHEN NEW.status = 'active' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'expired' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date, product_id, subscription_type, subscription_period)
    DO UPDATE SET
        revenue = sales_analytics.revenue + calculated_price,
        subscriptions_sold = sales_analytics.subscriptions_sold + 1,
        active_subscriptions = sales_analytics.active_subscriptions + 
            CASE WHEN NEW.status = 'active' THEN 1 ELSE 0 END,
        expired_subscriptions = sales_analytics.expired_subscriptions + 
            CASE WHEN NEW.status = 'expired' THEN 1 ELSE 0 END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to populate sales analytics on subscription creation
CREATE TRIGGER populate_sales_analytics_trigger
    AFTER INSERT ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION populate_sales_analytics();

-- Function to update sales analytics when subscription status changes
CREATE OR REPLACE FUNCTION update_sales_analytics_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
    calculated_price DECIMAL(10,2);
    analytics_date DATE;
BEGIN
    -- Only proceed if status changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Calculate the price for this subscription
    calculated_price := COALESCE(NEW.custom_price, 
        CASE NEW.subscription_type
            WHEN 'shared' THEN 5.0
            WHEN 'semi_private' THEN 10.0
            WHEN 'private' THEN 15.0
            ELSE 5.0
        END * 
        CASE NEW.subscription_period
            WHEN '1_month' THEN 1.0
            WHEN '3_months' THEN 2.5
            WHEN '6_months' THEN 4.5
            WHEN '1_year' THEN 8.0
            WHEN '2_years' THEN 14.0
            WHEN 'lifetime' THEN 25.0
            ELSE 1.0
        END
    );
    
    analytics_date := DATE(NEW.created_at);
    
    -- Update the analytics record
    UPDATE sales_analytics SET
        active_subscriptions = active_subscriptions + 
            CASE 
                WHEN NEW.status = 'active' AND OLD.status != 'active' THEN 1
                WHEN NEW.status != 'active' AND OLD.status = 'active' THEN -1
                ELSE 0
            END,
        expired_subscriptions = expired_subscriptions + 
            CASE 
                WHEN NEW.status = 'expired' AND OLD.status != 'expired' THEN 1
                WHEN NEW.status != 'expired' AND OLD.status = 'expired' THEN -1
                ELSE 0
            END,
        updated_at = NOW()
    WHERE date = analytics_date 
    AND product_id = NEW.product_id 
    AND subscription_type = NEW.subscription_type 
    AND subscription_period = NEW.subscription_period;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update sales analytics on status change
CREATE TRIGGER update_sales_analytics_on_status_change_trigger
    AFTER UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_analytics_on_status_change();

-- Function to update sales analytics when refund is processed
CREATE OR REPLACE FUNCTION update_sales_analytics_on_refund()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    subscription_record RECORD;
BEGIN
    -- Only proceed if refund status changed to approved or completed
    IF OLD.status = NEW.status OR (NEW.status NOT IN ('approved', 'completed')) THEN
        RETURN NEW;
    END IF;
    
    -- Get the subscription details
    SELECT us.*, DATE(us.created_at) as created_date
    INTO subscription_record
    FROM user_subscriptions us
    WHERE us.id = NEW.subscription_id;
    
    analytics_date := subscription_record.created_date;
    
    -- Update the analytics record with refund information
    UPDATE sales_analytics SET
        refunds_issued = refunds_issued + COALESCE(NEW.refund_amount, 0),
        refunds_count = refunds_count + 1,
        updated_at = NOW()
    WHERE date = analytics_date 
    AND product_id = subscription_record.product_id 
    AND subscription_type = subscription_record.subscription_type 
    AND subscription_period = subscription_record.subscription_period;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update sales analytics on refund processing
CREATE TRIGGER update_sales_analytics_on_refund_trigger
    AFTER UPDATE ON subscription_refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_analytics_on_refund();

-- Function to backfill sales analytics for existing data
CREATE OR REPLACE FUNCTION backfill_sales_analytics()
RETURNS TABLE(
    processed_records INTEGER,
    created_analytics_records INTEGER
) AS $$
DECLARE
    subscription_record RECORD;
    calculated_price DECIMAL(10,2);
    analytics_date DATE;
    processed_count INTEGER := 0;
    created_count INTEGER := 0;
BEGIN
    -- Clear existing analytics data
    DELETE FROM sales_analytics;
    
    -- Process all existing subscriptions
    FOR subscription_record IN 
        SELECT 
            us.*,
            DATE(us.created_at) as created_date
        FROM user_subscriptions us
        ORDER BY us.created_at
    LOOP
        -- Calculate the price for this subscription
        calculated_price := COALESCE(subscription_record.custom_price, 
            CASE subscription_record.subscription_type
                WHEN 'shared' THEN 5.0
                WHEN 'semi_private' THEN 10.0
                WHEN 'private' THEN 15.0
                ELSE 5.0
            END * 
            CASE subscription_record.subscription_period
                WHEN '1_month' THEN 1.0
                WHEN '3_months' THEN 2.5
                WHEN '6_months' THEN 4.5
                WHEN '1_year' THEN 8.0
                WHEN '2_years' THEN 14.0
                WHEN 'lifetime' THEN 25.0
                ELSE 1.0
            END
        );
        
        analytics_date := subscription_record.created_date;
        
        -- Insert or update sales analytics
        INSERT INTO sales_analytics (
            date,
            product_id,
            subscription_type,
            subscription_period,
            revenue,
            subscriptions_sold,
            active_subscriptions,
            expired_subscriptions
        ) VALUES (
            analytics_date,
            subscription_record.product_id,
            subscription_record.subscription_type,
            subscription_record.subscription_period,
            calculated_price,
            1,
            CASE WHEN subscription_record.status = 'active' THEN 1 ELSE 0 END,
            CASE WHEN subscription_record.status = 'expired' THEN 1 ELSE 0 END
        )
        ON CONFLICT (date, product_id, subscription_type, subscription_period)
        DO UPDATE SET
            revenue = sales_analytics.revenue + calculated_price,
            subscriptions_sold = sales_analytics.subscriptions_sold + 1,
            active_subscriptions = sales_analytics.active_subscriptions + 
                CASE WHEN subscription_record.status = 'active' THEN 1 ELSE 0 END,
            expired_subscriptions = sales_analytics.expired_subscriptions + 
                CASE WHEN subscription_record.status = 'expired' THEN 1 ELSE 0 END,
            updated_at = NOW();
        
        processed_count := processed_count + 1;
        
        -- Count unique analytics records created
        IF NOT FOUND THEN
            created_count := created_count + 1;
        END IF;
    END LOOP;
    
    -- Process refunds
    FOR subscription_record IN 
        SELECT 
            srr.*,
            us.product_id,
            us.subscription_type,
            us.subscription_period,
            DATE(us.created_at) as created_date
        FROM subscription_refund_requests srr
        JOIN user_subscriptions us ON srr.subscription_id = us.id
        WHERE srr.status IN ('approved', 'completed')
    LOOP
        analytics_date := subscription_record.created_date;
        
        -- Update analytics with refund information
        UPDATE sales_analytics SET
            refunds_issued = refunds_issued + COALESCE(subscription_record.refund_amount, 0),
            refunds_count = refunds_count + 1,
            updated_at = NOW()
        WHERE date = analytics_date 
        AND product_id = subscription_record.product_id 
        AND subscription_type = subscription_record.subscription_type 
        AND subscription_period = subscription_record.subscription_period;
    END LOOP;
    
    RETURN QUERY SELECT processed_count, created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to prevent duplicate analytics records
ALTER TABLE sales_analytics 
ADD CONSTRAINT unique_analytics_record 
UNIQUE (date, product_id, subscription_type, subscription_period);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION backfill_sales_analytics() TO authenticated;
