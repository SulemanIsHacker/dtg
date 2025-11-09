-- Update testimonials table to ensure it has all required columns
-- This migration ensures the testimonials table is properly structured for the new testimonial system

-- Create testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'video', 'image')),
    video_url TEXT,
    image_url TEXT,
    product_slug VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT false,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_product_slug ON testimonials(product_slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON testimonials(verified);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view verified testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow all operations for testing" ON testimonials;

-- Policy for public read access to verified testimonials
CREATE POLICY "Public can view verified testimonials" ON testimonials
    FOR SELECT USING (verified = true);

-- Policy for admin full access
CREATE POLICY "Admins can manage all testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'toolsystorecontact@gmail.com'
        )
    );

-- Policy for authenticated users to manage testimonials (fallback)
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Temporary policy to allow all operations for testing (remove this in production)
CREATE POLICY "Allow all operations for testing" ON testimonials
    FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- No sample data - testimonials will be added through the admin panel
