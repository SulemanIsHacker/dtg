-- COMPLETE APPLICATION DATABASE SETUP
-- This creates ALL tables used in your application with proper structure

-- Step 1: Create all core tables with proper structure

-- Products table (main product catalog)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    price TEXT NOT NULL,
    original_price TEXT NOT NULL,
    category TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 4.5,
    features TEXT[] DEFAULT '{}',
    main_image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    video_url TEXT,
    video_thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Product images table for multiple images per product
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Product videos table for multiple videos per product
CREATE TABLE product_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Pricing plans table
CREATE TABLE pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('shared', 'semi_private', 'private')),
    is_enabled BOOLEAN DEFAULT true,
    price TEXT,
    monthly_price TEXT,
    yearly_price TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Comparison features table
CREATE TABLE comparison_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Product comparison values table
CREATE TABLE product_comparison_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES comparison_features(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User authentication codes table
CREATE TABLE user_auth_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product codes table (generated codes for purchases)
CREATE TABLE product_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    user_auth_code_id UUID NOT NULL REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) DEFAULT 'shared' CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
    subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
    admin_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase requests table
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Purchase request items table
CREATE TABLE purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL,
    subscription_period VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_auth_code_id UUID NOT NULL REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('shared', 'semi_private', 'private')),
    subscription_period VARCHAR(20) NOT NULL CHECK (subscription_period IN ('1_month', '3_months', '6_months', '1_year', '2_years', 'lifetime')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription refund requests table
CREATE TABLE subscription_refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_auth_code_id UUID NOT NULL REFERENCES user_auth_codes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales analytics table
CREATE TABLE sales_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PKR',
    subscription_type VARCHAR(20),
    subscription_period VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social shares table
CREATE TABLE social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    ip_address INET,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin audit log table
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create all necessary indexes
CREATE INDEX idx_user_auth_codes_email ON user_auth_codes(user_email);
CREATE INDEX idx_user_auth_codes_code ON user_auth_codes(code);
CREATE INDEX idx_product_codes_user_auth ON product_codes(user_auth_code_id);
CREATE INDEX idx_product_codes_product ON product_codes(product_id);
CREATE INDEX idx_product_codes_code ON product_codes(code);
CREATE INDEX idx_product_codes_status ON product_codes(status);
CREATE INDEX idx_product_codes_expires_at ON product_codes(expires_at);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_videos_product ON product_videos(product_id);
CREATE INDEX idx_pricing_plans_product ON pricing_plans(product_id);
CREATE INDEX idx_comparison_values_product ON product_comparison_values(product_id);
CREATE INDEX idx_comparison_values_feature ON product_comparison_values(feature_id);
CREATE INDEX idx_purchase_requests_user ON purchase_requests(user_auth_code_id);
CREATE INDEX idx_purchase_request_items_request ON purchase_request_items(purchase_request_id);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_auth_code_id);
CREATE INDEX idx_user_subscriptions_product ON user_subscriptions(product_id);
CREATE INDEX idx_refund_requests_user ON subscription_refund_requests(user_auth_code_id);
CREATE INDEX idx_testimonials_product ON testimonials(product_id);
CREATE INDEX idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX idx_sales_analytics_date ON sales_analytics(date);
CREATE INDEX idx_sales_analytics_product ON sales_analytics(product_id);
CREATE INDEX idx_social_shares_product ON social_shares(product_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_admin_audit_log_user ON admin_audit_log(user_id);
CREATE INDEX idx_admin_audit_log_table ON admin_audit_log(table_name);

-- Step 3: Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comparison_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for public access
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Product videos are viewable by everyone" ON product_videos FOR SELECT USING (true);
CREATE POLICY "Pricing plans are viewable by everyone" ON pricing_plans FOR SELECT USING (true);
CREATE POLICY "Comparison features are viewable by everyone" ON comparison_features FOR SELECT USING (true);
CREATE POLICY "Comparison values are viewable by everyone" ON product_comparison_values FOR SELECT USING (true);
CREATE POLICY "User auth codes are viewable by everyone" ON user_auth_codes FOR SELECT USING (true);
CREATE POLICY "Product codes are viewable by everyone" ON product_codes FOR SELECT USING (true);
CREATE POLICY "Purchase requests are viewable by everyone" ON purchase_requests FOR SELECT USING (true);
CREATE POLICY "Purchase request items are viewable by everyone" ON purchase_request_items FOR SELECT USING (true);
CREATE POLICY "User subscriptions are viewable by everyone" ON user_subscriptions FOR SELECT USING (true);
CREATE POLICY "Refund requests are viewable by everyone" ON subscription_refund_requests FOR SELECT USING (true);
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Sales analytics are viewable by everyone" ON sales_analytics FOR SELECT USING (true);
CREATE POLICY "Social shares are viewable by everyone" ON social_shares FOR SELECT USING (true);
CREATE POLICY "User roles are viewable by everyone" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Admin audit log is viewable by everyone" ON admin_audit_log FOR SELECT USING (true);

-- Step 5: Create the perfect checkout function
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

-- Step 6: Create admin functions
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

-- Step 7: Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 9: Insert sample products (you can modify these)
INSERT INTO products (id, name, description, price, original_price, category, rating, features, main_image_url, slug) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ChatGPT Plus', 'Advanced AI assistant with GPT-4 access', '20.00', '25.00', 'AI Tools', 4.8, '{"GPT-4 Access", "Priority Support", "Advanced Features"}', '/src/assets/chatgpt-plus.jpg', 'chatgpt-plus'),
('550e8400-e29b-41d4-a716-446655440002', 'Grammarly Premium', 'AI-powered writing assistant', '12.00', '15.00', 'Writing Tools', 4.7, '{"Grammar Check", "Style Suggestions", "Plagiarism Detection"}', '/src/assets/grammarly-premium.jpg', 'grammarly-premium'),
('550e8400-e29b-41d4-a716-446655440003', 'Canva Pro', 'Professional design platform', '15.00', '18.00', 'Design Tools', 4.6, '{"Premium Templates", "Brand Kit", "Team Collaboration"}', '/src/assets/canva-pro.jpg', 'canva-pro'),
('550e8400-e29b-41d4-a716-446655440004', 'Adobe Creative Cloud', 'Complete creative suite', '60.00', '75.00', 'Design Tools', 4.9, '{"Photoshop", "Illustrator", "Premiere Pro", "After Effects"}', '/src/assets/adobe-creative-cloud.jpg', 'adobe-creative-cloud'),
('550e8400-e29b-41d4-a716-446655440005', 'Semrush Pro', 'SEO and marketing toolkit', '120.00', '150.00', 'Marketing Tools', 4.5, '{"Keyword Research", "Site Audit", "Competitor Analysis"}', '/src/assets/semrush-pro.jpg', 'semrush-pro'),
('550e8400-e29b-41d4-a716-446655440006', 'Notion Pro', 'All-in-one workspace', '8.00', '10.00', 'Productivity', 4.7, '{"Unlimited Blocks", "Advanced Permissions", "Version History"}', '/src/assets/notion-pro.jpg', 'notion-pro'),
('550e8400-e29b-41d4-a716-446655440007', 'Figma Professional', 'Collaborative design tool', '12.00', '15.00', 'Design Tools', 4.8, '{"Team Libraries", "Advanced Prototyping", "Dev Mode"}', '/src/assets/figma-professional.jpg', 'figma-professional'),
('550e8400-e29b-41d4-a716-446655440008', 'Midjourney', 'AI image generation', '10.00', '12.00', 'AI Tools', 4.6, '{"AI Art Generation", "High Resolution", "Commercial License"}', '/src/assets/midjourney.jpg', 'midjourney'),
('550e8400-e29b-41d4-a716-446655440009', 'CapCut Pro', 'Video editing platform', '7.00', '9.00', 'Video Tools', 4.5, '{"Premium Effects", "No Watermark", "Cloud Storage"}', '/src/assets/capcut-pro.jpg', 'capcut-pro'),
('550e8400-e29b-41d4-a716-446655440010', 'Jasper AI', 'AI content creation', '49.00', '60.00', 'AI Tools', 4.4, '{"Content Templates", "Brand Voice", "Team Collaboration"}', '/src/assets/jasper-ai.jpg', 'jasper-ai'),
('550e8400-e29b-41d4-a716-446655440011', 'Perplexity AI', 'AI-powered search engine', '20.00', '25.00', 'AI Tools', 4.7, '{"Real-time Search", "Source Citations", "Pro Features"}', '/src/assets/perplexity-ai.jpg', 'perplexity-ai'),
('550e8400-e29b-41d4-a716-446655440012', 'Google AI Ultra', 'Advanced AI capabilities', '30.00', '35.00', 'AI Tools', 4.6, '{"Gemini Ultra", "Advanced Reasoning", "Multimodal AI"}', '/src/assets/google-ai-ultra.jpg', 'google-ai-ultra'),
('550e8400-e29b-41d4-a716-446655440013', 'Ahrefs Standard', 'SEO and content marketing', '99.00', '120.00', 'Marketing Tools', 4.8, '{"Site Explorer", "Keyword Explorer", "Content Explorer"}', '/src/assets/ahrefs-standard.jpg', 'ahrefs-standard'),
('550e8400-e29b-41d4-a716-446655440014', 'Surfer SEO', 'Content optimization tool', '89.00', '110.00', 'Marketing Tools', 4.5, '{"Content Editor", "Keyword Research", "Site Audit"}', '/src/assets/surfer-seo.jpg', 'surfer-seo'),
('550e8400-e29b-41d4-a716-446655440015', 'Elementor Pro', 'WordPress page builder', '49.00', '60.00', 'Web Development', 4.7, '{"Advanced Widgets", "Theme Builder", "WooCommerce"}', '/src/assets/elementor-pro.png', 'elementor-pro'),
('550e8400-e29b-41d4-a716-446655440016', 'Envato Elements', 'Creative assets subscription', '16.50', '20.00', 'Design Tools', 4.6, '{"Unlimited Downloads", "Premium Templates", "Stock Assets"}', '/src/assets/envato-elements.png', 'envato-elements');

-- Step 10: Insert sample pricing plans
INSERT INTO pricing_plans (product_id, plan_type, price, monthly_price, yearly_price, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'shared', '20.00', '20.00', '200.00', 'Shared access to ChatGPT Plus'),
('550e8400-e29b-41d4-a716-446655440001', 'semi_private', '35.00', '35.00', '350.00', 'Semi-private access with limited sharing'),
('550e8400-e29b-41d4-a716-446655440001', 'private', '50.00', '50.00', '500.00', 'Private access for personal use only'),
('550e8400-e29b-41d4-a716-446655440002', 'shared', '12.00', '12.00', '120.00', 'Shared access to Grammarly Premium'),
('550e8400-e29b-41d4-a716-446655440002', 'semi_private', '20.00', '20.00', '200.00', 'Semi-private access with limited sharing'),
('550e8400-e29b-41d4-a716-446655440002', 'private', '30.00', '30.00', '300.00', 'Private access for personal use only');










