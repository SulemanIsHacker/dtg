-- Fix ambiguous column reference in delete_purchase_request_admin function
-- This migration fixes the "column reference 'user_auth_code_id' is ambiguous" error

-- Drop and recreate the function with proper table aliases
DROP FUNCTION IF EXISTS delete_purchase_request_admin(VARCHAR, TEXT);

-- Create function to delete entire purchase request (all product codes for a user)
CREATE OR REPLACE FUNCTION delete_purchase_request_admin(
    p_user_email VARCHAR(255),
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    user_auth_code_id UUID;
    deleted_codes_count INTEGER := 0;
    result JSONB;
    code_record RECORD;
BEGIN
    -- Get user auth code ID
    SELECT id INTO user_auth_code_id 
    FROM user_auth_codes 
    WHERE user_email = p_user_email AND is_active = true;
    
    IF user_auth_code_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_email', p_user_email
        );
    END IF;
    
    -- Count pending codes that will be deleted
    SELECT COUNT(*) INTO deleted_codes_count
    FROM product_codes pc
    WHERE pc.user_auth_code_id = user_auth_code_id 
    AND pc.status IN ('pending', 'rejected');
    
    -- Check if there are any approved codes (prevent deletion if any are approved)
    IF EXISTS (
        SELECT 1 FROM product_codes pc
        WHERE pc.user_auth_code_id = user_auth_code_id 
        AND pc.status = 'approved'
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot delete purchase request with approved product codes. Please handle approved codes separately.',
            'user_email', p_user_email
        );
    END IF;
    
    -- Delete all product codes for this user (cascade will handle related records)
    DELETE FROM product_codes pc
    WHERE pc.user_auth_code_id = user_auth_code_id;
    
    -- Build success result
    result := jsonb_build_object(
        'success', true,
        'message', 'Purchase request deleted successfully',
        'user_email', p_user_email,
        'deleted_codes_count', deleted_codes_count
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
GRANT EXECUTE ON FUNCTION delete_purchase_request_admin(VARCHAR, TEXT) TO authenticated;

