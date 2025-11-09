-- Migration: Fix product_code column mismatch
-- This migration fixes the NOT NULL constraint violation by standardizing column names

-- Step 1: Check and fix column naming
DO $$
DECLARE
    has_code_column BOOLEAN := false;
    has_product_code_column BOOLEAN := false;
BEGIN
    -- Check if 'code' column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_codes' 
        AND column_name = 'code'
        AND table_schema = 'public'
    ) INTO has_code_column;
    
    -- Check if 'product_code' column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_codes' 
        AND column_name = 'product_code'
        AND table_schema = 'public'
    ) INTO has_product_code_column;
    
    -- Fix column naming based on what exists
    IF has_code_column AND NOT has_product_code_column THEN
        -- Migration case: 'code' exists, rename to 'product_code'
        ALTER TABLE product_codes RENAME COLUMN code TO product_code;
        ALTER TABLE product_codes ALTER COLUMN product_code SET NOT NULL;
        
    ELSIF has_product_code_column AND NOT has_code_column THEN
        -- Standard case: 'product_code' column exists, ensure it's NOT NULL
        ALTER TABLE product_codes ALTER COLUMN product_code SET NOT NULL;
        
    ELSIF has_code_column AND has_product_code_column THEN
        -- Both exist: drop code, keep product_code
        ALTER TABLE product_codes DROP COLUMN code;
        ALTER TABLE product_codes ALTER COLUMN product_code SET NOT NULL;
        
    ELSE
        -- Neither exists: add product_code column
        ALTER TABLE product_codes ADD COLUMN product_code VARCHAR(50) UNIQUE NOT NULL;
    END IF;
END $$;

-- Step 2: Drop existing function versions
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), VARCHAR(20), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, JSONB, TEXT);

-- Step 3: Create corrected function
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
    -- Generate timestamp for unique codes
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
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM user_auth_codes WHERE code = v_user_code) LOOP
            v_user_code := 'UC' || v_timestamp || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        END LOOP;
        
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
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM product_codes WHERE product_code = v_product_code) LOOP
            v_counter := v_counter + 1;
            v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0');
        END LOOP;
        
        -- Get product name
        SELECT name INTO v_product_name
        FROM products 
        WHERE id = (v_product->>'product_id')::UUID;
        
        -- Create product code record with CORRECT column name
        INSERT INTO product_codes (
            product_code,  -- ✅ CORRECT COLUMN NAME
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
