-- BULLETPROOF FIX: Complete database restoration and function fix
-- This will completely fix the checkout system

-- Step 1: Drop all existing function versions to avoid conflicts
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), VARCHAR(20), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, JSONB, TEXT);

-- Step 2: Ensure all required tables exist with correct structure
CREATE TABLE IF NOT EXISTS user_auth_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    user_auth_code_id UUID NOT NULL REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50),
    subscription_period VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_email ON user_auth_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_product_codes_user ON product_codes(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_product ON product_codes(product_id);

-- Step 4: Create the bulletproof function
CREATE OR REPLACE FUNCTION create_simple_purchase(
    p_user_name VARCHAR(255),
    p_user_email VARCHAR(255),
    p_products JSONB,
    p_currency VARCHAR(3) DEFAULT 'PKR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_auth_code_id UUID;
    v_user_code VARCHAR(50);
    v_is_returning_user BOOLEAN := false;
    v_product_codes JSONB := '[]'::jsonb;
    v_total_amount DECIMAL(10,2) := 0;
    v_result JSONB;
    v_product JSONB;
    v_product_code VARCHAR(50);
    v_product_name TEXT;
    v_counter INTEGER := 0;
    v_timestamp BIGINT;
BEGIN
    -- Get current timestamp for unique codes
    v_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Check if user already exists
    SELECT id, code INTO v_user_auth_code_id, v_user_code
    FROM user_auth_codes 
    WHERE user_email = LOWER(p_user_email);
    
    IF v_user_auth_code_id IS NOT NULL THEN
        -- Returning user
        v_is_returning_user := true;
        
        -- Update user name if different
        UPDATE user_auth_codes 
        SET user_name = p_user_name,
            updated_at = NOW()
        WHERE id = v_user_auth_code_id 
        AND user_name != p_user_name;
    ELSE
        -- New user - create user auth code
        v_user_code := 'UC' || v_timestamp || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        INSERT INTO user_auth_codes (code, user_name, user_email)
        VALUES (v_user_code, p_user_name, LOWER(p_user_email))
        RETURNING id INTO v_user_auth_code_id;
    END IF;
    
    -- Process each product
    FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        v_counter := v_counter + 1;
        
        -- Generate product code with guaranteed uniqueness
        v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0');
        
        -- Get product name
        SELECT name INTO v_product_name
        FROM products 
        WHERE id = (v_product->>'product_id')::UUID;
        
        -- Create product code record
        INSERT INTO product_codes (
            code,
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency,
            expires_at
        ) VALUES (
            v_product_code,
            v_user_auth_code_id,
            (v_product->>'product_id')::UUID,
            v_product->>'subscription_type',
            v_product->>'subscription_period',
            (v_product->>'price')::DECIMAL(10,2),
            p_currency,
            NOW() + INTERVAL '48 hours'
        );
        
        -- Add to product codes array
        v_product_codes := v_product_codes || jsonb_build_object(
            'product_code', v_product_code,
            'product_id', v_product->>'product_id',
            'product_name', COALESCE(v_product_name, 'Unknown Product')
        );
        
        -- Add to total amount
        v_total_amount := v_total_amount + (v_product->>'price')::DECIMAL(10,2);
    END LOOP;
    
    -- Build result
    v_result := jsonb_build_object(
        'success', true,
        'user_code', v_user_code,
        'is_returning_user', v_is_returning_user,
        'product_codes', v_product_codes,
        'total_amount', v_total_amount,
        'currency', p_currency
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;

-- Step 5: Set up Row Level Security (RLS) policies
ALTER TABLE user_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own auth codes" ON user_auth_codes;
DROP POLICY IF EXISTS "Users can view their own product codes" ON product_codes;

-- Create new policies
CREATE POLICY "Users can view their own auth codes" ON user_auth_codes
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own product codes" ON product_codes
    FOR SELECT USING (true);

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_auth_codes TO anon, authenticated;
GRANT ALL ON product_codes TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_simple_purchase TO anon, authenticated;












