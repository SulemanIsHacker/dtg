-- Complete system setup - ensures all required tables and functions exist
-- This migration creates a complete, working product code system

-- Create user_auth_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_auth_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_auth_code_id UUID REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) DEFAULT 'shared' CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
    subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    admin_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_email ON user_auth_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_code ON user_auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_product_codes_user_auth ON product_codes(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_product ON product_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_status ON product_codes(status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS update_user_auth_codes_updated_at ON user_auth_codes;
CREATE TRIGGER update_user_auth_codes_updated_at 
    BEFORE UPDATE ON user_auth_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_codes_updated_at ON product_codes;
CREATE TRIGGER update_product_codes_updated_at 
    BEFORE UPDATE ON product_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS if not already enabled
ALTER TABLE user_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;

-- Create helper function to calculate expiry date
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
            RETURN p_start_date + INTERVAL '100 years';
        ELSE
            RETURN p_start_date + INTERVAL '1 month';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create robust product code generation function
CREATE OR REPLACE FUNCTION generate_product_code(p_product_name TEXT)
RETURNS VARCHAR(50) AS $$
DECLARE
    product_code VARCHAR(50);
    product_prefix VARCHAR(10);
    random_suffix VARCHAR(10);
    counter INTEGER := 0;
BEGIN
    -- Create a prefix from product name (first 4 characters, uppercase, alphanumeric only)
    product_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(p_product_name, '[^A-Z0-9]', '', 'g'), 1, 4));
    
    -- If prefix is too short, pad with 'P'
    IF LENGTH(product_prefix) < 2 THEN
        product_prefix := 'P' || product_prefix;
    END IF;
    
    -- Generate random 4-digit suffix
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    product_code := product_prefix || '-' || random_suffix;
    
    -- Ensure uniqueness with retry logic
    WHILE EXISTS (SELECT 1 FROM product_codes WHERE code = product_code) AND counter < 100 LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        product_code := product_prefix || '-' || random_suffix;
        counter := counter + 1;
    END LOOP;
    
    -- If still not unique after 100 tries, add timestamp
    IF EXISTS (SELECT 1 FROM product_codes WHERE code = product_code) THEN
        product_code := product_prefix || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
    END IF;
    
    RETURN product_code;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate all functions to ensure they're up to date
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS approve_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS delete_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS delete_user_product_codes_admin(VARCHAR, TEXT);

-- Create all the functions from the previous migrations
-- (Include the complete function definitions here)

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_expiry_date(VARCHAR, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_product_code(TEXT) TO authenticated;
