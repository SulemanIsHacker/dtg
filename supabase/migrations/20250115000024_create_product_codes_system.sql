-- Create product_codes table for tracking individual product purchases
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
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'), -- Product codes expire after 48 hours if not approved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_requests table for tracking purchase attempts
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_auth_code_id UUID REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    is_returning_user BOOLEAN DEFAULT false,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    whatsapp_message_sent BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_request_items table for tracking individual products in a purchase
CREATE TABLE IF NOT EXISTS purchase_request_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
    product_code_id UUID REFERENCES product_codes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL,
    subscription_period VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_codes_user_auth ON product_codes(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_product ON product_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_codes_status ON product_codes(status);
CREATE INDEX IF NOT EXISTS idx_product_codes_expires_at ON product_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_user_auth ON purchase_requests(user_auth_code_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_email ON purchase_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);

CREATE INDEX IF NOT EXISTS idx_purchase_request_items_request ON purchase_request_items(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_items_product_code ON purchase_request_items(product_code_id);

-- Create updated_at triggers
CREATE TRIGGER update_product_codes_updated_at 
    BEFORE UPDATE ON product_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at 
    BEFORE UPDATE ON purchase_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_codes
CREATE POLICY "Users can view own product codes" ON product_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_auth_codes 
            WHERE user_auth_codes.id = product_codes.user_auth_code_id
            AND user_auth_codes.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins can manage all product codes" ON product_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage product codes" ON product_codes
    FOR ALL USING (true);

-- RLS Policies for purchase_requests
CREATE POLICY "Users can view own purchase requests" ON purchase_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_auth_codes 
            WHERE user_auth_codes.id = purchase_requests.user_auth_code_id
            AND user_auth_codes.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins can manage all purchase requests" ON purchase_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage purchase requests" ON purchase_requests
    FOR ALL USING (true);

-- RLS Policies for purchase_request_items
CREATE POLICY "Users can view own purchase request items" ON purchase_request_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM purchase_requests pr
            JOIN user_auth_codes uac ON pr.user_auth_code_id = uac.id
            WHERE pr.id = purchase_request_items.purchase_request_id
            AND uac.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Admins can manage all purchase request items" ON purchase_request_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage purchase request items" ON purchase_request_items
    FOR ALL USING (true);

-- Function to generate product code
CREATE OR REPLACE FUNCTION generate_product_code(product_name TEXT)
RETURNS VARCHAR(50) AS $$
DECLARE
    code VARCHAR(50);
    prefix VARCHAR(10);
    random_suffix VARCHAR(10);
BEGIN
    -- Generate prefix from product name (first 5 chars, uppercase, alphanumeric only)
    prefix := UPPER(REGEXP_REPLACE(SUBSTRING(product_name, 1, 5), '[^A-Z0-9]', '', 'g'));
    
    -- Ensure prefix is at least 3 characters
    IF LENGTH(prefix) < 3 THEN
        prefix := 'PROD';
    END IF;
    
    -- Generate random 4-digit suffix
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    code := 'P-' || prefix || '-' || random_suffix;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM product_codes WHERE product_codes.code = code) LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        code := 'P-' || prefix || '-' || random_suffix;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate user code
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    code VARCHAR(50);
    random_suffix VARCHAR(10);
BEGIN
    -- Generate random 4-digit suffix
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    code := 'U-' || random_suffix;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM user_auth_codes WHERE user_auth_codes.code = code) LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        code := 'U-' || random_suffix;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create purchase with product codes
CREATE OR REPLACE FUNCTION create_purchase_with_codes(
    p_user_name VARCHAR(255),
    p_user_email VARCHAR(255),
    p_products JSONB, -- Array of {product_id, subscription_type, subscription_period, price}
    p_currency VARCHAR(3) DEFAULT 'PKR'
)
RETURNS JSONB AS $$
DECLARE
    user_auth_code_id UUID;
    user_code VARCHAR(50);
    purchase_request_id UUID;
    product_item JSONB;
    product_code VARCHAR(50);
    product_code_id UUID;
    total_amount DECIMAL(10,2) := 0;
    is_returning BOOLEAN := false;
    result JSONB;
    product_codes_array JSONB := '[]'::JSONB;
    product_name TEXT;
BEGIN
    -- Check if user exists by email
    SELECT id, code INTO user_auth_code_id, user_code
    FROM user_auth_codes 
    WHERE user_email = p_user_email AND is_active = true;
    
    IF user_auth_code_id IS NULL THEN
        -- New user: create user auth code
        user_code := generate_user_code();
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
    
    -- Create purchase request
    INSERT INTO purchase_requests (
        user_auth_code_id,
        user_name,
        user_email,
        is_returning_user,
        total_amount,
        currency
    ) VALUES (
        user_auth_code_id,
        p_user_name,
        p_user_email,
        is_returning,
        total_amount,
        p_currency
    ) RETURNING id INTO purchase_request_id;
    
    -- Create product codes for each product
    FOR product_item IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        -- Get product name and generate product code
        SELECT name INTO product_name FROM products WHERE id = (product_item->>'product_id')::UUID;
        product_code := generate_product_code(product_name);
        
        -- Insert product code
        INSERT INTO product_codes (
            code,
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency
        ) VALUES (
            product_code,
            user_auth_code_id,
            (product_item->>'product_id')::UUID,
            product_item->>'subscription_type',
            product_item->>'subscription_period',
            (product_item->>'price')::DECIMAL(10,2),
            p_currency
        ) RETURNING id INTO product_code_id;
        
        -- Add to purchase request items
        INSERT INTO purchase_request_items (
            purchase_request_id,
            product_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price
        ) VALUES (
            purchase_request_id,
            product_code_id,
            (product_item->>'product_id')::UUID,
            product_item->>'subscription_type',
            product_item->>'subscription_period',
            (product_item->>'price')::DECIMAL(10,2)
        );
        
        -- Add to result array
        product_codes_array := product_codes_array || jsonb_build_object(
            'product_code', product_code,
            'product_id', product_item->>'product_id',
            'product_name', product_name
        );
    END LOOP;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'user_code', user_code,
        'is_returning_user', is_returning,
        'purchase_request_id', purchase_request_id,
        'product_codes', product_codes_array,
        'total_amount', total_amount,
        'currency', p_currency
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve product code and create subscription
CREATE OR REPLACE FUNCTION approve_product_code(
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

-- Function to reject product code
CREATE OR REPLACE FUNCTION reject_product_code(
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
        approved_at = NOW(),
        approved_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_product_code_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
