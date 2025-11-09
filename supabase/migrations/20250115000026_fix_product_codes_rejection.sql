-- Add rejected_at column to product_codes table
ALTER TABLE product_codes ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Drop existing functions if they exist to avoid return type conflicts
DROP FUNCTION IF EXISTS reject_simple_product_code(UUID, TEXT);
DROP FUNCTION IF EXISTS approve_simple_product_code(UUID, TEXT);

-- Create the reject_simple_product_code function
CREATE OR REPLACE FUNCTION reject_simple_product_code(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update product code status
    UPDATE product_codes 
    SET 
        status = 'rejected',
        admin_notes = p_admin_notes,
        rejected_at = NOW(),
        approved_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_product_code_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the approve_simple_product_code function
CREATE OR REPLACE FUNCTION approve_simple_product_code(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    pc product_codes%ROWTYPE;
    subscription_id UUID;
BEGIN
    -- Get product code details
    SELECT * INTO pc FROM product_codes WHERE id = p_product_code_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if already approved
    IF pc.status = 'approved' THEN
        RETURN true;
    END IF;
    
    -- Update product code status
    UPDATE product_codes 
    SET 
        status = 'approved',
        admin_notes = p_admin_notes,
        approved_at = NOW(),
        approved_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_product_code_id;
    
    -- Create subscription
    INSERT INTO user_subscriptions (
        user_auth_code_id,
        product_id,
        subscription_type,
        subscription_period,
        custom_price,
        currency,
        notes
    ) VALUES (
        pc.user_auth_code_id,
        pc.product_id,
        pc.subscription_type,
        pc.subscription_period,
        pc.price,
        pc.currency,
        COALESCE(p_admin_notes, 'Created from approved product code: ' || pc.code)
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
