-- Improve cancel subscription functionality
-- This migration improves the cancel subscription function to better handle user_subscriptions updates

-- Drop and recreate the cancel function with better error handling
DROP FUNCTION IF EXISTS cancel_approved_subscription_admin(UUID, TEXT);

CREATE OR REPLACE FUNCTION cancel_approved_subscription_admin(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pc product_codes%ROWTYPE;
    subscription_id UUID;
    result JSONB;
    code_value VARCHAR(50);
    subscription_count INTEGER;
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
    
    -- Extract the product code value to avoid ambiguity
    code_value := pc.product_code;
    
    -- Check if the code is approved (only approved codes can be cancelled)
    IF pc.status != 'approved' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only approved product codes can be cancelled',
            'product_code_id', p_product_code_id,
            'current_status', pc.status
        );
    END IF;
    
    -- Update product code status to cancelled
    UPDATE product_codes 
    SET 
        status = 'cancelled',
        admin_notes = COALESCE(p_admin_notes, 'Subscription cancelled by admin'),
        updated_at = NOW()
    WHERE id = p_product_code_id;
    
    -- Cancel the associated subscription (if user_subscriptions table exists)
    BEGIN
        -- Count how many subscriptions exist for this user and product
        SELECT COUNT(*) INTO subscription_count
        FROM user_subscriptions 
        WHERE user_auth_code_id = pc.user_auth_code_id 
        AND product_id = pc.product_id;
        
        -- Find and cancel the subscription
        SELECT id INTO subscription_id
        FROM user_subscriptions 
        WHERE user_auth_code_id = pc.user_auth_code_id 
        AND product_id = pc.product_id 
        AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF subscription_id IS NOT NULL THEN
            UPDATE user_subscriptions 
            SET 
                status = 'cancelled',
                notes = COALESCE(notes, '') || ' | Cancelled by admin: ' || COALESCE(p_admin_notes, 'No reason provided'),
                updated_at = NOW()
            WHERE id = subscription_id;
        END IF;
        
        -- If no active subscription found, try to update any subscription for this user/product
        IF subscription_id IS NULL AND subscription_count > 0 THEN
            SELECT id INTO subscription_id
            FROM user_subscriptions 
            WHERE user_auth_code_id = pc.user_auth_code_id 
            AND product_id = pc.product_id 
            ORDER BY created_at DESC
            LIMIT 1;
            
            IF subscription_id IS NOT NULL THEN
                UPDATE user_subscriptions 
                SET 
                    status = 'cancelled',
                    notes = COALESCE(notes, '') || ' | Cancelled by admin: ' || COALESCE(p_admin_notes, 'No reason provided'),
                    updated_at = NOW()
                WHERE id = subscription_id;
            END IF;
        END IF;
        
    EXCEPTION
        WHEN undefined_table THEN
            -- user_subscriptions table doesn't exist, skip subscription cancellation
            subscription_id := NULL;
            subscription_count := 0;
        WHEN OTHERS THEN
            -- Log the error but don't fail the entire operation
            RAISE WARNING 'Error updating user_subscriptions: %', SQLERRM;
            subscription_id := NULL;
    END;
    
    -- Build success result
    result := jsonb_build_object(
        'success', true,
        'message', 'Subscription cancelled successfully',
        'product_code_id', p_product_code_id,
        'product_code', code_value,
        'subscription_id', subscription_id,
        'subscription_count', COALESCE(subscription_count, 0),
        'previous_status', 'approved',
        'new_status', 'cancelled'
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cancel_approved_subscription_admin(UUID, TEXT) TO authenticated;
