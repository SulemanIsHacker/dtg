-- Add a test testimonial for Google AI Ultra
-- This will help verify that testimonials are working correctly

INSERT INTO testimonials (
    name,
    role,
    company,
    rating,
    content,
    type,
    product_slug,
    verified,
    date
) VALUES (
    'Sarah Johnson',
    'AI Research Lead',
    'Innovation Labs',
    5,
    'Google AI Ultra has been absolutely incredible for our research projects. The Gemini Ultra model provides incredibly detailed and accurate responses that have revolutionized our workflow. The private access ensures consistent, high-quality results without any limitations. Highly recommended for any serious AI work!',
    'text',
    'google-ai-ultra',
    true,
    CURRENT_DATE
) ON CONFLICT DO NOTHING;

-- Also add another testimonial for variety
INSERT INTO testimonials (
    name,
    role,
    company,
    rating,
    content,
    type,
    product_slug,
    verified,
    date
) VALUES (
    'Michael Chen',
    'Data Scientist',
    'TechCorp Solutions',
    4,
    'The Google AI Ultra access has been very helpful for our data analysis tasks. The model provides excellent insights and the response quality is consistently high. The private access is definitely worth it for professional use.',
    'text',
    'google-ai-ultra',
    true,
    CURRENT_DATE
) ON CONFLICT DO NOTHING;

-- Check if the testimonials were added
SELECT 
    id,
    name,
    role,
    company,
    rating,
    content,
    type,
    product_slug,
    verified,
    date,
    created_at
FROM testimonials 
WHERE product_slug = 'google-ai-ultra'
ORDER BY created_at DESC;





