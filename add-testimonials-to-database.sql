-- Add testimonials directly to the database
-- Run this in your Supabase SQL Editor

-- First, let's temporarily disable RLS to insert testimonials
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;

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
);

-- Re-enable RLS with proper policies
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow admins to insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow admins to update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow admins to delete testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view verified testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow all operations for testing" ON testimonials;

-- Create clean policies
-- 1. Public can view verified testimonials
CREATE POLICY "Public can view verified testimonials" ON testimonials
    FOR SELECT USING (verified = true);

-- 2. Admin can manage all testimonials
CREATE POLICY "Admin can manage testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'toolsystorecontact@gmail.com'
        )
    );

-- 3. Allow authenticated users to insert testimonials
CREATE POLICY "Authenticated users can insert testimonials" ON testimonials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the testimonials were added
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
WHERE product_slug IN ('google-ai-ultra', 'semrush')
ORDER BY created_at DESC;

-- Check the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'testimonials'
ORDER BY policyname;





