-- Final complete fix for the product code system
-- This migration ensures everything works correctly

-- Create user_auth_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_auth_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    user_auth_code_id UUID REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) DEFAULT 'shared' CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
    subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    admin_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_email ON user_auth_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_user_auth_codes_code ON user_auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_product_codes_user_auth ON product_codes(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_product ON product_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_status ON product_codes(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_user_auth_codes_updated_at ON user_auth_codes;
CREATE TRIGGER update_user_auth_codes_updated_at 
    BEFORE UPDATE ON user_auth_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_codes_updated_at ON product_codes;
CREATE TRIGGER update_product_codes_updated_at 
    BEFORE UPDATE ON product_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;

-- Create helper function to calculate expiry date
CREATE OR REPLACE FUNCTION calculate_expiry_date(
    p_subscription_period VARCHAR(20),
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    CASE p_subscription_period
        WHEN '1_month' THEN
            RETURN p_start_date + INTERVAL '1 month';
        WHEN '3_months' THEN
            RETURN p_start_date + INTERVAL '3 months';
        WHEN '6_months' THEN
            RETURN p_start_date + INTERVAL '6 months';
        WHEN '1_year' THEN
            RETURN p_start_date + INTERVAL '1 year';
        WHEN '2_years' THEN
            RETURN p_start_date + INTERVAL '2 years';
        WHEN 'lifetime' THEN
            RETURN p_start_date + INTERVAL '100 years';
        ELSE
            RETURN p_start_date + INTERVAL '1 month';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create robust product code generation function
CREATE OR REPLACE FUNCTION generate_product_code(p_product_name TEXT)
RETURNS VARCHAR(50) AS $$
DECLARE
    product_code VARCHAR(50);
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
    product_code := product_prefix || '-' || random_suffix;
    
    -- Ensure uniqueness with retry logic
    WHILE EXISTS (SELECT 1 FROM product_codes WHERE code = product_code) AND counter < 100 LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        product_code := product_prefix || '-' || random_suffix;
        counter := counter + 1;
    END LOOP;
    
    -- If still not unique after 100 tries, add timestamp
    IF EXISTS (SELECT 1 FROM product_codes WHERE code = product_code) THEN
        product_code := product_prefix || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
    END IF;
    
    RETURN product_code;
END;
$$ LANGUAGE plpgsql;

-- Create simplified purchase function
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
    new_product_code VARCHAR(50);
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
        new_product_code := generate_product_code(product_name);
        
        -- Insert product code
        INSERT INTO product_codes (
            code,
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency,
            status,
            expires_at
        ) VALUES (
            new_product_code,
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
            'product_code', new_product_code,
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

-- Create robust approval function
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
    -- Get product code details with explicit error handling
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
            COALESCE(p_admin_notes, 'Created from approved product code: ' || pc.code)
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
        'product_code', pc.code
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

-- Create robust rejection function
CREATE OR REPLACE FUNCTION reject_product_code_admin(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pc product_codes%ROWTYPE;
    result JSONB;
BEGIN
    -- Get product code details with explicit error handling
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
        'product_code', pc.code
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
GRANT EXECUTE ON FUNCTION calculate_expiry_date(VARCHAR, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_product_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_simple_purchase(VARCHAR, VARCHAR, JSONB, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_product_codes_admin(VARCHAR, TEXT) TO authenticated;
