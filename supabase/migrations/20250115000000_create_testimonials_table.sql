-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'video', 'image')),
    video_url TEXT,
    image_url TEXT,
    product_slug VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT false,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on product_slug for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_product_slug ON testimonials(product_slug);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_testimonials_type ON testimonials(type);

-- Create index on verified status
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON testimonials(verified);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read testimonials
CREATE POLICY "Allow authenticated users to read testimonials" ON testimonials
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow only admins to insert testimonials
CREATE POLICY "Allow admins to insert testimonials" ON testimonials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create policy to allow only admins to update testimonials
CREATE POLICY "Allow admins to update testimonials" ON testimonials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create policy to allow only admins to delete testimonials
CREATE POLICY "Allow admins to delete testimonials" ON testimonials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
