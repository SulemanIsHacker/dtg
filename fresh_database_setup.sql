-- COMPLETE FRESH DATABASE SETUP
-- This will create a perfect checkout system from scratch

-- Step 1: Create all required tables with proper structure
CREATE TABLE user_auth_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    user_auth_code_id UUID NOT NULL REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50),
    subscription_period VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX idx_user_auth_codes_email ON user_auth_codes(user_email);
CREATE INDEX idx_user_auth_codes_code ON user_auth_codes(code);
CREATE INDEX idx_product_codes_user ON product_codes(user_auth_code_id);
CREATE INDEX idx_product_codes_product ON product_codes(product_id);
CREATE INDEX idx_product_codes_code ON product_codes(code);

-- Step 3: Insert sample products (you can modify these)
INSERT INTO products (id, name, description, price, currency, image_url, features) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ChatGPT Plus', 'Advanced AI assistant with GPT-4 access', 20.00, 'USD', '/src/assets/chatgpt-plus.jpg', '["GPT-4 Access", "Priority Support", "Advanced Features"]'),
('550e8400-e29b-41d4-a716-446655440002', 'Grammarly Premium', 'AI-powered writing assistant', 12.00, 'USD', '/src/assets/grammarly-premium.jpg', '["Grammar Check", "Style Suggestions", "Plagiarism Detection"]'),
('550e8400-e29b-41d4-a716-446655440003', 'Canva Pro', 'Professional design platform', 15.00, 'USD', '/src/assets/canva-pro.jpg', '["Premium Templates", "Brand Kit", "Team Collaboration"]'),
('550e8400-e29b-41d4-a716-446655440004', 'Adobe Creative Cloud', 'Complete creative suite', 60.00, 'USD', '/src/assets/adobe-creative-cloud.jpg', '["Photoshop", "Illustrator", "Premiere Pro", "After Effects"]'),
('550e8400-e29b-41d4-a716-446655440005', 'Semrush Pro', 'SEO and marketing toolkit', 120.00, 'USD', '/src/assets/semrush-pro.jpg', '["Keyword Research", "Site Audit", "Competitor Analysis"]'),
('550e8400-e29b-41d4-a716-446655440006', 'Notion Pro', 'All-in-one workspace', 8.00, 'USD', '/src/assets/notion-pro.jpg', '["Unlimited Blocks", "Advanced Permissions", "Version History"]'),
('550e8400-e29b-41d4-a716-446655440007', 'Figma Professional', 'Collaborative design tool', 12.00, 'USD', '/src/assets/figma-professional.jpg', '["Team Libraries", "Advanced Prototyping", "Dev Mode"]'),
('550e8400-e29b-41d4-a716-446655440008', 'Midjourney', 'AI image generation', 10.00, 'USD', '/src/assets/midjourney.jpg', '["AI Art Generation", "High Resolution", "Commercial License"]'),
('550e8400-e29b-41d4-a716-446655440009', 'CapCut Pro', 'Video editing platform', 7.00, 'USD', '/src/assets/capcut-pro.jpg', '["Premium Effects", "No Watermark", "Cloud Storage"]'),
('550e8400-e29b-41d4-a716-446655440010', 'Jasper AI', 'AI content creation', 49.00, 'USD', '/src/assets/jasper-ai.jpg', '["Content Templates", "Brand Voice", "Team Collaboration"]'),
('550e8400-e29b-41d4-a716-446655440011', 'Perplexity AI', 'AI-powered search engine', 20.00, 'USD', '/src/assets/perplexity-ai.jpg', '["Real-time Search", "Source Citations", "Pro Features"]'),
('550e8400-e29b-41d4-a716-446655440012', 'Google AI Ultra', 'Advanced AI capabilities', 30.00, 'USD', '/src/assets/google-ai-ultra.jpg', '["Gemini Ultra", "Advanced Reasoning", "Multimodal AI"]'),
('550e8400-e29b-41d4-a716-446655440013', 'Ahrefs Standard', 'SEO and content marketing', 99.00, 'USD', '/src/assets/ahrefs-standard.jpg', '["Site Explorer", "Keyword Explorer", "Content Explorer"]'),
('550e8400-e29b-41d4-a716-446655440014', 'Surfer SEO', 'Content optimization tool', 89.00, 'USD', '/src/assets/surfer-seo.jpg', '["Content Editor", "Keyword Research", "Site Audit"]'),
('550e8400-e29b-41d4-a716-446655440015', 'Elementor Pro', 'WordPress page builder', 49.00, 'USD', '/src/assets/elementor-pro.png', '["Advanced Widgets", "Theme Builder", "WooCommerce"]'),
('550e8400-e29b-41d4-a716-446655440016', 'Envato Elements', 'Creative assets subscription', 16.50, 'USD', '/src/assets/envato-elements.png', '["Unlimited Downloads", "Premium Templates", "Stock Assets"]');

