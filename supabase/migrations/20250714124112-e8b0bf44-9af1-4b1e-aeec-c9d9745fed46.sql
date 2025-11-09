-- Insert new products
INSERT INTO public.products (name, slug, description, detailed_description, price, original_price, category, rating, features, main_image_url) VALUES

-- Envato Elements
('Envato Elements', 'envato-elements', 'Access to premium assets (templates, videos, graphics, fonts)', 'Monthly shared access to over 10 million creative assets including templates, videos, graphics, and fonts. Perfect for designers, content creators, and marketers who need professional-quality assets at an affordable price. Shared account with download limits may apply.', '1300 PKR', '1300 PKR', 'Design & Creative', 4.6, ARRAY['Access to premium assets (templates, videos, graphics, fonts)', 'Shared account – download limits may apply', 'Ideal for designers, content creators & marketers', 'Monthly affordable access to 10M+ creative assets'], '/src/assets/envato-elements.png'),

-- Elementor Pro
('Elementor Pro', 'elementor-pro', 'All pro widgets & templates unlocked for WordPress', 'Private yearly license for Elementor Pro, the leading WordPress page builder. Get access to all pro widgets, templates, and advanced features. Perfect for WordPress users and web developers who want to create stunning websites without coding. Includes one year of updates and support.', '3000 PKR', '3000 PKR', 'Web Development', 4.7, ARRAY['Private license – only you will have access', 'All pro widgets & templates unlocked', 'One year updates & support included', 'Ideal for WordPress users & web developers'], '/src/assets/elementor-pro.png'),

-- Google AI Ultra
('Google AI Ultra', 'google-ai-ultra', 'Access Gemini Ultra (Google''s top AI model)', 'Private monthly access to Google''s most advanced AI model, Gemini Ultra. Perfect for professionals, agencies, and researchers who need top-tier AI capabilities for advanced content creation, code generation, and research tasks. Full speed access with no restrictions.', '10000 PKR', '10000 PKR', 'AI & Machine Learning', 4.8, ARRAY['Access Gemini Ultra (Google''s top AI model)', 'Ideal for advanced content, code, and research tasks', 'Private account – full speed, no restrictions', 'Great for professionals, agencies, and researchers'], '/src/assets/google-ai-ultra.jpg'),

-- SEMRush
('SEMRush', 'semrush', 'Shared access to premium SEO tools', 'Budget-friendly shared access to SEMRush''s comprehensive SEO toolkit including keyword research, backlink analysis, site audits, and competitor analysis. Perfect for bloggers, marketers, and SEO freelancers who need professional SEO insights without the full cost. Limited usage based on shared plan.', '1200 PKR', '1200 PKR', 'SEO & Marketing', 4.5, ARRAY['Shared access to SEO tools (keywords, backlinks, site audits)', 'Perfect for bloggers, marketers & SEO freelancers', 'Budget-friendly access to premium features', 'Limited usage based on shared plan'], '/src/assets/semrush-new.png'),

-- Perplexity AI
('Perplexity AI', 'perplexity-ai', 'AI-powered research and Q&A tool', 'Advanced AI-powered research tool that provides accurate answers with citations. Available in both shared monthly and private yearly plans. Perfect for students, researchers, and content creators who need reliable AI assistance for research, fact-checking, and content creation.', '1000 PKR', '3000 PKR', 'AI & Machine Learning', 4.6, ARRAY['Unlimited AI-powered Q&A and research tool', 'Great for students, researchers & content creators', 'Pro features like file upload, GPT-4, citations', 'Available in shared and private plans'], '/src/assets/perplexity-ai.jpg');

-- Insert pricing plans for these products
INSERT INTO public.pricing_plans (product_id, plan_type, price, monthly_price, yearly_price, description, is_enabled) 
SELECT 
    p.id,
    'shared',
    '1300 PKR',
    '1300 PKR',
    NULL,
    'Monthly shared access with download limits',
    true
FROM public.products p WHERE p.slug = 'envato-elements'

UNION ALL

SELECT 
    p.id,
    'private',
    '3000 PKR',
    NULL,
    '3000 PKR',
    'Private yearly license with full access',
    true
FROM public.products p WHERE p.slug = 'elementor-pro'

UNION ALL

SELECT 
    p.id,
    'private',
    '10000 PKR',
    '10000 PKR',
    NULL,
    'Private monthly access to Gemini Ultra',
    true
FROM public.products p WHERE p.slug = 'google-ai-ultra'

UNION ALL

SELECT 
    p.id,
    'shared',
    '1200 PKR',
    '1200 PKR',
    NULL,
    'Shared access with usage limits',
    true
FROM public.products p WHERE p.slug = 'semrush'

UNION ALL

SELECT 
    p.id,
    'shared',
    '1000 PKR',
    '1000 PKR',
    NULL,
    'Shared access with some limits',
    true
FROM public.products p WHERE p.slug = 'perplexity-ai'

UNION ALL

SELECT 
    p.id,
    'private',
    '3000 PKR',
    NULL,
    '3000 PKR',
    'Private access with full Pro features',
    true
FROM public.products p WHERE p.slug = 'perplexity-ai';