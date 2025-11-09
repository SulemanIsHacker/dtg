-- Fix ambiguous column reference in create_purchase_with_codes function
CREATE OR REPLACE FUNCTION create_purchase_with_codes(
    p_user_name VARCHAR(255),
    p_user_email VARCHAR(255),
    p_products JSONB, -- Array of {product_id, subscription_type, subscription_period, price}
    p_currency VARCHAR(3) DEFAULT 'PKR'
)
RETURNS JSONB AS $$
DECLARE
    user_auth_code_id UUID;
    user_code VARCHAR(50);
    purchase_request_id UUID;
    product_item JSONB;
    product_code VARCHAR(50);
    product_code_id UUID;
    total_amount DECIMAL(10,2) := 0;
    is_returning BOOLEAN := false;
    result JSONB;
    product_codes_array JSONB := '[]'::JSONB;
    product_name TEXT;
BEGIN
    -- Check if user exists by email
    SELECT uac.id, uac.code INTO user_auth_code_id, user_code
    FROM user_auth_codes uac
    WHERE uac.user_email = p_user_email AND uac.is_active = true;
    
    IF user_auth_code_id IS NULL THEN
        -- New user: create user auth code
        user_code := generate_user_code();
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
    
    -- Create purchase request
    INSERT INTO purchase_requests (
        user_auth_code_id,
        user_name,
        user_email,
        is_returning_user,
        total_amount,
        currency
    ) VALUES (
        user_auth_code_id,
        p_user_name,
        p_user_email,
        is_returning,
        total_amount,
        p_currency
    ) RETURNING id INTO purchase_request_id;
    
    -- Create product codes for each product
    FOR product_item IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        -- Get product name and generate product code
        SELECT p.name INTO product_name FROM products p WHERE p.id = (product_item->>'product_id')::UUID;
        product_code := generate_product_code(product_name);
        
        -- Insert product code
        INSERT INTO product_codes (
            code,
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency
        ) VALUES (
            product_code,
            user_auth_code_id,
            (product_item->>'product_id')::UUID,
            product_item->>'subscription_type',
            product_item->>'subscription_period',
            (product_item->>'price')::DECIMAL(10,2),
            p_currency
        ) RETURNING id INTO product_code_id;
        
        -- Add to purchase request items
        INSERT INTO purchase_request_items (
            purchase_request_id,
            product_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price
        ) VALUES (
            purchase_request_id,
            product_code_id,
            (product_item->>'product_id')::UUID,
            product_item->>'subscription_type',
            product_item->>'subscription_period',
            (product_item->>'price')::DECIMAL(10,2)
        );
        
        -- Add to result array
        product_codes_array := product_codes_array || jsonb_build_object(
            'product_code', product_code,
            'product_id', product_item->>'product_id',
            'product_name', product_name
        );
    END LOOP;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'user_code', user_code,
        'is_returning_user', is_returning,
        'purchase_request_id', purchase_request_id,
        'product_codes', product_codes_array,
        'total_amount', total_amount,
        'currency', p_currency
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
