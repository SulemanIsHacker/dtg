-- Simple script to add testimonials to database
-- This assumes RLS policies are already properly configured

-- Insert testimonials for Google AI Ultra
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
) VALUES 
(
    'Sarah Johnson',
    'AI Research Lead',
    'Innovation Labs',
    5,
    'Google AI Ultra has been absolutely incredible for our research projects. The Gemini Ultra model provides incredibly detailed and accurate responses that have revolutionized our workflow. The private access ensures consistent, high-quality results without any limitations. Highly recommended for any serious AI work!',
    'text',
    'google-ai-ultra',
    true,
    CURRENT_DATE
),
(
    'Michael Chen',
    'Data Scientist',
    'TechCorp Solutions',
    4,
    'The Google AI Ultra access has been very helpful for our data analysis tasks. The model provides excellent insights and the response quality is consistently high. The private access is definitely worth it for professional use.',
    'text',
    'google-ai-ultra',
    true,
    CURRENT_DATE
),
(
    'Emma Rodriguez',
    'SEO Specialist',
    'Digital Marketing Pro',
    5,
    'SEMRush has been a game-changer for our SEO campaigns. The keyword research tools are incredibly powerful and the competitor analysis features have given us a huge advantage. The shared access makes it affordable for our team.',
    'text',
    'semrush',
    true,
    CURRENT_DATE
)
ON CONFLICT DO NOTHING;

-- Check if testimonials were added
SELECT 
    product_slug,
    name,
    rating,
    verified,
    created_at
FROM testimonials 
WHERE product_slug IN ('google-ai-ultra', 'semrush')
ORDER BY created_at DESC;





