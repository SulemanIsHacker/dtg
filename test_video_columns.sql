-- Test if video columns exist in products table
-- Run this in your Supabase SQL Editor

-- Check if columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('video_url', 'video_thumbnail_url');

-- If columns don't exist, add them:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Test inserting a video URL (replace with actual product ID)
-- UPDATE public.products 
-- SET video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
-- WHERE id = 'your-product-id-here';
