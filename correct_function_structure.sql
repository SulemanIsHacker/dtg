-- Fix the structure mismatch error
-- Function should return JSONB, not TABLE

-- Step 1: Drop ALL existing versions of the function
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), VARCHAR(20), JSONB, VARCHAR(3));

-- Step 2: Create the CORRECT function that returns JSONB
CREATE OR REPLACE FUNCTION create_simple_purchase(
    p_user_name TEXT,
    p_user_email TEXT,
    p_user_phone TEXT,
    p_products JSONB,
    p_currency TEXT DEFAULT 'PKR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_auth_code_id UUID;
    v_user_code TEXT;
    v_is_returning_user BOOLEAN := false;
    v_product_codes JSONB := '[]'::jsonb;
    v_total_amount DECIMAL(10,2) := 0;
    v_result JSONB;
    v_product JSONB;
    v_product_code TEXT;
    v_product_name TEXT;
BEGIN
    -- Check if user already exists
    SELECT id, code INTO v_user_auth_code_id, v_user_code
    FROM user_auth_codes 
    WHERE user_email = LOWER(p_user_email);
    
    IF v_user_auth_code_id IS NOT NULL THEN
        -- Returning user
        v_is_returning_user := true;
        
        -- Update phone number if provided
        UPDATE user_auth_codes 
        SET phone_number = p_user_phone,
            updated_at = NOW()
        WHERE id = v_user_auth_code_id;
    ELSE
        -- New user - create user auth code
        v_user_code := 'UC' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        INSERT INTO user_auth_codes (code, user_name, user_email, phone_number)
        VALUES (v_user_code, p_user_name, LOWER(p_user_email), p_user_phone)
        RETURNING id INTO v_user_auth_code_id;
    END IF;
    
    -- Process each product
    FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        -- Generate product code
        v_product_code := 'PC' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Get product name
        SELECT name INTO v_product_name
        FROM products 
        WHERE id = (v_product->>'product_id')::UUID;
        
        -- Add to total amount
        v_total_amount := v_total_amount + (v_product->>'price')::DECIMAL(10,2);
        
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
    END LOOP;
    
    -- Build result as JSONB object
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
            'error', SQLERRM
        );
END;
$$;












