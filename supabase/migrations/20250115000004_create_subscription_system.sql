-- Create user_auth_codes table for permanent authentication codes
CREATE TABLE IF NOT EXISTS user_auth_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL, -- Email is unique identifier
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table for tracking user product subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_auth_code_id UUID REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) DEFAULT 'shared' CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'cancelled')),
    subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    notes TEXT, -- Admin notes about this subscription
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_refund_requests table for subscription-specific refunds
CREATE TABLE IF NOT EXISTS subscription_refund_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_auth_code_id UUID REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    refund_amount DECIMAL(10,2),
    refund_method VARCHAR(50),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_code ON user_auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_email ON user_auth_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_active ON user_auth_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_auth_code ON user_subscriptions(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_product ON user_subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry ON user_subscriptions(expiry_date);

CREATE INDEX IF NOT EXISTS idx_subscription_refund_requests_subscription ON subscription_refund_requests(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_refund_requests_auth_code ON subscription_refund_requests(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_subscription_refund_requests_status ON subscription_refund_requests(status);

-- Create updated_at triggers
CREATE TRIGGER update_user_auth_codes_updated_at 
    BEFORE UPDATE ON user_auth_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_refund_requests_updated_at 
    BEFORE UPDATE ON subscription_refund_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_refund_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_auth_codes
CREATE POLICY "Admins can manage auth codes" ON user_auth_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage auth codes" ON user_auth_codes
    FOR ALL USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_auth_codes 
            WHERE user_auth_codes.id = user_subscriptions.user_auth_code_id
            AND user_auth_codes.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
    FOR ALL USING (true);

-- RLS Policies for subscription_refund_requests
CREATE POLICY "Users can view own refund requests" ON subscription_refund_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_auth_codes 
            WHERE user_auth_codes.id = subscription_refund_requests.user_auth_code_id
            AND user_auth_codes.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Users can create refund requests" ON subscription_refund_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_auth_codes 
            WHERE user_auth_codes.id = subscription_refund_requests.user_auth_code_id
            AND user_auth_codes.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins can manage all refund requests" ON subscription_refund_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage refund requests" ON subscription_refund_requests
    FOR ALL USING (true);


-- Function to set expiry date based on subscription period
CREATE OR REPLACE FUNCTION set_subscription_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set expiry date if it's not already set or if subscription period changed
    IF NEW.expiry_date IS NULL OR OLD.subscription_period IS DISTINCT FROM NEW.subscription_period THEN
        NEW.expiry_date = calculate_expiry_date(NEW.subscription_period, NEW.start_date);
    END IF;
    
    -- Update status based on expiry date
    IF NEW.expiry_date <= NOW() THEN
        NEW.status = 'expired';
    ELSIF NEW.expiry_date <= NOW() + INTERVAL '7 days' THEN
        NEW.status = 'expiring_soon';
    ELSE
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set expiry date and update status
CREATE TRIGGER set_subscription_expiry_date_trigger
    BEFORE INSERT OR UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_subscription_expiry_date();

-- Function to calculate expiry date based on subscription period
CREATE OR REPLACE FUNCTION calculate_expiry_date(
    p_subscription_period VARCHAR(20),
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    CASE p_subscription_period
        WHEN '1_month' THEN
            RETURN p_start_date + INTERVAL '1 month';
        WHEN '3_months' THEN
            RETURN p_start_date + INTERVAL '3 months';
        WHEN '6_months' THEN
            RETURN p_start_date + INTERVAL '6 months';
        WHEN '1_year' THEN
            RETURN p_start_date + INTERVAL '1 year';
        WHEN '2_years' THEN
            RETURN p_start_date + INTERVAL '2 years';
        WHEN 'lifetime' THEN
            RETURN p_start_date + INTERVAL '100 years'; -- Effectively lifetime
        ELSE
            RETURN p_start_date + INTERVAL '1 month'; -- Default to 1 month
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to create a subscription refund request
CREATE OR REPLACE FUNCTION create_subscription_refund_request(
    p_subscription_id UUID,
    p_user_auth_code_id UUID,
    p_reason VARCHAR(100),
    p_description TEXT
)
RETURNS UUID AS $$
DECLARE
    refund_request_id UUID;
BEGIN
    INSERT INTO subscription_refund_requests (
        subscription_id,
        user_auth_code_id,
        reason,
        description
    ) VALUES (
        p_subscription_id,
        p_user_auth_code_id,
        p_reason,
        p_description
    ) RETURNING id INTO refund_request_id;
    
    RETURN refund_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
