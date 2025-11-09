-- Add subscription debug function
-- This migration adds a function to help debug subscription status

CREATE OR REPLACE FUNCTION debug_subscription_status(
    p_user_email VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    auth_code_id UUID;
    subscription_data JSONB;
    product_code_data JSONB;
BEGIN
    -- Get user auth code
    SELECT id INTO auth_code_id
    FROM user_auth_codes 
    WHERE user_email = p_user_email
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF auth_code_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_email', p_user_email
        );
    END IF;
    
    -- Get subscription data
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'product_id', product_id,
            'status', status,
            'start_date', start_date,
            'expiry_date', expiry_date,
            'notes', notes,
            'created_at', created_at,
            'updated_at', updated_at
        )
    ) INTO subscription_data
    FROM user_subscriptions 
    WHERE user_auth_code_id = auth_code_id;
    
    -- Get product code data
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'product_code', product_code,
            'product_id', product_id,
            'status', status,
            'admin_notes', admin_notes,
            'approved_at', approved_at,
            'expires_at', expires_at,
            'created_at', created_at
        )
    ) INTO product_code_data
    FROM product_codes 
    WHERE user_auth_code_id = auth_code_id;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'user_email', p_user_email,
        'auth_code_id', auth_code_id,
        'subscriptions', COALESCE(subscription_data, '[]'::jsonb),
        'product_codes', COALESCE(product_code_data, '[]'::jsonb)
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM,
            'user_email', p_user_email
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION debug_subscription_status(VARCHAR) TO authenticated;
