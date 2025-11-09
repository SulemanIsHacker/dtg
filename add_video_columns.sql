-- Add video support to products table
-- Run this SQL in your Supabase SQL Editor

-- Add video_url column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add video_thumbnail_url column to products table  
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Add comments to explain the new fields
COMMENT ON COLUMN public.products.video_url IS 'URL to product demonstration video (YouTube, Vimeo, or direct video file)';
COMMENT ON COLUMN public.products.video_thumbnail_url IS 'Custom thumbnail URL for the video (optional, will use video platform thumbnail if not provided)';

-- Create index for better query performance on video fields
CREATE INDEX IF NOT EXISTS idx_products_video_url ON public.products(video_url) WHERE video_url IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('video_url', 'video_thumbnail_url');
