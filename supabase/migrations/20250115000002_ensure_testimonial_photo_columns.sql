-- Ensure customer photo columns exist in testimonials table
-- This migration ensures the testimonials table has the required photo columns

-- Add customer photo columns if they don't exist
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS customer_photo_url TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS customer_photo_path TEXT;

-- Update the table to ensure all constraints are properly set
-- This will help identify any schema issues

-- Check if the table structure is correct
DO $$
BEGIN
    -- Verify required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' 
        AND column_name = 'customer_photo_url'
    ) THEN
        RAISE EXCEPTION 'customer_photo_url column missing from testimonials table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' 
        AND column_name = 'customer_photo_path'
    ) THEN
        RAISE EXCEPTION 'customer_photo_path column missing from testimonials table';
    END IF;
    
    RAISE NOTICE 'Testimonials table structure verified successfully';
END $$;
