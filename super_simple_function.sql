-- SUPER SIMPLE function that should definitely work
-- This is the most basic version possible

-- Drop all existing versions
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS create_simple_purchase(TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR(255), VARCHAR(255), VARCHAR(20), JSONB, VARCHAR(3));

-- Create the simplest possible function
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
    v_user_code TEXT;
    v_result JSONB;
BEGIN
    -- Generate a simple user code
    v_user_code := 'UC' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Try to insert user (ignore if exists)
    INSERT INTO user_auth_codes (code, user_name, user_email, phone_number)
    VALUES (v_user_code, p_user_name, LOWER(p_user_email), p_user_phone)
    ON CONFLICT (user_email) DO UPDATE SET
        phone_number = EXCLUDED.phone_number,
        updated_at = NOW();
    
    -- Return success result
    v_result := jsonb_build_object(
        'success', true,
        'user_code', v_user_code,
        'is_returning_user', false,
        'product_codes', '[]'::jsonb,
        'total_amount', 0,
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












