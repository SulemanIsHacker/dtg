-- Debug script to check testimonials for AI Ultra and add a test testimonial if needed

-- First, let's check if there are any testimonials for google-ai-ultra
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

-- Check all testimonials to see what's in the database
SELECT 
    product_slug,
    COUNT(*) as testimonial_count,
    COUNT(CASE WHEN verified = true THEN 1 END) as verified_count
FROM testimonials 
GROUP BY product_slug
ORDER BY testimonial_count DESC;

-- If no testimonials exist for google-ai-ultra, we can add a test one
-- (Uncomment the following lines if you want to add a test testimonial)

/*
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
    'John Smith',
    'AI Researcher',
    'Tech Innovations Inc.',
    5,
    'Google AI Ultra has been a game-changer for our research projects. The Gemini Ultra model provides incredibly accurate and detailed responses that have significantly improved our productivity. The private access ensures we get consistent, high-quality results without any limitations.',
    'text',
    'google-ai-ultra',
    true,
    CURRENT_DATE
);
*/

-- Check the current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'testimonials';





