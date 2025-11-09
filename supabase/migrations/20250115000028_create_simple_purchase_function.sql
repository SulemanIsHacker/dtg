-- Create simple purchase function for checkout
-- This function creates user codes and product codes without purchase requests

CREATE OR REPLACE FUNCTION create_simple_purchase(
    p_user_name VARCHAR(255),
    p_user_email VARCHAR(255),
    p_products JSONB,
    p_currency VARCHAR(3) DEFAULT 'PKR'
)
RETURNS JSONB AS $$
DECLARE
    user_auth_code_id UUID;
    user_code VARCHAR(50);
    product_item JSONB;
    new_product_code VARCHAR(50);
    product_code_id UUID;
    total_amount DECIMAL(10,2) := 0;
    is_returning BOOLEAN := false;
    result JSONB;
    product_codes_array JSONB := '[]'::JSONB;
    product_name TEXT;
BEGIN
    -- Check if user exists by email
    SELECT id, code INTO user_auth_code_id, user_code
    FROM user_auth_codes 
    WHERE user_email = p_user_email AND is_active = true;
    
    IF user_auth_code_id IS NULL THEN
        -- New user: create user auth code
        user_code := 'U-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM user_auth_codes WHERE code = user_code) LOOP
            user_code := 'U-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        END LOOP;
        
        INSERT INTO user_auth_codes (code, user_name, user_email)
        VALUES (user_code, p_user_name, p_user_email)
        RETURNING id INTO user_auth_code_id;
        is_returning := false;
    ELSE
        -- Returning user: update name if different
        UPDATE user_auth_codes 
        SET user_name = p_user_name, updated_at = NOW()
        WHERE id = user_auth_code_id;
        is_returning := true;
    END IF;
    
    -- Calculate total amount
    FOR product_item IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        total_amount := total_amount + (product_item->>'price')::DECIMAL(10,2);
    END LOOP;
    
    -- Create product codes for each product
    FOR product_item IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        -- Get product name
        SELECT name INTO product_name FROM products WHERE id = (product_item->>'product_id')::UUID;
        
        -- Generate product code manually to avoid dependency issues
        new_product_code := 'P-' || UPPER(SUBSTRING(REGEXP_REPLACE(product_name, '[^A-Z0-9]', '', 'g'), 1, 4)) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Ensure uniqueness
        WHILE EXISTS (
            SELECT 1 FROM product_codes 
            WHERE product_codes.product_code = new_product_code
        ) LOOP
            new_product_code := 'P-' || UPPER(SUBSTRING(REGEXP_REPLACE(product_name, '[^A-Z0-9]', '', 'g'), 1, 4)) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        END LOOP;
        
        -- Insert product code
        INSERT INTO product_codes (
            product_code,
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency,
            status
        ) VALUES (
            new_product_code,
            user_auth_code_id,
            (product_item->>'product_id')::UUID,
            product_item->>'subscription_type',
            product_item->>'subscription_period',
            (product_item->>'price')::DECIMAL(10,2),
            p_currency,
            'pending'
        ) RETURNING id INTO product_code_id;
        
        -- Add to result array
        product_codes_array := product_codes_array || jsonb_build_object(
            'product_code', new_product_code,
            'product_id', product_item->>'product_id',
            'product_name', product_name
        );
    END LOOP;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'user_code', user_code,
        'user_name', p_user_name,
        'user_email', p_user_email,
        'is_returning_user', is_returning,
        'product_codes', product_codes_array,
        'total_amount', total_amount,
        'currency', p_currency
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_simple_purchase(VARCHAR, VARCHAR, JSONB, VARCHAR) TO authenticated;
