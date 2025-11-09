-- Debug function to check product codes in the database
CREATE OR REPLACE FUNCTION debug_product_codes()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    product_codes_count INTEGER;
    sample_codes JSONB;
BEGIN
    -- Get count of product codes
    SELECT COUNT(*) INTO product_codes_count FROM product_codes;
    
    -- Get sample product codes
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'product_code', product_code,
            'status', status,
            'created_at', created_at
        )
    ) INTO sample_codes
    FROM product_codes
    ORDER BY created_at DESC
    LIMIT 5;
    
    result := jsonb_build_object(
        'total_count', product_codes_count,
        'sample_codes', sample_codes,
        'table_exists', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a specific product code exists
CREATE OR REPLACE FUNCTION check_product_code_exists(p_product_code_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    pc RECORD;
BEGIN
    -- Try to find the product code
    SELECT * INTO pc FROM product_codes WHERE id = p_product_code_id;
    
    IF FOUND THEN
        result := jsonb_build_object(
            'exists', true,
            'id', pc.id,
            'product_code', pc.product_code,
            'status', pc.status,
            'user_auth_code_id', pc.user_auth_code_id,
            'product_id', pc.product_id,
            'created_at', pc.created_at
        );
    ELSE
        result := jsonb_build_object(
            'exists', false,
            'searched_id', p_product_code_id,
            'message', 'Product code not found'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION debug_product_codes() TO authenticated;
GRANT EXECUTE ON FUNCTION check_product_code_exists(UUID) TO authenticated;
