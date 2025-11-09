-- Add video support to products table
-- This adds fields for video URLs and video thumbnails

-- Add video_url column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Add comments to explain the new fields
COMMENT ON COLUMN public.products.video_url IS 'URL to product demonstration video (YouTube, Vimeo, or direct video file)';
COMMENT ON COLUMN public.products.video_thumbnail_url IS 'Custom thumbnail URL for the video (optional, will use video platform thumbnail if not provided)';

-- Create index for better query performance on video fields
CREATE INDEX IF NOT EXISTS idx_products_video_url ON public.products(video_url) WHERE video_url IS NOT NULL;
