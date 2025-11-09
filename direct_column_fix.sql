-- DIRECT FIX: Add missing code column to product_codes table
-- This will fix the "column code does not exist" error

-- First, check if the product_codes table exists and add the code column if missing
DO $$
BEGIN
    -- Check if product_codes table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_codes') THEN
        -- Check if code column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'product_codes' AND column_name = 'code') THEN
            -- Add the code column
            ALTER TABLE product_codes ADD COLUMN code VARCHAR(50);
            -- Make it unique
            ALTER TABLE product_codes ADD CONSTRAINT product_codes_code_unique UNIQUE (code);
        END IF;
    ELSE
        -- Create the product_codes table if it doesn't exist
        CREATE TABLE product_codes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            user_auth_code_id UUID REFERENCES user_auth_codes(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE,
            subscription_type VARCHAR(20) DEFAULT 'shared' CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
            subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
            price DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
            admin_notes TEXT,
            approved_at TIMESTAMP WITH TIME ZONE,
            approved_by UUID REFERENCES auth.users(id),
            rejected_at TIMESTAMP WITH TIME ZONE,
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Ensure user_auth_codes table exists
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

-- Ensure products table exists
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    price TEXT NOT NULL,
    original_price TEXT NOT NULL,
    category TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 4.5,
    features TEXT[] DEFAULT '{}',
    main_image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Drop and recreate the function to ensure it works
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), VARCHAR(20), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, JSONB, TEXT);

-- Create the function
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
BEGIN
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
        v_user_code := 'UC' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        INSERT INTO user_auth_codes (code, user_name, user_email)
        VALUES (v_user_code, p_user_name, LOWER(p_user_email))
        RETURNING id INTO v_user_auth_code_id;
    END IF;
    
    -- Process each product
    FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        -- Generate product code (ensure it's never null)
        v_product_code := 'PC' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Ensure product code is not null
        IF v_product_code IS NULL THEN
            v_product_code := 'PC' || EXTRACT(EPOCH FROM NOW())::BIGINT || '0001';
        END IF;
        
        -- Get product name
        SELECT name INTO v_product_name
        FROM products 
        WHERE id = (v_product->>'product_id')::UUID;
        
        -- Debug: Log the values being inserted
        RAISE NOTICE 'Inserting product code: %, user_auth_code_id: %, product_id: %', 
            v_product_code, v_user_auth_code_id, (v_product->>'product_id')::UUID;
        
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
