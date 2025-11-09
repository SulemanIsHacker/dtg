-- Simplified delete functions to avoid ambiguous column references
-- This migration creates simpler, more direct delete functions

-- Drop existing problematic functions
DROP FUNCTION IF EXISTS delete_purchase_request_admin(VARCHAR, TEXT);
DROP FUNCTION IF EXISTS delete_product_code_admin(UUID, TEXT);

-- Create simplified function to delete individual product code
CREATE OR REPLACE FUNCTION delete_product_code_admin(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pc product_codes%ROWTYPE;
    result JSONB;
BEGIN
    -- Get product code details
    SELECT * INTO pc FROM product_codes WHERE id = p_product_code_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Product code not found',
            'product_code_id', p_product_code_id
        );
    END IF;
    
    -- Check if already approved (prevent deletion of approved codes)
    IF pc.status = 'approved' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot delete an approved product code. Consider cancelling the subscription instead.',
            'product_code_id', p_product_code_id,
            'current_status', 'approved'
        );
    END IF;
    
    -- Delete the product code (cascade will handle related records)
    DELETE FROM product_codes WHERE id = p_product_code_id;
    
    -- Build success result
    result := jsonb_build_object(
        'success', true,
        'message', 'Product code deleted successfully',
        'product_code_id', p_product_code_id,
        'product_code', pc.code,
        'deleted_status', pc.status
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM,
            'product_code_id', p_product_code_id
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified function to delete only pending/rejected product codes for a user by email
CREATE OR REPLACE FUNCTION delete_user_product_codes_admin(
    p_user_email VARCHAR(255),
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    deleted_codes_count INTEGER := 0;
    approved_codes_count INTEGER := 0;
    pending_codes_count INTEGER := 0;
    rejected_codes_count INTEGER := 0;
    result JSONB;
BEGIN
    -- Count different types of codes for this user
    SELECT 
        COUNT(CASE WHEN pc.status = 'approved' THEN 1 END),
        COUNT(CASE WHEN pc.status = 'pending' THEN 1 END),
        COUNT(CASE WHEN pc.status = 'rejected' THEN 1 END)
    INTO approved_codes_count, pending_codes_count, rejected_codes_count
    FROM product_codes pc
    JOIN user_auth_codes uac ON pc.user_auth_code_id = uac.id
    WHERE uac.user_email = p_user_email;
    
    -- Count codes that will be deleted (pending and rejected only)
    deleted_codes_count := pending_codes_count + rejected_codes_count;
    
    -- If no pending or rejected codes to delete, return early
    IF deleted_codes_count = 0 THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'No pending or rejected codes to delete',
            'user_email', p_user_email,
            'deleted_codes_count', 0,
            'approved_codes_count', approved_codes_count,
            'pending_codes_count', pending_codes_count,
            'rejected_codes_count', rejected_codes_count
        );
    END IF;
    
    -- Delete only pending and rejected product codes for this user
    DELETE FROM product_codes 
    WHERE user_auth_code_id IN (
        SELECT id FROM user_auth_codes WHERE user_email = p_user_email AND is_active = true
    )
    AND status IN ('pending', 'rejected');
    
    -- Build success result with detailed information
    result := jsonb_build_object(
        'success', true,
        'message', 'Pending and rejected product codes deleted successfully',
        'user_email', p_user_email,
        'deleted_codes_count', deleted_codes_count,
        'approved_codes_count', approved_codes_count,
        'pending_codes_count', pending_codes_count,
        'rejected_codes_count', rejected_codes_count,
        'note', CASE 
            WHEN approved_codes_count > 0 THEN 'Approved codes were preserved'
            ELSE 'All codes deleted'
        END
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
GRANT EXECUTE ON FUNCTION delete_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_product_codes_admin(VARCHAR, TEXT) TO authenticated;
