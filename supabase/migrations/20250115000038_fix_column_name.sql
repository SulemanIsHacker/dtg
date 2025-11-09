-- Fix column name issue - use 'product_code' instead of 'code'
-- This migration corrects the column name mismatch

-- First, let's check what the actual table structure is and fix it
-- If the column is named 'product_code', we need to update our functions

-- Drop existing functions that reference the wrong column name
DROP FUNCTION IF EXISTS create_simple_purchase(VARCHAR, VARCHAR, JSONB, VARCHAR);
DROP FUNCTION IF EXISTS generate_product_code(TEXT);
DROP FUNCTION IF EXISTS approve_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS delete_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS delete_user_product_codes_admin(VARCHAR, TEXT);

-- Create product code generation function using correct column name
CREATE OR REPLACE FUNCTION generate_product_code(p_product_name TEXT)
RETURNS VARCHAR(50) AS $$
DECLARE
    generated_code VARCHAR(50);
    product_prefix VARCHAR(10);
    random_suffix VARCHAR(10);
    counter INTEGER := 0;
BEGIN
    -- Create a prefix from product name (first 4 characters, uppercase, alphanumeric only)
    product_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(p_product_name, '[^A-Z0-9]', '', 'g'), 1, 4));
    
    -- If prefix is too short, pad with 'P'
    IF LENGTH(product_prefix) < 2 THEN
        product_prefix := 'P' || product_prefix;
    END IF;
    
    -- Generate random 4-digit suffix
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    generated_code := product_prefix || '-' || random_suffix;
    
    -- Ensure uniqueness with retry logic - using correct column name
    WHILE EXISTS (SELECT 1 FROM product_codes pc WHERE pc.product_code = generated_code) AND counter < 100 LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        generated_code := product_prefix || '-' || random_suffix;
        counter := counter + 1;
    END LOOP;
    
    -- If still not unique after 100 tries, add timestamp
    IF EXISTS (SELECT 1 FROM product_codes pc WHERE pc.product_code = generated_code) THEN
        generated_code := product_prefix || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
    END IF;
    
    RETURN generated_code;
END;
$$ LANGUAGE plpgsql;

-- Create simplified purchase function using correct column name
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
    generated_product_code VARCHAR(50);
    product_code_id UUID;
    total_amount DECIMAL(10,2) := 0;
    is_returning BOOLEAN := false;
    result JSONB;
    product_codes_array JSONB := '[]'::JSONB;
    product_name TEXT;
    counter INTEGER := 0;
BEGIN
    -- Check if user exists by email
    SELECT id, code INTO user_auth_code_id, user_code
    FROM user_auth_codes 
    WHERE user_email = p_user_email AND is_active = true;
    
    IF user_auth_code_id IS NULL THEN
        -- New user: create user auth code
        user_code := 'U-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM user_auth_codes WHERE code = user_code) AND counter < 100 LOOP
            user_code := 'U-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
            counter := counter + 1;
        END LOOP;
        
        -- If still not unique after 100 tries, add timestamp
        IF EXISTS (SELECT 1 FROM user_auth_codes WHERE code = user_code) THEN
            user_code := 'U-' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
        END IF;
        
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
        
        -- Generate unique product code
        generated_product_code := generate_product_code(product_name);
        
        -- Insert product code using correct column name
        INSERT INTO product_codes (
            product_code,  -- Using 'product_code' instead of 'code'
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency,
            status,
            expires_at
        ) VALUES (
            generated_product_code,
            user_auth_code_id,
            (product_item->>'product_id')::UUID,
            product_item->>'subscription_type',
            product_item->>'subscription_period',
            (product_item->>'price')::DECIMAL(10,2),
            p_currency,
            'pending',
            calculate_expiry_date(product_item->>'subscription_period', NOW() + INTERVAL '30 days')
        ) RETURNING id INTO product_code_id;
        
        -- Add to result array
        product_codes_array := product_codes_array || jsonb_build_object(
            'product_code', generated_product_code,
            'product_code_id', product_code_id,
            'product_id', product_item->>'product_id',
            'product_name', product_name
        );
    END LOOP;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'user_code', user_code,
        'user_auth_code_id', user_auth_code_id,
        'is_returning_user', is_returning,
        'total_amount', total_amount,
        'currency', p_currency,
        'product_codes', product_codes_array
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create approval function using correct column name
CREATE OR REPLACE FUNCTION approve_product_code_admin(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pc product_codes%ROWTYPE;
    subscription_id UUID;
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
    
    -- Check if already approved
    IF pc.status = 'approved' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Product code already approved',
            'product_code_id', p_product_code_id,
            'status', 'already_approved'
        );
    END IF;
        
    -- Check if already rejected
    IF pc.status = 'rejected' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot approve a rejected product code',
            'product_code_id', p_product_code_id,
            'current_status', 'rejected'
        );
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
    
    -- Create user subscription record (if user_subscriptions table exists)
    BEGIN
        INSERT INTO user_subscriptions (
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            custom_price,
            currency,
            start_date,
            expiry_date,
            auto_renew,
            status,
            notes
        ) VALUES (
            pc.user_auth_code_id,
            pc.product_id,
            pc.subscription_type,
            pc.subscription_period,
            pc.price,
            pc.currency,
            NOW(),
            calculate_expiry_date(pc.subscription_period, NOW()),
            false,
            'active',
            COALESCE(p_admin_notes, 'Created from approved product code: ' || pc.product_code)
        ) RETURNING id INTO subscription_id;
    EXCEPTION
        WHEN undefined_table THEN
            -- user_subscriptions table doesn't exist, skip subscription creation
            subscription_id := NULL;
    END;
    
    -- Build success result
    result := jsonb_build_object(
        'success', true,
        'message', 'Product code approved successfully',
        'product_code_id', p_product_code_id,
        'subscription_id', subscription_id,
        'product_code', pc.product_code
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

-- Create rejection function using correct column name
CREATE OR REPLACE FUNCTION reject_product_code_admin(
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
    
    -- Check if already rejected
    IF pc.status = 'rejected' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Product code already rejected',
            'product_code_id', p_product_code_id,
            'status', 'already_rejected'
        );
    END IF;
        
    -- Check if already approved
    IF pc.status = 'approved' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot reject an approved product code. Consider cancelling the subscription instead.',
            'product_code_id', p_product_code_id,
            'current_status', 'approved'
        );
    END IF;
    
    -- Update product code status
    UPDATE product_codes 
    SET 
        status = 'rejected',
        admin_notes = p_admin_notes,
        rejected_at = NOW(),
        approved_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_product_code_id;
    
    -- Build success result
    result := jsonb_build_object(
        'success', true,
        'message', 'Product code rejected successfully',
        'product_code_id', p_product_code_id,
        'product_code', pc.product_code
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

-- Create delete individual product code function using correct column name
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
        'product_code', pc.product_code,
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

-- Create delete user product codes function using correct column name
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
GRANT EXECUTE ON FUNCTION generate_product_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_simple_purchase(VARCHAR, VARCHAR, JSONB, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_product_codes_admin(VARCHAR, TEXT) TO authenticated;