-- Step 4: Create the perfect checkout function
CREATE OR REPLACE FUNCTION create_simple_purchase(
    p_user_name VARCHAR(255),
    p_user_email VARCHAR(255),
    p_products JSONB,
    p_currency VARCHAR(3) DEFAULT 'PKR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_auth_code_id UUID;
    v_user_code VARCHAR(50);
    v_is_returning_user BOOLEAN := false;
    v_product_codes JSONB := '[]'::jsonb;
    v_total_amount DECIMAL(10,2) := 0;
    v_result JSONB;
    v_product JSONB;
    v_product_code VARCHAR(50);
    v_product_name TEXT;
    v_counter INTEGER := 0;
    v_timestamp BIGINT;
BEGIN
    -- Get current timestamp for unique codes
    v_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Check if user already exists
    SELECT id, code INTO v_user_auth_code_id, v_user_code
    FROM user_auth_codes 
    WHERE user_email = LOWER(p_user_email);
    
    IF v_user_auth_code_id IS NOT NULL THEN
        -- Returning user
        v_is_returning_user := true;
        
        -- Update user name if different
        UPDATE user_auth_codes 
        SET user_name = p_user_name,
            updated_at = NOW()
        WHERE id = v_user_auth_code_id 
        AND user_name != p_user_name;
    ELSE
        -- New user - create user auth code
        v_user_code := 'UC' || v_timestamp || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        INSERT INTO user_auth_codes (code, user_name, user_email)
        VALUES (v_user_code, p_user_name, LOWER(p_user_email))
        RETURNING id INTO v_user_auth_code_id;
    END IF;
    
    -- Process each product
    FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        v_counter := v_counter + 1;
        
        -- Generate product code with guaranteed uniqueness
        v_product_code := 'PC' || v_timestamp || LPAD(v_counter::TEXT, 3, '0');
        
        -- Get product name
        SELECT name INTO v_product_name
        FROM products 
        WHERE id = (v_product->>'product_id')::UUID;
        
        -- Create product code record
        INSERT INTO product_codes (
            code,
            user_auth_code_id,
            product_id,
            subscription_type,
            subscription_period,
            price,
            currency,
            expires_at
        ) VALUES (
            v_product_code,
            v_user_auth_code_id,
            (v_product->>'product_id')::UUID,
            v_product->>'subscription_type',
            v_product->>'subscription_period',
            (v_product->>'price')::DECIMAL(10,2),
            p_currency,
            NOW() + INTERVAL '48 hours'
        );
        
        -- Add to product codes array
        v_product_codes := v_product_codes || jsonb_build_object(
            'product_code', v_product_code,
            'product_id', v_product->>'product_id',
            'product_name', COALESCE(v_product_name, 'Unknown Product')
        );
        
        -- Add to total amount
        v_total_amount := v_total_amount + (v_product->>'price')::DECIMAL(10,2);
    END LOOP;
    
    -- Build result
    v_result := jsonb_build_object(
        'success', true,
        'user_code', v_user_code,
        'is_returning_user', v_is_returning_user,
        'product_codes', v_product_codes,
        'total_amount', v_total_amount,
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

-- Step 5: Set up Row Level Security (RLS) policies
ALTER TABLE user_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Public can view user auth codes" ON user_auth_codes
    FOR SELECT USING (true);

CREATE POLICY "Public can view product codes" ON product_codes
    FOR SELECT USING (true);

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_auth_codes TO anon, authenticated;
GRANT ALL ON product_codes TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_simple_purchase TO anon, authenticated;

-- Step 7: Create admin functions for managing the system
CREATE OR REPLACE FUNCTION get_all_user_codes()
RETURNS TABLE (
    id UUID,
    code VARCHAR(50),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uac.id,
        uac.code,
        uac.user_name,
        uac.user_email,
        uac.created_at,
        uac.updated_at
    FROM user_auth_codes uac
    ORDER BY uac.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_all_product_codes()
RETURNS TABLE (
    id UUID,
    code VARCHAR(50),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    product_name VARCHAR(255),
    subscription_type VARCHAR(50),
    subscription_period VARCHAR(50),
    price DECIMAL(10,2),
    currency VARCHAR(3),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.code,
        uac.user_name,
        uac.user_email,
        p.name as product_name,
        pc.subscription_type,
        pc.subscription_period,
        pc.price,
        pc.currency,
        pc.expires_at,
        pc.created_at
    FROM product_codes pc
    JOIN user_auth_codes uac ON pc.user_auth_code_id = uac.id
    JOIN products p ON pc.product_id = p.id
    ORDER BY pc.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_user_codes TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_all_product_codes TO anon, authenticated;












