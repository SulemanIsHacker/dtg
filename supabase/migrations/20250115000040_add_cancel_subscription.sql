-- Add cancel subscription functionality
-- This migration adds the ability to cancel approved subscriptions

-- Create function to cancel approved product code and its subscription
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
    EXCEPTION
        WHEN undefined_table THEN
            -- user_subscriptions table doesn't exist, skip subscription cancellation
            subscription_id := NULL;
    END;
    
    -- Build success result
    result := jsonb_build_object(
        'success', true,
        'message', 'Subscription cancelled successfully',
        'product_code_id', p_product_code_id,
        'product_code', code_value,
        'subscription_id', subscription_id,
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

-- Add 'cancelled' status to the product_codes table if it doesn't exist
-- First, let's check if we need to alter the table constraint
DO $$
BEGIN
    -- Check if 'cancelled' is already in the status constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%product_codes_status%' 
        AND check_clause LIKE '%cancelled%'
    ) THEN
        -- Drop the existing constraint and recreate it with 'cancelled' status
        ALTER TABLE product_codes DROP CONSTRAINT IF EXISTS product_codes_status_check;
        ALTER TABLE product_codes ADD CONSTRAINT product_codes_status_check 
            CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled'));
    END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cancel_approved_subscription_admin(UUID, TEXT) TO authenticated;
