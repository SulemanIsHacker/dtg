-- Apply the robust product_code fix
-- This migration ensures the create_simple_purchase function uses product_code correctly

-- Drop all existing function versions
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), VARCHAR(20), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), JSONB, VARCHAR(3));
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, JSONB, TEXT);

-- Create the corrected function
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
    v_random_suffix INTEGER;
BEGIN
    -- Generate timestamp for unique codes
    v_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Validate input
    IF p_products IS NULL OR jsonb_array_length(p_products) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No products provided',
            'sqlstate', 'P0001'
        );
    END IF;
    
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
        
        -- Generate product code with multiple fallback methods
        v_random_suffix := FLOOR(RANDOM() * 10000)::INTEGER;
        v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0') || LPAD(v_random_suffix::TEXT, 4, '0');
        
        -- Ensure product_code is never NULL
        IF v_product_code IS NULL OR v_product_code = '' THEN
            v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0') || '0001';
        END IF;
        
        -- Ensure uniqueness using CORRECT column name
        WHILE EXISTS (SELECT 1 FROM product_codes WHERE product_code = v_product_code) LOOP
            v_counter := v_counter + 1;
            v_random_suffix := FLOOR(RANDOM() * 10000)::INTEGER;
            v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0') || LPAD(v_random_suffix::TEXT, 4, '0');
            
            -- Final fallback if still NULL
            IF v_product_code IS NULL OR v_product_code = '' THEN
                v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0') || '9999';
            END IF;
        END LOOP;
        
        -- Get product name
        SELECT name INTO v_product_name
        FROM products 
        WHERE id = (v_product->>'product_id')::UUID;
        
        -- Final validation before insert
        IF v_product_code IS NULL OR v_product_code = '' THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to generate product code for product ' || v_counter,
                'sqlstate', 'P0002'
            );
        END IF;
        
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
            COALESCE(v_product->>'subscription_type', 'shared'),
            v_product->>'subscription_period',
            (v_product->>'price')::DECIMAL(10,2),
            COALESCE(p_currency, 'PKR'),
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
