-- Add separate field for testimonial content photos
-- This separates customer profile photos from testimonial content photos

-- Add testimonial content photo columns
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS testimonial_content_photo_url TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS testimonial_content_photo_path TEXT;

-- Rename existing customer photo columns to be more specific
-- (These will remain for customer profile photos if needed in the future)
-- customer_photo_url and customer_photo_path will stay as they are for profile photos
