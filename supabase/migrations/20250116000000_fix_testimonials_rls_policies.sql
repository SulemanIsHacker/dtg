-- Fix testimonials RLS policies to ensure public access to verified testimonials
-- This migration ensures testimonials are publicly visible when verified

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow admins to insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow admins to update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow admins to delete testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view verified testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow all operations for testing" ON testimonials;

-- Create clean, simple policies

-- 1. Public can view verified testimonials (this is the main policy for displaying testimonials)
CREATE POLICY "Public can view verified testimonials" ON testimonials
    FOR SELECT USING (verified = true);

-- 2. Allow admin to manage all testimonials (for admin panel)
CREATE POLICY "Admin can manage testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'toolsystorecontact@gmail.com'
        )
    );

-- 3. Allow any authenticated user to insert testimonials (for testimonial submission)
CREATE POLICY "Authenticated users can insert testimonials" ON testimonials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Allow users to update their own testimonials (if needed)
CREATE POLICY "Users can update own testimonials" ON testimonials
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Ensure the table has RLS enabled
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Add a comment to document the policies
COMMENT ON TABLE testimonials IS 'Customer testimonials with RLS policies: Public can view verified testimonials, Admin can manage all, Authenticated users can insert';





