-- Fix testimonials RLS policies to ensure public access
-- Run this directly in your Supabase SQL editor

-- Drop all existing policies
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

-- Verify the policies were created
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





